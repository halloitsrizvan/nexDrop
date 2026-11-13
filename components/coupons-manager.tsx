"use client";

import { useState, useTransition } from "react";
import { formatInr } from "@/lib/utils";
import { createCouponAction, deleteCouponAction } from "@/lib/actions/shop-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, TicketPercent, AlertCircle } from "lucide-react";

interface CouponItem {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrder: number;
  active: boolean;
}

export function CouponsManager({ coupons }: { coupons: CouponItem[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("code", code);
    fd.set("type", type);
    fd.set("value", String(value));
    fd.set("minOrder", String(minOrder));
    fd.set("active", "true");

    startTransition(async () => {
      const res = await createCouponAction(fd);
      if (res?.error) setError(res.error);
      else {
        setShowAdd(false);
        setCode("");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    startTransition(async () => {
      await deleteCouponAction(id);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Coupons & Discounts</h1>
          <p className="text-xs text-slate-500">
            Create promotional discount codes for your online storefront
          </p>
        </div>
        {!showAdd && (
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Coupon
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showAdd && (
        <Card className="border-green-600 bg-green-50/10">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Create Promotional Coupon</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Coupon Code</Label>
                  <Input
                    placeholder="e.g. FESTIVE20"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="h-8 text-xs font-mono uppercase bg-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}
                    className="w-full h-8 rounded-md border border-slate-200 bg-white px-3 text-xs"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Value ({type === "PERCENT" ? "%" : "₹"})</Label>
                  <Input
                    type="number"
                    min="1"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="h-8 text-xs bg-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Min Order (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="h-8 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" disabled={isPending} className="h-8 text-xs">
                  {isPending ? "Creating..." : "Save Coupon"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {coupons.length === 0 ? (
            <p className="text-xs text-slate-500 py-12 text-center">
              No coupons created yet. Add one to offer discounts to your shoppers.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold text-xs text-slate-900">
                      {c.code}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-green-800">
                      {c.type === "PERCENT" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      {c.minOrder > 0 ? formatInr(c.minOrder) : "No minimum"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.active ? "success" : "muted"} className="text-[10px]">
                        {c.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(c.id)}
                        className="h-7 text-xs text-slate-400 hover:text-red-600"
                        title="Delete coupon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
