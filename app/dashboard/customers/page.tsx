import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { formatInr } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

export default async function DashboardCustomersPage() {
  const { shop } = await requireShopContext();

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id, customerId: { not: null } },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  const customerMap = new Map<
    string,
    { name: string; email: string; phone: string | null; orders: number; totalSpend: number }
  >();

  for (const o of orders) {
    if (!o.customer) continue;
    const existing = customerMap.get(o.customer.id);
    if (existing) {
      existing.orders += 1;
      existing.totalSpend += Number(o.total);
    } else {
      customerMap.set(o.customer.id, {
        name: o.customer.name ?? "Customer",
        email: o.customer.email,
        phone: o.customer.phone,
        orders: 1,
        totalSpend: Number(o.total),
      });
    }
  }

  const customers = Array.from(customerMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
        <p className="text-xs text-slate-500">
          Shoppers who have ordered from {shop.name} online
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <p className="text-xs text-slate-500 py-12 text-center">
              No online customers recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-center">Orders Placed</TableHead>
                  <TableHead className="text-right">Total Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-semibold text-xs text-slate-900">
                      {c.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{c.email}</TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {c.phone ?? "—"}
                    </TableCell>
                    <TableCell className="text-center text-xs font-mono">
                      {c.orders}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs font-mono text-slate-900">
                      {formatInr(c.totalSpend)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
