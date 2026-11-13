import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { formatInr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Printer,
  ShoppingBag,
  CreditCard,
  User,
  MapPin,
  Clock,
  CheckCircle,
} from "lucide-react";
import { OrderStatusController } from "@/components/order-status-controller";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { shop } = await requireShopContext();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      cashier: { select: { name: true, email: true } },
      address: true,
      items: true,
      payment: true,
      history: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order || order.shopId !== shop.id) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4 mr-1" />
              All Orders
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Order #{order.orderNumber}
              </h1>
              <Badge
                variant={
                  order.status === "DELIVERED"
                    ? "success"
                    : order.status === "CANCELLED"
                    ? "muted"
                    : "warn"
                }
              >
                {order.status}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                {order.channel}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Placed on {format(new Date(order.createdAt), "dd MMMM yyyy, hh:mm a")}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
          onClick={() => {
            // Note: client side print via wrapper or simple button
          }}
        >
          <Printer className="h-4 w-4 mr-1.5" />
          Print Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main 2 Cols: Order Items & Pricing Breakdown */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-500" />
                Line Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-xs text-slate-900">
                        {item.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono">
                        {formatInr(Number(item.unitPrice))}
                      </TableCell>
                      <TableCell className="text-center text-xs font-mono">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold font-mono">
                        {formatInr(Number(item.lineTotal))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="border-t border-slate-100 pt-3 mt-4 space-y-1.5 text-xs max-w-xs ml-auto">
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
                  <span>Delivery Charge</span>
                  <span className="font-mono">
                    {Number(order.deliveryCharge) > 0
                      ? formatInr(Number(order.deliveryCharge))
                      : "FREE"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-green-800 font-mono font-bold">
                    {formatInr(Number(order.total))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                Status History & Audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.history.map((h, index) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-3 text-xs relative pb-3 border-l-2 border-slate-200 pl-4 last:pb-0"
                  >
                    <div className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-green-700 ring-4 ring-white" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{h.status}</span>
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar 1 Col: Customer info, Payment, Status Controller */}
        <div className="space-y-6">
          {/* Status Transition Control Card */}
          <Card className="border-green-600 bg-green-50/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-green-950">
                Update Order Status
              </CardTitle>
              <CardDescription className="text-xs">
                Current: <strong className="text-slate-900">{order.status}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrderStatusController
                orderId={order.id}
                currentStatus={order.status}
              />
            </CardContent>
          </Card>

          {/* Customer / Cashier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                {order.channel === "POS" ? "Billing Operator" : "Customer Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {order.channel === "POS" ? (
                <>
                  <p>
                    <strong>Cashier:</strong> {order.cashier?.name ?? "Staff"}
                  </p>
                  <p className="text-slate-500">
                    Walk-in store customer order
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Name:</strong> {order.customer?.name ?? "Guest Customer"}
                  </p>
                  {order.customer?.email && (
                    <p>
                      <strong>Email:</strong> {order.customer.email}
                    </p>
                  )}
                  {order.customer?.phone && (
                    <p>
                      <strong>Phone:</strong> {order.customer.phone}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address (for Online Orders) */}
          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1 text-slate-600">
                <p className="font-semibold text-slate-900">{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.city}, {order.address.state} - {order.address.pinCode}
                </p>
                {order.address.phone && (
                  <p className="text-slate-500 pt-1">Contact: {order.address.phone}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-500" />
                Payment Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-semibold">{order.payment?.method ?? "COD"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <Badge
                  variant={
                    order.payment?.status === "RECORDED" ? "success" : "warn"
                  }
                  className="text-[10px]"
                >
                  {order.payment?.status ?? "PENDING"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold">
                  {formatInr(Number(order.payment?.amount ?? order.total))}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
