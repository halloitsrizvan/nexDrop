"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Store, UserCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);

    startTransition(async () => {
      const res = await loginAction(fd);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </CardTitle>
        <CardDescription className="text-slate-500">
          Sign in to your NexDrop account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-medium">Quick Demo Accounts</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemo("admin@nexdrop.local", "Admin@123")}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-green-600 hover:bg-green-50/50 transition-colors text-xs text-slate-700 group"
          >
            <ShieldCheck className="h-4 w-4 text-purple-600 mb-1" />
            <span className="font-semibold text-slate-900 group-hover:text-green-800">Admin</span>
            <span className="text-[10px] text-slate-400">Platform</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("nila@nexdrop.local", "Shop@123")}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-green-600 hover:bg-green-50/50 transition-colors text-xs text-slate-700 group"
          >
            <Store className="h-4 w-4 text-green-700 mb-1" />
            <span className="font-semibold text-slate-900 group-hover:text-green-800">Seller</span>
            <span className="text-[10px] text-slate-400">Nila Shop</span>
          </button>

          <button
            type="button"
            onClick={() => fillDemo("customer@nexdrop.local", "Customer@123")}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-green-600 hover:bg-green-50/50 transition-colors text-xs text-slate-700 group"
          >
            <UserCheck className="h-4 w-4 text-blue-600 mb-1" />
            <span className="font-semibold text-slate-900 group-hover:text-green-800">Customer</span>
            <span className="text-[10px] text-slate-400">Shopper</span>
          </button>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500 space-y-1">
          <p>
            New customer?{" "}
            <Link href="/register" className="text-green-800 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            Want to sell with us?{" "}
            <Link href="/register-shop" className="text-green-800 font-semibold hover:underline">
              Start your shop
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
