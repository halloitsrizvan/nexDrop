"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <Card className="shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-slate-200/80 rounded-3xl bg-white p-2">
      <CardHeader className="text-center pb-4 pt-6">
        <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
          Welcome back
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 mt-1">
          Sign in to access your store POS & management dashboard
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-6">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email address</Label>
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
              <Label htmlFor="password" className="text-xs font-bold text-slate-700">Password</Label>
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

          <Button
            type="submit"
            variant="orange"
            className="w-full h-11 rounded-2xl font-black text-sm shadow-md shadow-orange-500/20"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign in to Dashboard"}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
          <div>
            Don&apos;t have a merchant account?{" "}
            <Link href="/register-shop" className="text-[#FF5C00] font-bold hover:underline">
              Register Shop
            </Link>
          </div>
          <div>
            Shopping as a customer?{" "}
            <Link href="/register" className="text-slate-700 font-semibold hover:underline">
              Create customer account
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
