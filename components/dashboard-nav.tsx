"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Calculator,
  Users,
  TicketPercent,
  CreditCard,
  BarChart3,
  Settings,
  ExternalLink,
  Menu,
  X,
  LogOut,
  Store,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";

export function DashboardNav({
  shopName,
  shopSlug,
  ownerName,
}: {
  shopName: string;
  shopSlug: string;
  ownerName: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "POS Counter", href: "/dashboard/pos", icon: Calculator },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Inventory", href: "/dashboard/inventory", icon: Boxes },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart3 },
  ];

  const secondaryNav = [
    { name: "Coupons", href: "/dashboard/coupons", icon: TicketPercent },
    { name: "Categories", href: "/dashboard/categories", icon: Layers },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-[#FF5C00] text-white flex items-center justify-center font-bold">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm block leading-none">{shopName}</span>
            <span className="text-[10px] text-slate-400 font-medium">Merchant Dashboard</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container (Image 2 style) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 min-w-[16rem] max-w-[16rem] shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Shop Header & Cute Logo */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#FF5C00] to-[#E55300] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
                <Store className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <h2 className="font-black text-slate-900 text-sm truncate">{shopName}</h2>
                <p className="text-[11px] text-slate-400 font-medium truncate">{ownerName}</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Main Section Navigation (Image 2 style) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
              Main
            </span>
            {mainNav.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    isActive
                      ? "bg-[#FFF2EC] text-[#FF5C00] shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#FF5C00]" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Other / Management Section */}
          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
              Store & Admin
            </span>
            {secondaryNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    isActive
                      ? "bg-[#FFF2EC] text-[#FF5C00] shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#FF5C00]" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
            <Link
              href={`/shop/${shopSlug}`}
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#00B074] hover:bg-emerald-50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 text-[#00B074]" />
                Live Storefront
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom Sidebar "Unlock Premium" Card (Image 2 style) & Logout */}
        <div className="p-4 space-y-3 border-t border-slate-100 shrink-0">
          <div className="rounded-2xl p-3.5 bg-gradient-to-br from-orange-50/80 to-amber-50/50 border border-orange-200/60 text-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Unlock Growth</h5>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Coupons & multi-staff features
              </p>
            </div>
            <Link
              href="/#pricing"
              className="block w-full py-1.5 rounded-xl bg-[#FF5C00] hover:bg-[#E55300] text-white text-[11px] font-bold shadow-xs transition-colors"
            >
              Upgrade Now
            </Link>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
