"use client";

import { useState, useTransition } from "react";
import { formatInr } from "@/lib/utils";
import {
  createSubscriptionPlanAction,
  updateSubscriptionPlanAction,
  deleteSubscriptionPlanAction,
  assignShopSubscriptionAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Plus,
  CreditCard,
  Check,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

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
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createSubscriptionPlanAction(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Plan created successfully!");
        setShowAddPlan(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    });
  };

  const handleUpdatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPlan) return;
    setError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSubscriptionPlanAction(editingPlan.id, fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(`Plan "${editingPlan.name}" updated successfully!`);
        setEditingPlan(null);
        setTimeout(() => setSuccess(null), 3000);
      }
    });
  };

  const handleDeletePlan = (plan: PlanItem) => {
    if (!confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await deleteSubscriptionPlanAction(plan.id);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(`Plan "${plan.name}" deleted.`);
        setTimeout(() => setSuccess(null), 3000);
      }
    });
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopId || !selectedPlanId) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      await assignShopSubscriptionAction({
        shopId: selectedShopId,
        planId: selectedPlanId,
        status: "ACTIVE",
      });
      setSuccess("Shop subscription updated successfully!");
      setSelectedShopId("");
      setTimeout(() => setSuccess(null), 3000);
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-0">
      {/* Header with Responsive Stacking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            SaaS Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, edit, and assign platform pricing tiers for registered shops
          </p>
        </div>
        <Button
          variant="orange"
          size="sm"
          onClick={() => {
            setEditingPlan(null);
            setShowAddPlan(!showAddPlan);
          }}
          className="w-full sm:w-auto h-10 rounded-xl font-bold text-xs shadow-xs"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {showAddPlan ? "Close Form" : "Create New Plan"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-[#E6F7F0] border border-emerald-200 rounded-2xl font-bold">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00B074]" />
          <span>{success}</span>
        </div>
      )}

      {/* Edit Plan Form (Card) */}
      {editingPlan && (
        <Card className="border-[#FF5C00] bg-orange-50/20 rounded-3xl p-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[#FF5C00]" />
                Edit Plan: {editingPlan.name}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Modify pricing, features, and public description
              </CardDescription>
            </div>
            <button
              onClick={() => setEditingPlan(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePlan} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Plan Name *</Label>
                  <Input
                    name="name"
                    defaultValue={editingPlan.name}
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Slug (URL identifier) *</Label>
                  <Input
                    name="slug"
                    defaultValue={editingPlan.slug}
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Price / Month (₹) *</Label>
                  <Input
                    name="priceMonthly"
                    type="number"
                    defaultValue={editingPlan.priceMonthly}
                    required
                    className="h-10 text-xs font-mono rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Description</Label>
                <Input
                  name="description"
                  defaultValue={editingPlan.description ?? ""}
                  placeholder="e.g. Best for growing grocery stores with multiple staff"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Features (comma separated list)</Label>
                <Input
                  name="features"
                  defaultValue={editingPlan.features.join(", ")}
                  placeholder="e.g. Unlimited products, 3 staff accounts, Priority Support"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="submit"
                  variant="orange"
                  size="sm"
                  disabled={isPending}
                  className="h-10 px-5 rounded-xl text-xs font-bold"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPlan(null)}
                  className="h-10 px-4 rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add Plan Form */}
      {showAddPlan && (
        <Card className="border-slate-200 bg-white rounded-3xl p-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900">
                Create Subscription Plan
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Add a new pricing tier to the platform
              </CardDescription>
            </div>
            <button
              onClick={() => setShowAddPlan(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePlan} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Plan Name *</Label>
                  <Input name="name" placeholder="Enterprise" required className="h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Slug *</Label>
                  <Input name="slug" placeholder="enterprise" required className="h-10 text-xs rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Price / Month (₹) *</Label>
                  <Input name="priceMonthly" type="number" defaultValue="4999" required className="h-10 text-xs font-mono rounded-xl" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Description</Label>
                <Input name="description" placeholder="Custom multi-store franchise tier" className="h-10 text-xs rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Features (comma separated)</Label>
                <Input name="features" placeholder="Unlimited products, Multi-outlet, Priority 24/7" className="h-10 text-xs rounded-xl" />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="orange" size="sm" disabled={isPending} className="h-10 px-5 rounded-xl text-xs font-bold">
                  {isPending ? "Creating..." : "Save Plan"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddPlan(false)} className="h-10 px-4 rounded-xl text-xs font-bold">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid with Edit & Delete Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                  <span className="text-[11px] font-mono text-slate-400">slug: {p.slug}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setShowAddPlan(false);
                      setEditingPlan(p);
                    }}
                    className="h-8 w-8 rounded-xl bg-slate-50 hover:bg-[#FFF2EC] text-slate-600 hover:text-[#FF5C00] flex items-center justify-center transition-colors"
                    title="Edit Plan"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(p)}
                    className="h-8 w-8 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-3xl font-black font-mono text-slate-900">
                  {formatInr(p.priceMonthly)}
                </span>
                <span className="text-xs font-semibold text-slate-400"> / month</span>
              </div>

              {p.description && (
                <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Included Features:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[#00B074] shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddPlan(false);
                  setEditingPlan(p);
                }}
                className="w-full h-9 rounded-xl text-xs font-bold"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5 text-[#FF5C00]" />
                Edit Plan Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Plan Assignment Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#FFF2EC] text-[#FF5C00] flex items-center justify-center font-bold">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Assign or Upgrade Shop Subscription
            </h3>
            <p className="text-xs text-slate-500">
              Manually grant, change, or upgrade a merchant&apos;s active SaaS subscription
            </p>
          </div>
        </div>

        <form onSubmit={handleAssign} className="flex flex-col sm:flex-row gap-3 pt-2 items-stretch sm:items-end">
          <div className="space-y-1.5 flex-1">
            <Label className="text-xs font-bold text-slate-700">Select Shop</Label>
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/25"
              required
            >
              <option value="">Choose a registered shop...</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.currentPlan ? `Active: ${s.currentPlan}` : "No Active Plan"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 flex-1">
            <Label className="text-xs font-bold text-slate-700">Assign Plan</Label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/25"
              required
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatInr(p.priceMonthly)}/month)
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="orange"
            size="sm"
            disabled={isPending || !selectedShopId}
            className="h-10 px-6 rounded-xl text-xs font-bold whitespace-nowrap"
          >
            {isPending ? "Assigning..." : "Assign Subscription"}
          </Button>
        </form>
      </div>
    </div>
  );
}
