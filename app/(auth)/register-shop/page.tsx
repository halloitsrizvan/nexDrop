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
    <Card className="shadow-md border-slate-200">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
          <Store className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Start Your Shop
        </CardTitle>
        <CardDescription className="text-slate-500">
          Launch your local commerce storefront and point of sale
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {state?.error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input id="ownerName" name="ownerName" placeholder="Anjali Menon" required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input id="shopName" name="shopName" placeholder="Nila Provisions" required disabled={isPending} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessCategory">Business Category</Label>
            <Input id="businessCategory" name="businessCategory" placeholder="Grocery & Spices" required disabled={isPending} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="shop@example.com" required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone / WhatsApp</Label>
              <Input id="phone" name="phone" placeholder="+91 98460 12345" required disabled={isPending} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Shop Address</Label>
            <Textarea id="address" name="address" placeholder="Main Bazaar, MG Road, Kochi" rows={2} required disabled={isPending} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pinCode">PIN Code</Label>
              <Input id="pinCode" name="pinCode" placeholder="682001" maxLength={6} required disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password (min 8 chars)</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" minLength={8} required disabled={isPending} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Submitting application..." : "Apply & Create Shop"}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-green-800 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
