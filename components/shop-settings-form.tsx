"use client";

import { useState, useTransition } from "react";
import { updateShopSettingsAction } from "@/lib/actions/shop-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ShopSettingsData {
  name: string;
  slug: string;
  description?: string | null;
  contactNumber?: string | null;
  email?: string | null;
  address?: string | null;
  pinCode?: string | null;
  businessCategory?: string | null;
  openingHours?: string | null;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryCharge: number;
  minOrderValue: number;
  storeOpen: boolean;
}

export function ShopSettingsForm({ initialData }: { initialData: ShopSettingsData }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateShopSettingsAction(fd);
      if (res?.error) setError(res.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shop Settings</h1>
          <p className="text-xs text-slate-500">
            Configure your store identity, contacts, delivery policy, and ordering status
          </p>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 p-3 text-xs text-green-800 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Shop settings updated successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Shop Name *</Label>
              <Input name="name" defaultValue={initialData.name} required className="h-8 text-xs bg-white" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Category / Specialty</Label>
              <Input name="businessCategory" defaultValue={initialData.businessCategory ?? ""} placeholder="e.g. Groceries & Provisions" className="h-8 text-xs bg-white" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Short Bio / Tagline</Label>
              <Textarea name="description" defaultValue={initialData.description ?? ""} rows={3} placeholder="About your neighborhood store..." className="text-xs bg-white" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Storefront Slug</Label>
              <Input value={`/shop/${initialData.slug}`} disabled className="h-8 text-xs bg-slate-50 font-mono text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Contact & Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Phone / WhatsApp</Label>
              <Input name="contactNumber" defaultValue={initialData.contactNumber ?? ""} placeholder="+91 98460 12345" className="h-8 text-xs bg-white" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Support Email</Label>
              <Input name="email" type="email" defaultValue={initialData.email ?? ""} placeholder="orders@shop.local" className="h-8 text-xs bg-white" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Physical Address</Label>
              <Input name="address" defaultValue={initialData.address ?? ""} placeholder="Market Road, Near Clock Tower" className="h-8 text-xs bg-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">PIN Code</Label>
                <Input name="pinCode" defaultValue={initialData.pinCode ?? ""} maxLength={6} className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Opening Hours</Label>
                <Input name="openingHours" defaultValue={initialData.openingHours ?? "8:00 AM - 9:00 PM"} className="h-8 text-xs bg-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Online Ordering & Delivery Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Delivery Charge (₹)</Label>
                <Input name="deliveryCharge" type="number" defaultValue={initialData.deliveryCharge} min="0" className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Minimum Order Value (₹)</Label>
                <Input name="minOrderValue" type="number" defaultValue={initialData.minOrderValue} min="0" className="h-8 text-xs bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="storeOpen" defaultChecked={initialData.storeOpen} className="h-4 w-4 rounded text-green-700" />
                <span className="text-xs font-semibold text-slate-800">Store Open for Orders</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="deliveryEnabled" defaultChecked={initialData.deliveryEnabled} className="h-4 w-4 rounded text-green-700" />
                <span className="text-xs font-semibold text-slate-800">Home Delivery Enabled</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="pickupEnabled" defaultChecked={initialData.pickupEnabled} className="h-4 w-4 rounded text-green-700" />
                <span className="text-xs font-semibold text-slate-800">Store Pickup Enabled</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
