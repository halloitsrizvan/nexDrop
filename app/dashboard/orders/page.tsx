import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { OrdersView } from "@/components/orders-view";

export default async function DashboardOrdersPage() {
  const { shop } = await requireShopContext();

  const ordersRaw = await prisma.order.findMany({
    where: { shopId: shop.id },
    include: {
      customer: { select: { name: true } },
      cashier: { select: { name: true } },
      items: { select: { id: true } },
      payment: { select: { method: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const orders = ordersRaw.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    channel: o.channel,
    status: o.status,
    total: Number(o.total),
    itemCount: o.items.length,
    customerName:
      o.customer?.name ?? (o.channel === "POS" ? "Walk-in Customer" : "Guest"),
    createdAt: o.createdAt.toISOString(),
    paymentMethod: o.payment?.method ?? "COD",
  }));

  return <OrdersView orders={orders} />;
}
