import { Prisma, StockMovementType } from "@prisma/client";
import { prisma } from "@/lib/db";

type Tx = Prisma.TransactionClient;

export async function changeStock(
  tx: Tx,
  input: {
    shopId: string;
    productId: string;
    type: StockMovementType;
    quantity: number;
    reason: string;
    userId?: string;
    orderId?: string;
  },
) {
  if (input.quantity <= 0) {
    throw new Error("Quantity must be positive");
  }

  const inventory = await tx.inventory.findUnique({
    where: { productId: input.productId },
  });
  if (!inventory || inventory.shopId !== input.shopId) {
    throw new Error("Inventory not found");
  }

  let next = inventory.quantity;
  if (input.type === "ADDED") next += input.quantity;
  else if (input.type === "DEDUCTED") next -= input.quantity;
  else next = input.quantity;

  if (next < 0) {
    throw new Error("Insufficient stock");
  }

  await tx.inventory.update({
    where: { id: inventory.id },
    data: { quantity: next },
  });

  await tx.stockMovement.create({
    data: {
      shopId: input.shopId,
      inventoryId: inventory.id,
      type: input.type,
      quantity: input.quantity,
      reason: input.reason,
      userId: input.userId,
      orderId: input.orderId,
    },
  });

  return next;
}
