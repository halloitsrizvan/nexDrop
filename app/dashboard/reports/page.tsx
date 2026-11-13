import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { formatInr } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IndianRupee, ShoppingBag, Calculator, Globe } from "lucide-react";

export default async function DashboardReportsPage() {
  const { shop } = await requireShopContext();

  const [orders, topItemsRaw] = await Promise.all([
    prisma.order.findMany({
      where: { shopId: shop.id, status: { not: "CANCELLED" } },
      select: { channel: true, total: true, subtotal: true, discount: true },
    }),
    prisma.orderItem.groupBy({
      by: ["name", "sku"],
      where: { order: { shopId: shop.id, status: { not: "CANCELLED" } } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    }),
  ]);

  const totalSales = orders.reduce((s, o) => s + Number(o.total), 0);
  const posOrders = orders.filter((o) => o.channel === "POS");
  const posSales = posOrders.reduce((s, o) => s + Number(o.total), 0);
  const onlineOrders = orders.filter((o) => o.channel === "ONLINE");
  const onlineSales = onlineOrders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sales & Analytics Reports
        </h1>
        <p className="text-xs text-slate-500">
          Operational summaries, channel splits, and product performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
              Total Revenue
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatInr(totalSales)}
            </div>
            <p className="text-xs text-slate-500 mt-1">{orders.length} total sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
              POS Billing Share
            </CardTitle>
            <Calculator className="h-4 w-4 text-purple-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatInr(posSales)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {posOrders.length} walk-in sales (
              {orders.length > 0 ? Math.round((posOrders.length / orders.length) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
              Storefront Online Share
            </CardTitle>
            <Globe className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatInr(onlineSales)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {onlineOrders.length} online orders (
              {orders.length > 0 ? Math.round((onlineOrders.length / orders.length) * 100) : 0}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best-selling products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Top Performing Products</CardTitle>
          <CardDescription className="text-xs">
            Ranked by units sold across POS counter and online storefront
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Units Sold</TableHead>
                <TableHead className="text-right">Revenue Generated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topItemsRaw.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-xs text-slate-900">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-500">
                    {item.sku}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs font-bold text-slate-800">
                    {item._sum.quantity}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs text-slate-900">
                    {formatInr(Number(item._sum.lineTotal ?? 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
