import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { orderNumber, productPrice } from "@/lib/utils";
import { changeStock } from "@/lib/services/inventory";

const DEDUCT_ON: OrderStatus[] = ["CONFIRMED", "PROCESSING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED"];
const RESTOCK_ON: OrderStatus[] = ["CANCELLED", "REFUNDED"];

export async function transitionOrder(
  shopId: string,
  orderId: string,
  next: OrderStatus,
  note?: string,
  userId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, shopId },
      include: { items: true },
    });
    if (!order) throw new Error("Order not found");
    if (order.status === next) return order;

    if (DEDUCT_ON.includes(next) && !order.stockDeducted) {
      for (const item of order.items) {
        if (!item.productId) continue;
        await changeStock(tx, {
          shopId,
          productId: item.productId,
          type: "DEDUCTED",
          quantity: item.quantity,
          reason: `Order ${order.orderNumber}`,
          userId,
          orderId: order.id,
        });
      }
    }

    if (RESTOCK_ON.includes(next) && order.stockDeducted) {
      for (const item of order.items) {
        if (!item.productId) continue;
        await changeStock(tx, {
          shopId,
          productId: item.productId,
          type: "ADDED",
          quantity: item.quantity,
          reason: `Restock ${order.orderNumber}`,
          userId,
          orderId: order.id,
        });
      }
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: next,
        stockDeducted: DEDUCT_ON.includes(next)
          ? true
          : RESTOCK_ON.includes(next)
            ? false
            : order.stockDeducted,
      },
    });

    await tx.orderStatusHistory.create({
      data: { orderId: order.id, status: next, note },
    });

    return updated;
  });
}

export async function createPosSale(input: {
  shopId: string;
  cashierId: string;
  items: { productId: string; quantity: number }[];
  method: PaymentMethod;
  discount?: number;
}) {
  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((i) => i.productId) }, shopId: input.shopId },
      include: { inventory: true, variants: true },
    });
    if (products.length !== input.items.length) {
      throw new Error("One or more products are invalid");
    }

    let subtotal = 0;
    const lines: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const row of input.items) {
      const product = products.find((p) => p.id === row.productId);
      if (!product) throw new Error("Product missing");
      const unit = productPrice(product);
      const lineTotal = unit * row.quantity;
      subtotal += lineTotal;
      lines.push({
        product: { connect: { id: product.id } },
        variant: product.variants[0]?.id ? { connect: { id: product.variants[0].id } } : undefined,
        name: product.name,
        sku: product.sku,
        quantity: row.quantity,
        unitPrice: unit,
        lineTotal,
      });
    }

    const discount = input.discount ?? 0;
    const total = Math.max(0, subtotal - discount);
    const number = orderNumber();

    const order = await tx.order.create({
      data: {
        orderNumber: number,
        shopId: input.shopId,
        cashierId: input.cashierId,
        channel: "POS",
        status: "DELIVERED",
        subtotal,
        discount,
        deliveryCharge: 0,
        total,
        stockDeducted: true,
        items: { create: lines },
        history: { create: { status: "DELIVERED", note: "POS sale" } },
        payment: {
          create: {
            shopId: input.shopId,
            method: input.method,
            status: "RECORDED",
            amount: total,
            notes: "POS",
          },
        },
      },
    });

    for (const row of input.items) {
      await changeStock(tx, {
        shopId: input.shopId,
        productId: row.productId,
        type: "DEDUCTED",
        quantity: row.quantity,
        reason: `POS ${number}`,
        userId: input.cashierId,
        orderId: order.id,
      });
    }

    await tx.activityLog.create({
      data: {
        shopId: input.shopId,
        userId: input.cashierId,
        action: "POS_SALE",
        meta: order.id,
      },
    });

    return order;
  });
}

export async function createOnlineOrder(input: {
  shopId: string;
  customerId: string;
  addressId: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
}) {
  return prisma.$transaction(async (tx) => {
    const shop = await tx.shop.findUnique({
      where: { id: input.shopId },
      include: { settings: true },
    });
    if (!shop || shop.status !== "ACTIVE" || !shop.settings?.storeOpen) {
      throw new Error("Shop is not accepting orders");
    }

    const cart = await tx.cart.findUnique({
      where: { userId_shopId: { userId: input.customerId, shopId: input.shopId } },
      include: { items: { include: { product: { include: { inventory: true, variants: true } } } } },
    });
    if (!cart || cart.items.length === 0) throw new Error("Cart is empty");

    const address = await tx.address.findFirst({
      where: { id: input.addressId, userId: input.customerId },
    });
    if (!address) throw new Error("Address not found");

    let subtotal = 0;
    const lines: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const item of cart.items) {
      const available = item.product.inventory?.quantity ?? 0;
      if (available < item.quantity) {
        throw new Error(`${item.product.name} does not have enough stock`);
      }
      const unit = productPrice(item.product);
      const lineTotal = unit * item.quantity;
      subtotal += lineTotal;
      lines.push({
        product: { connect: { id: item.product.id } },
        variant: (item.variantId || item.product.variants[0]?.id)
          ? { connect: { id: (item.variantId || item.product.variants[0]?.id)! } }
          : undefined,
        name: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: unit,
        lineTotal,
      });
    }

    let discount = 0;
    if (input.couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { shopId_code: { shopId: input.shopId, code: input.couponCode.toUpperCase() } },
      });
      if (!coupon || !coupon.active) throw new Error("Invalid coupon");
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error("Coupon expired");
      if (subtotal < Number(coupon.minOrder)) throw new Error("Order below coupon minimum");
      discount =
        coupon.type === "PERCENT"
          ? (subtotal * Number(coupon.value)) / 100
          : Number(coupon.value);
    }

    const minOrder = Number(shop.settings.minOrderValue);
    if (subtotal < minOrder) {
      throw new Error(`Minimum order is ${minOrder}`);
    }

    let delivery = 0;
    if (shop.settings.deliveryEnabled) {
      const freeAbove = shop.settings.freeDeliveryAbove
        ? Number(shop.settings.freeDeliveryAbove)
        : null;
      if (freeAbove && subtotal >= freeAbove) delivery = 0;
      else delivery = Number(shop.settings.deliveryCharge);
    }

    const total = Math.max(0, subtotal - discount + delivery);
    const method = input.paymentMethod === "COD" ? "COD" : input.paymentMethod;
    if (method === "ONLINE") {
      throw new Error("Online payments are not enabled yet");
    }

    const order = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        shopId: input.shopId,
        customerId: input.customerId,
        addressId: address.id,
        channel: "ONLINE",
        status: "PENDING",
        subtotal,
        discount,
        deliveryCharge: delivery,
        total,
        couponCode: input.couponCode?.toUpperCase(),
        stockDeducted: false,
        items: { create: lines },
        history: { create: { status: "PENDING", note: "Placed online" } },
        payment: {
          create: {
            shopId: input.shopId,
            method,
            status: method === "COD" ? "PENDING" : "RECORDED",
            amount: total,
          },
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.activityLog.create({
      data: {
        shopId: input.shopId,
        userId: input.customerId,
        action: "ORDER_PLACED",
        meta: order.id,
      },
    });

    return order;
  });
}

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  RECORDED: "Recorded",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};
