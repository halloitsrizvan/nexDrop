import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/permissions";
import { formatInr } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MapPin, Heart, ArrowRight } from "lucide-react";

export default async function AccountOverviewPage() {
  const user = await requireSession();

  const [orders, addressCount, wishlistCount] = await Promise.all([
    prisma.order.findMany({
      where: { customerId: user.id },
      include: {
        shop: { select: { name: true, slug: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.address.count({ where: { userId: user.id } }),
    prisma.wishlistItem.count({
      where: { wishlist: { userId: user.id } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back, {user.name}
        </h1>
        <p className="text-xs text-slate-500">
          Manage your orders, addresses, and saved items
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#FF5C00]" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-slate-900">{orders.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Saved Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-slate-900">{addressCount}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-slate-900">{wishlistCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/account/orders">
              View all
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              You haven&apos;t placed any orders yet.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">
                        #{o.orderNumber}
                      </span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="font-medium text-slate-700">{o.shop.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {format(new Date(o.createdAt), "dd MMM yyyy, hh:mm a")} &bull;{" "}
                      {o.items.length} items
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 font-mono">
                      {formatInr(Number(o.total))}
                    </span>
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
                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                      <Link href={`/account/orders/${o.id}`}>Track</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
