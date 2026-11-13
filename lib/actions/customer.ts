"use server";

import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { requireSession } from "@/lib/permissions";
import { createOnlineOrder, transitionOrder } from "@/lib/services/orders";
import { addressSchema } from "@/lib/validations";

export async function addToCartAction(shopId: string, productId: string, quantity: number = 1) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: true, guest: true };
  }
  const user = session.user;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  });
  if (!product || product.shopId !== shopId || product.status !== "ACTIVE") {
    return { error: "Product is not available" };
  }

  const stock = product.inventory?.quantity ?? 0;
  if (stock < quantity) {
    return { error: "Insufficient stock available" };
  }

  let cart = await prisma.cart.findUnique({
    where: { userId_shopId: { userId: user.id, shopId } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: user.id, shopId },
    });
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_variantId: {
        cartId: cart.id,
        productId,
        variantId: "", // null in schema
      },
    },
  }).catch(() => null) || await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    const nextQty = existingItem.quantity + quantity;
    if (nextQty > stock) {
      return { error: `Only ${stock} units available in stock` };
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: nextQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (shop) {
    revalidatePath(`/shop/${shop.slug}`);
    revalidatePath(`/shop/${shop.slug}/cart`);
  }
  return { success: true };
}

export async function updateCartItemQtyAction(cartItemId: string, quantity: number) {
  const user = await requireSession();

  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true, product: { include: { inventory: true } } },
  });
  if (!item || item.cart.userId !== user.id) {
    return { error: "Cart item not found" };
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    const stock = item.product.inventory?.quantity ?? 0;
    if (quantity > stock) {
      return { error: `Only ${stock} items available in stock` };
    }
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  const shop = await prisma.shop.findUnique({ where: { id: item.cart.shopId } });
  if (shop) {
    revalidatePath(`/shop/${shop.slug}`);
    revalidatePath(`/shop/${shop.slug}/cart`);
  }
  return { success: true };
}

export async function toggleWishlistAction(shopId: string, productId: string) {
  const user = await requireSession();

  let wishlist = await prisma.wishlist.findUnique({
    where: { userId_shopId: { userId: user.id, shopId } },
  });
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId: user.id, shopId },
    });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });
  }

  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (shop) {
    revalidatePath(`/shop/${shop.slug}`);
    revalidatePath(`/shop/${shop.slug}/wishlist`);
    revalidatePath("/account/wishlist");
  }
  return { saved: !existing };
}

export async function createAddressAction(formData: FormData) {
  const user = await requireSession();

  const parsed = addressSchema.safeParse({
    label: formData.get("label") || "Home",
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state") || "Kerala",
    pinCode: formData.get("pinCode"),
    phone: formData.get("phone") || undefined,
    isDefault: formData.get("isDefault") === "true" || formData.get("isDefault") === "on",
  });
  if (!parsed.success) {
    return { error: "Please check address fields" };
  }

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: parsed.data.label,
      line1: parsed.data.line1,
      line2: parsed.data.line2,
      city: parsed.data.city,
      state: parsed.data.state,
      pinCode: parsed.data.pinCode,
      phone: parsed.data.phone,
      isDefault: parsed.data.isDefault,
    },
  });

  revalidatePath("/account/addresses");
  return { success: true, addressId: address.id };
}

export async function placeOnlineOrderAction(data: {
  shopId: string;
  addressId: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
}) {
  const user = await requireSession();

  try {
    const order = await createOnlineOrder({
      shopId: data.shopId,
      customerId: user.id,
      addressId: data.addressId,
      couponCode: data.couponCode,
      paymentMethod: data.paymentMethod,
    });

    const shop = await prisma.shop.findUnique({ where: { id: data.shopId } });

    revalidatePath(`/shop/${shop?.slug}/cart`);
    revalidatePath("/account/orders");
    revalidatePath("/dashboard/orders");

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to place order" };
  }
}

