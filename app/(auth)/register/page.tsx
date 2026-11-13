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
    <Card className="shadow-md border-slate-200">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Create an account
        </CardTitle>
        <CardDescription className="text-slate-500">
          Start shopping from your favourite local stores
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
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="Ramesh Kumar" required disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="ramesh@example.com" required disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number (optional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+91 9876543210" disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password (min 8 characters)</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" minLength={8} required disabled={isPending} />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-green-800 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
