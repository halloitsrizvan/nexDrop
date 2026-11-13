"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerCustomerAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function RegisterCustomerPage() {
  const [state, formAction, isPending] = useActionState(registerCustomerAction, null);

  return (
    <Card className="shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-slate-200/80 rounded-3xl bg-white p-2">
      <CardHeader className="text-center pb-4 pt-6">
        <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
          Create an account
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 mt-1">
          Start shopping from your favourite local stores
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
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-bold text-slate-700">Full Name</Label>
            <Input id="name" name="name" placeholder="Ramesh Kumar" required disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="ramesh@example.com" required disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number (optional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+91 9876543210" disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password (min 8 characters)</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" minLength={8} required disabled={isPending} />
          </div>

          <Button type="submit" variant="orange" className="w-full h-11 rounded-2xl font-black text-sm shadow-md shadow-orange-500/20" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-[#FF5C00] font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
