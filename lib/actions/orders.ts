"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { requireShopContext } from "@/lib/permissions";
import { createPosSale, transitionOrder } from "@/lib/services/orders";

export async function createPosSaleAction(data: {
  items: { productId: string; quantity: number }[];
  method: PaymentMethod;
  discount?: number;
}) {
  const { shop, user } = await requireShopContext();

  if (!data.items || data.items.length === 0) {
    return { error: "Cart is empty" };
  }

  try {
    const order = await createPosSale({
      shopId: shop.id,
      cashierId: user.id,
      items: data.items,
      method: data.method,
      discount: data.discount,
    });

    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
      },
    };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to complete POS sale",
    };
  }
}

export async function updateOrderStatusAction(data: {
  orderId: string;
  nextStatus: OrderStatus;
  note?: string;
}) {
  const { shop, user } = await requireShopContext();

  try {
    await transitionOrder(shop.id, data.orderId, data.nextStatus, data.note, user.id);

    revalidatePath(`/dashboard/orders/${data.orderId}`);
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Failed to update order status",
    };
  }
}
