import Link from "next/link";
import { auth } from "@/auth";
import { StorefrontHeaderCart } from "@/components/storefront-header-cart";
import {
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
} from "lucide-react";

export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between selection:bg-[#00B074]/20 selection:text-[#00B074]">
      {/* 1. Top Superstore Utility Bar */}
      <div className="bg-white border-b border-slate-100 text-[11px] text-slate-500 py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Phone className="h-3 w-3 text-[#00B074]" />
              Support: 1800-888-NEXDROP
            </span>
            <span className="hidden md:flex items-center gap-1.5 truncate max-w-sm">
              <MapPin className="h-3 w-3 text-slate-400" />
              All Verified Local Neighborhood Superstores
            </span>
          </div>

          <div className="flex items-center gap-5 font-semibold text-slate-500">
            <span className="text-[#00B074] hidden lg:inline flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Direct Storefront Pricing &amp; Freshness Guaranteed
            </span>
            <Link href="/shops" className="hover:text-[#00B074] transition-colors">
              Hot Deals
            </Link>
            <Link href="/account/orders" className="hover:text-[#00B074] transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Middle Brand & Actions Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="h-10 w-10 rounded-2xl bg-[#DEF3E3] text-[#00B074] border border-[#00B074]/20 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-none group-hover:text-[#00B074] transition-colors">
                  NexDrop
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DEF3E3] text-[#00B074]">
                  Marketplace
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                Local Commerce &amp; Fresh Provisions
              </span>
            </div>
          </Link>

          {/* Quick Actions: Cart & Account */}
          <div className="flex items-center gap-3 sm:gap-5">
            <StorefrontHeaderCart
              shopId="all"
              initialCount={0}
              initialTotal={0}
            />

            {session?.user ? (
              <Link
                href="/account"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[11px]">
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {session.user.name?.split(" ")[0] ?? "Account"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold transition-all shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Trust Badges Row */}
      <div className="bg-[#F4FBF7] border-y border-emerald-100 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Direct Store Pricing</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Zero hidden markups</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Local Delivery</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Fresh to your doorstep</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Verified Shops</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Authentic local vendors</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Wide Assortment</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Fresh farm to pantry</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Easy Returns</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Hassle-free guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dark Forest Green Footer */}
      <footer className="bg-[#1C3A2B] text-slate-300 py-10 px-4 sm:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-black text-sm">
            <div className="h-6 w-6 rounded-lg bg-[#00B074] flex items-center justify-center">
              <Store className="h-3.5 w-3.5 text-white" />
            </div>
            <span>NexDrop Marketplace</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            &copy; {new Date().getFullYear()} NexDrop. Local Commerce, Simplified.
          </p>
        </div>
      </footer>
    </div>
  );
}
