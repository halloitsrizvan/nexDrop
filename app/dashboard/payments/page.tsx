import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { formatInr } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard } from "lucide-react";

export default async function DashboardPaymentsPage() {
  const { shop } = await requireShopContext();

  const payments = await prisma.payment.findMany({
    where: { shopId: shop.id },
    include: {
      order: { select: { orderNumber: true, channel: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payments</h1>
        <p className="text-xs text-slate-500">
          Transaction ledgers of recorded POS collections and storefront payments
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <p className="text-xs text-slate-500 py-12 text-center">
              No payment transactions recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {p.order.orderNumber}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {format(new Date(p.createdAt), "dd MMM yyyy, hh:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {p.order.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {p.method}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === "RECORDED" ? "success" : "warn"}
                        className="text-[10px]"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-slate-900">
                      {formatInr(Number(p.amount))}
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
