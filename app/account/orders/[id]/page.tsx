import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/permissions";
import { formatInr } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  ShoppingBag,
  Store,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { CustomerOrderActions } from "@/components/customer-order-actions";

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSession();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      shop: { select: { name: true, slug: true, settings: true } },
      items: true,
      address: true,
      payment: true,
      history: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order || order.customerId !== user.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/account/orders">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              All Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Placed with {order.shop.name} on{" "}
              {format(new Date(order.createdAt), "dd MMMM yyyy, hh:mm a")}
            </p>
          </div>
        </div>

        <Badge
          variant={
            order.status === "DELIVERED"
              ? "success"
              : order.status === "CANCELLED"
              ? "muted"
              : "warn"
          }
          className="text-xs"
        >
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Main 2 Cols: Items & Tracking */}
        <div className="md:col-span-2 space-y-6">
          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-700" />
                Delivery Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.history.map((h, i) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 relative pb-3 border-l-2 border-slate-200 pl-4 last:pb-0"
                  >
                    <div className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-green-700 ring-4 ring-white" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{h.status}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {format(new Date(h.createdAt), "dd MMM yyyy, hh:mm a")}
                        </span>
                      </div>
                      {h.note && (
                        <p className="text-slate-600 text-xs mt-0.5">{h.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <CustomerOrderActions orderId={order.id} status={order.status} />
            </CardContent>
          </Card>

          {/* Ordered Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-500" />
                Items in Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-xs text-slate-900">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-center text-xs font-mono">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">
                        {formatInr(Number(item.unitPrice))}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs font-mono">
                        {formatInr(Number(item.lineTotal))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals Breakdown */}
              <div className="border-t border-slate-100 pt-3 mt-4 space-y-1 text-xs max-w-xs ml-auto">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatInr(Number(order.subtotal))}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Discount</span>
                    <span className="font-mono text-green-700">
                      -{formatInr(Number(order.discount))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="font-mono">
                    {Number(order.deliveryCharge) > 0
                      ? formatInr(Number(order.deliveryCharge))
                      : "FREE"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-green-800 font-mono font-bold">
                    {formatInr(Number(order.total))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar 1 Col: Shop info, Address, Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Store className="h-4 w-4 text-slate-500" />
                Shop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              <p className="font-bold text-slate-900">{order.shop.name}</p>
              {order.shop.settings?.contactNumber && (
                <p className="text-slate-600">Ph: {order.shop.settings.contactNumber}</p>
              )}
              {order.shop.settings?.address && (
                <p className="text-slate-500">{order.shop.settings.address}</p>
              )}
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild className="h-7 text-xs w-full">
                  <Link href={`/shop/${order.shop.slug}`}>Visit Shop</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5 text-xs text-slate-600">
                <p className="font-bold text-slate-900">{order.address.label}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.state} - {order.address.pinCode}
                </p>
                {order.address.phone && (
                  <p className="text-slate-500 pt-1">Phone: {order.address.phone}</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-500" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-semibold">{order.payment?.method ?? "COD"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <Badge variant={order.payment?.status === "RECORDED" ? "success" : "warn"}>
                  {order.payment?.status ?? "PENDING"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
