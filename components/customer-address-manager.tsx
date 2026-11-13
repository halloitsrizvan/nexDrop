"use client";

import { useState, useTransition } from "react";
import { createAddressAction } from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Plus, AlertCircle, Home, Briefcase } from "lucide-react";

interface AddressItem {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pinCode: string;
  phone?: string | null;
  isDefault: boolean;
}

export function CustomerAddressManager({ addresses }: { addresses: AddressItem[] }) {
  const [showAdd, setShowAdd] = useState(addresses.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createAddressAction(fd);
      if (res?.error) setError(res.error);
      else setShowAdd(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved Addresses</h1>
          <p className="text-xs text-slate-500">
            Manage your delivery destinations for fast local ordering
          </p>
        </div>
        {!showAdd && (
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Address
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
        <Card className="border-green-600 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">New Delivery Address</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input name="label" defaultValue="Home" placeholder="Home / Work" required className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Contact Phone</Label>
                  <Input name="phone" placeholder="+91 9876543210" className="h-8 text-xs" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Address Line 1 *</Label>
                <Input name="line1" placeholder="Flat, House no., Building" required className="h-8 text-xs" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Address Line 2 (optional)</Label>
                <Input name="line2" placeholder="Street, Landmark" className="h-8 text-xs" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">City *</Label>
                  <Input name="city" defaultValue="Kochi" required className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">State *</Label>
                  <Input name="state" defaultValue="Kerala" required className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">PIN Code *</Label>
                  <Input name="pinCode" defaultValue="682001" maxLength={6} required className="h-8 text-xs" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="isDefault" name="isDefault" defaultChecked />
                <Label htmlFor="isDefault" className="text-xs">Set as default delivery address</Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" disabled={isPending} className="h-8 text-xs">
                  {isPending ? "Saving..." : "Save Address"}
                </Button>
                {addresses.length > 0 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Address cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <Card key={a.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-green-800" />
                  {a.label}
                </CardTitle>
                {a.isDefault && (
                  <span className="text-[10px] bg-green-50 text-green-800 font-bold px-2 py-0.5 rounded-full border border-green-200">
                    Default
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 space-y-0.5">
              <p className="font-medium text-slate-800">{a.line1}</p>
              {a.line2 && <p>{a.line2}</p>}
              <p>
                {a.city}, {a.state} - {a.pinCode}
              </p>
              {a.phone && <p className="text-slate-500 pt-1">Phone: {a.phone}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
