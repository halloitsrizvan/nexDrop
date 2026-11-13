"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Settings,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";

const adminNav = [
  { name: "Platform Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Shops & Approvals", href: "/admin/shops", icon: Store },
  { name: "SaaS Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export function AdminNav({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-900 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">NexDrop Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 min-w-[16rem] max-w-[16rem] shrink-0 border-r border-slate-200 bg-white flex flex-col transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-purple-900 text-white flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Super Admin</h2>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {adminNav.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-purple-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Public Home
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
