import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/permissions";
import { formatInr } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default async function CustomerOrdersPage() {
  const user = await requireSession();

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: {
      shop: { select: { name: true, slug: true } },
      items: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Orders</h1>
        <p className="text-xs text-slate-500">
          Track active deliveries and review your purchase history
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-800">No orders placed yet</p>
              <Button asChild size="sm">
                <Link href="/">Discover Local Shops</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      <Link href={`/account/orders/${o.id}`} className="text-green-800 hover:underline">
                        #{o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-800">
                      <Link href={`/shop/${o.shop.slug}`} className="hover:underline">
                        {o.shop.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {format(new Date(o.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {o.items.length} items
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          o.status === "DELIVERED"
                            ? "success"
                            : o.status === "CANCELLED"
                            ? "muted"
                            : "warn"
                        }
                        className="text-[10px]"
                      >
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs text-slate-900">
                      {formatInr(Number(o.total))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                        <Link href={`/account/orders/${o.id}`}>
                          Track
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
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
