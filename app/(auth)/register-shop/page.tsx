"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerShopAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Store } from "lucide-react";

export default function RegisterShopPage() {
  const [state, formAction, isPending] = useActionState(registerShopAction, null);

  return (
    <Card className="shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-slate-200/80 rounded-3xl bg-white p-2">
      <CardHeader className="text-center pb-4 pt-6">
        <div className="mx-auto mb-2 h-11 w-11 rounded-2xl bg-[#FFF2EC] text-[#FF5C00] border border-[#FFD7C2] flex items-center justify-center shadow-xs">
          <Store className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
          Start Your Shop
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 mt-1">
          Launch your local commerce storefront, POS billing & inventory in minutes
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pb-6">
        {state?.error && (
          <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ownerName" className="text-xs font-bold text-slate-700">Owner Name</Label>
              <Input id="ownerName" name="ownerName" placeholder="Anjali Menon" required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shopName" className="text-xs font-bold text-slate-700">Shop Name</Label>
              <Input id="shopName" name="shopName" placeholder="Nila Provisions" required disabled={isPending} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessCategory" className="text-xs font-bold text-slate-700">Business Category</Label>
            <Input id="businessCategory" name="businessCategory" placeholder="Grocery & Spices" required disabled={isPending} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email</Label>
              <Input id="email" name="email" type="email" placeholder="shop@example.com" required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone / WhatsApp</Label>
              <Input id="phone" name="phone" placeholder="+91 98460 12345" required disabled={isPending} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-bold text-slate-700">Shop Address</Label>
            <Textarea id="address" name="address" placeholder="Main Bazaar, MG Road, Kochi" rows={2} required disabled={isPending} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pinCode" className="text-xs font-bold text-slate-700">PIN Code</Label>
              <Input id="pinCode" name="pinCode" placeholder="682001" maxLength={6} required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password (min 8 chars)</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" minLength={8} required disabled={isPending} />
            </div>
          </div>

          <Button type="submit" variant="orange" className="w-full h-11 rounded-2xl font-black text-sm shadow-md shadow-orange-500/20" disabled={isPending}>
            {isPending ? "Creating Shop..." : "Create & Launch Shop"}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-[#FF5C00] font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
