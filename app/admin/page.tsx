import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { formatInr } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Store,
  Clock,
  CheckCircle2,
  Users,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { ShopApprovalButtons } from "@/components/shop-approval-buttons";

export default async function AdminOverviewPage() {
  await requireAdmin();

  const [
    totalShops,
    activeShops,
    pendingShops,
    totalUsers,
    allOrders,
    recentPendingShops,
  ] = await Promise.all([
    prisma.shop.count(),
    prisma.shop.count({ where: { status: "ACTIVE" } }),
    prisma.shop.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { total: true },
    }),
    prisma.shop.findMany({
      where: { status: "PENDING" },
      include: {
        owner: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const platformGmv = allOrders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Platform Overview
        </h1>
        <p className="text-xs text-slate-500">
          System-wide metrics and merchant management across NexDrop
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
              Total Shops
            </CardTitle>
            <Store className="h-4 w-4 text-purple-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalShops}</div>
            <p className="text-xs text-slate-500 mt-1">
              {activeShops} active storefronts
            </p>
          </CardContent>
        </Card>

        <Card className={pendingShops > 0 ? "border-amber-300 bg-amber-50/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{pendingShops}</div>
            <p className="text-xs text-slate-500 mt-1">
              Shops awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
              Platform GMV
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatInr(platformGmv)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cumulative commerce volume
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
              Registered Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalUsers}</div>
            <p className="text-xs text-slate-500 mt-1">
              Merchants, staff and customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Pending Shop Applications
            </CardTitle>
            <CardDescription className="text-xs">
              Review and approve local merchant storefronts to go live
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href="/admin/shops">
              All Shops
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentPendingShops.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              No pending applications at this time. All shops are reviewed!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPendingShops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-bold text-xs text-slate-900">
                      {shop.name}
                      <span className="text-[10px] text-slate-400 font-mono block">
                        slug: {shop.slug}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{shop.owner.name}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {shop.owner.email}
                      {shop.owner.phone && <span className="block text-[10px]">{shop.owner.phone}</span>}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {format(new Date(shop.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <ShopApprovalButtons shopId={shop.id} />
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
