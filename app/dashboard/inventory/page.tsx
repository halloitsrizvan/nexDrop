import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { InventoryManager } from "@/components/inventory-manager";

export default async function DashboardInventoryPage() {
  const { shop } = await requireShopContext();

  const [inventoryRaw, movementsRaw] = await Promise.all([
    prisma.inventory.findMany({
      where: { shopId: shop.id },
      include: {
        product: { select: { id: true, name: true, sku: true, price: true } },
      },
      orderBy: { quantity: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: { shopId: shop.id },
      include: {
        inventory: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const inventoryItems = inventoryRaw.map((inv) => ({
    id: inv.id,
    productId: inv.productId,
    productName: inv.product.name,
    sku: inv.product.sku,
    price: Number(inv.product.price),
    quantity: inv.quantity,
  }));

  const recentMovements = movementsRaw.map((m) => ({
    id: m.id,
    type: m.type,
    quantity: m.quantity,
    reason: m.reason,
    createdAt: m.createdAt.toISOString(),
    productName: m.inventory.product.name,
    sku: m.inventory.product.sku,
    userName: m.user?.name,
  }));

  return (
    <InventoryManager
      inventoryItems={inventoryItems}
      recentMovements={recentMovements}
    />
  );
}
