"use client";

import { useState, useTransition } from "react";
import { formatInr } from "@/lib/utils";
import { createSubscriptionPlanAction, assignShopSubscriptionAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Check, AlertCircle } from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  description?: string | null;
  features: string[];
}

interface ShopItem {
  id: string;
  name: string;
  currentPlan?: string | null;
}

export function AdminSubscriptionManager({
  plans,
  shops,
}: {
  plans: PlanItem[];
  shops: ShopItem[];
}) {
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createSubscriptionPlanAction(fd);
      if (res?.error) setError(res.error);
      else setShowAddPlan(false);
    });
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !selectedPlanId) return;
    setError(null);
    startTransition(async () => {
      await assignShopSubscriptionAction({
        shopId: selectedShopId,
        planId: selectedPlanId,
        status: "ACTIVE",
      });
      setSelectedShopId("");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            SaaS Subscriptions
          </h1>
          <p className="text-xs text-slate-500">
            Define pricing tiers and manage merchant shop subscriptions
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddPlan(!showAddPlan)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Plan
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showAddPlan && (
        <Card className="border-purple-600 bg-purple-50/10">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Create Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Plan Name</Label>
                  <Input name="name" placeholder="Enterprise" required className="h-8 text-xs bg-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Slug</Label>
                  <Input name="slug" placeholder="enterprise" required className="h-8 text-xs bg-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price / Month (₹)</Label>
                  <Input name="priceMonthly" type="number" defaultValue="4999" required className="h-8 text-xs bg-white" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input name="description" placeholder="Custom multi-store franchise tier" className="h-8 text-xs bg-white" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Features (comma separated)</Label>
                <Input name="features" placeholder="Unlimited products, Multi-outlet, Priority 24/7" className="h-8 text-xs bg-white" />
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" disabled={isPending} className="h-8 text-xs">
                  {isPending ? "Creating..." : "Save Plan"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddPlan(false)} className="h-8 text-xs">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <Card key={p.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">{p.name}</CardTitle>
              <div className="text-2xl font-bold font-mono text-purple-900 mt-2">
                {formatInr(p.priceMonthly)}
                <span className="text-xs font-normal text-slate-400"> / month</span>
              </div>
              {p.description && (
                <CardDescription className="text-xs">{p.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Features included:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-green-700 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual Plan Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-700" />
            Assign Subscription to Shop
          </CardTitle>
          <CardDescription className="text-xs">
            Manually grant or upgrade a merchant&apos;s platform plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssign} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Select Shop</Label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="w-full h-8 rounded-md border border-slate-200 bg-white px-3 text-xs"
                required
              >
                <option value="">Choose a shop...</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.currentPlan ? `Current: ${s.currentPlan}` : "No Active Plan"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 flex-1">
              <Label className="text-xs">Select Plan</Label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full h-8 rounded-md border border-slate-200 bg-white px-3 text-xs"
                required
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatInr(p.priceMonthly)}/mo)
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" size="sm" disabled={isPending || !selectedShopId} className="h-8 text-xs">
              {isPending ? "Assigning..." : "Assign Subscription"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