export async function placeGuestOrderAction(data: {
  shopId: string;
  customerName: string;
  phone: string;
  email?: string;
  address: {
    line1: string;
    city: string;
    state?: string;
    pinCode: string;
  };
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  notes?: string;
}) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: data.shopId },
      include: { settings: true },
    });
    if (!shop || shop.status !== "ACTIVE" || !shop.settings?.storeOpen) {
      return { error: "Shop is currently not accepting orders" };
    }

    if (!data.items || data.items.length === 0) {
      return { error: "Cart is empty" };
    }

    if (!data.customerName?.trim() || !data.phone?.trim() || !data.address?.line1?.trim()) {
      return { error: "Please enter your name, phone number, and delivery address" };
    }

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, shopId: data.shopId, status: "ACTIVE" },
      include: { inventory: true },
    });

    if (products.length === 0) {
      return { error: "Selected items are not available" };
    }

    let subtotal = 0;
    const lines = [];

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      const available = product.inventory?.quantity ?? 0;
      if (available < item.quantity) {
        return { error: `${product.name} only has ${available} items in stock` };
      }
      const unit = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
      const lineTotal = unit * item.quantity;
      subtotal += lineTotal;
      lines.push({
        product: { connect: { id: product.id } },
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: unit,
        lineTotal,
      });
    }

    const minOrder = Number(shop.settings?.minOrderValue ?? 0);
    if (subtotal < minOrder) {
      return { error: `Minimum order value is ₹${minOrder}` };
    }

    let delivery = 0;
    if (shop.settings?.deliveryEnabled) {
      const freeAbove = shop.settings.freeDeliveryAbove
        ? Number(shop.settings.freeDeliveryAbove)
        : null;
      if (freeAbove && subtotal >= freeAbove) delivery = 0;
      else delivery = Number(shop.settings.deliveryCharge ?? 40);
    }

    const total = subtotal + delivery;

    // Check or find/create a guest User
    const rawPhone = data.phone.trim();
    const phoneDigits = rawPhone.replace(/[^0-9]/g, "");
    const sanitizedEmail = data.email?.trim() || `guest_${phoneDigits || Date.now()}@nexdrop.local`;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: rawPhone },
          { email: sanitizedEmail },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: data.customerName.trim(),
          phone: rawPhone,
          email: sanitizedEmail,
          role: "CUSTOMER",
        },
      });
    }

    // Create guest delivery address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: "Guest Delivery",
        line1: data.address.line1.trim(),
        city: data.address.city.trim() || "Kochi",
        state: data.address.state?.trim() || "Kerala",
        pinCode: data.address.pinCode.trim() || "682001",
        phone: rawPhone,
        isDefault: false,
      },
    });

    const now = new Date();
    const orderNum = `ND-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNum,
        shopId: data.shopId,
        customerId: user.id,
        addressId: address.id,
        channel: "ONLINE",
        status: "PENDING",
        subtotal,
        discount: 0,
        deliveryCharge: delivery,
        total,
        notes: `Guest Order: ${data.customerName.trim()} | Phone: ${rawPhone}` + (data.notes ? ` | Notes: ${data.notes.trim()}` : ""),
        stockDeducted: false,
        items: { create: lines },
        history: { create: { status: "PENDING", note: "Guest online order placed (No sign up required)" } },
        payment: {
          create: {
            shopId: data.shopId,
            method: data.paymentMethod === "UPI" ? "UPI" : "COD",
            status: "PENDING",
            amount: total,
          },
        },
      },
    });

    revalidatePath(`/shop/${shop.slug}`);
    revalidatePath(`/shop/${shop.slug}/cart`);
    revalidatePath("/dashboard/orders");

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to place guest order" };
  }
}

export async function cancelCustomerOrderAction(orderId: string, reason: string) {
  const user = await requireSession();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order || order.customerId !== user.id) {
    return { error: "Order not found" };
  }
  if (order.status !== "PENDING") {
    return { error: "Order can only be cancelled while PENDING confirmation" };
  }

  await transitionOrder(order.shopId, order.id, "CANCELLED", `Customer cancelled: ${reason}`, user.id);

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function requestOrderReturnAction(orderId: string, reason: string) {
  const user = await requireSession();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order || order.customerId !== user.id) {
    return { error: "Order not found" };
  }
  if (order.status !== "DELIVERED") {
    return { error: "Return can only be requested for delivered orders" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.returnRequest.create({
      data: {
        shopId: order.shopId,
        orderId: order.id,
        userId: user.id,
        reason,
        status: "OPEN",
      },
    });
    await tx.order.update({
      where: { id: order.id },
      data: { status: "RETURN_REQUESTED" },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "RETURN_REQUESTED",
        note: `Customer return requested: ${reason}`,
      },
    });
  });

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath("/dashboard/orders");
  return { success: true };
}
