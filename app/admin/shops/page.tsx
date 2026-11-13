import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store, ExternalLink } from "lucide-react";
import { ShopApprovalButtons } from "@/components/shop-approval-buttons";

export default async function AdminShopsPage() {
  await requireAdmin();

  const shops = await prisma.shop.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Shops & Merchants
        </h1>
        <p className="text-xs text-slate-500">
          Manage local stores, review pending registrations, and monitor storefront status
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Catalog</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-bold text-xs text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{shop.name}</span>
                      {shop.status === "ACTIVE" && (
                        <Link
                          href={`/shop/${shop.slug}`}
                          target="_blank"
                          className="text-slate-400 hover:text-green-800"
                          title="Open storefront"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      /{shop.slug}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium text-slate-800 block">{shop.owner.name}</span>
                    <span className="text-[10px] text-slate-500">{shop.owner.email}</span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-600">
                    {shop._count.products} products
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-600">
                    {shop._count.orders} orders
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        shop.status === "ACTIVE"
                          ? "success"
                          : shop.status === "PENDING"
                          ? "warn"
                          : "muted"
                      }
                      className={shop.status === "SUSPENDED" ? "bg-amber-100 text-amber-800" : ""}
                    >
                      {shop.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {format(new Date(shop.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <ShopApprovalButtons
                      shopId={shop.id}
                      currentStatus={shop.status}
                    />
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
