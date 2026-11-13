import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/language-switcher";
import { InteractiveHeroShowcase } from "@/components/interactive-hero-showcase";
import {
  Store,
  ArrowRight,
  CheckCircle2,
  Calculator,
  Boxes,
  Globe,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Users,
  Check,
  Smartphone,
  Star,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  const [shops, plans] = await Promise.all([
    prisma.shop.findMany({
      where: { status: "ACTIVE" },
      include: {
        settings: true,
        _count: { select: { products: true, orders: true } },
      },
      take: 6,
    }),
    prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#FF5C00]/20 selection:text-[#FF5C00]">
      {/* Top Floating Glassmorphism Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/70 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo with Cute Orange Store Icon (Image 2 inspiration) */}
          <Link href="/" className="flex items-center gap-2.5 font-black text-slate-900 text-xl tracking-tight group">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#FF5C00] to-[#E55300] text-white flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <Store className="h-5 w-5" />
            </div>
            <span>
              Nex<span className="text-[#FF5C00]">Drop</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600">
            <a href="#demo" className="hover:text-[#FF5C00] transition-colors">Interactive POS</a>
            <a href="#features" className="hover:text-[#FF5C00] transition-colors">Features</a>
            <a href="#shops" className="hover:text-[#FF5C00] transition-colors">Local Stores</a>
            <a href="#how-it-works" className="hover:text-[#FF5C00] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#FF5C00] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#FF5C00] transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {session?.user ? (
              <Button asChild size="sm" className="bg-[#FF5C00] hover:bg-[#E55300] text-white text-xs font-bold rounded-full px-4 shadow-sm shadow-orange-500/20">
                <Link
                  href={
                    session.user.role === "SUPER_ADMIN"
                      ? "/admin"
                      : session.user.role === "SHOP_OWNER"
                      ? "/dashboard"
                      : "/account"
                  }
                >
                  <span>Go to {session.user.role === "SUPER_ADMIN" ? "Admin" : session.user.role === "SHOP_OWNER" ? "Dashboard" : "Account"}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-slate-700 hover:text-slate-900">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="bg-[#FF5C00] hover:bg-[#E55300] text-white text-xs font-bold rounded-full px-5 shadow-sm shadow-orange-500/20">
                  <Link href="/register-shop">Start Free Shop</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-8 border-b border-slate-200/60 bg-gradient-to-b from-orange-50/30 via-slate-50/50 to-[#F8FAFC]">
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-200/20 via-emerald-100/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Animated Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-200 text-[#FF5C00] text-xs font-bold shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5C00]" />
            </span>
            <span>Next-Gen POS & Online Local Commerce Platform</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Turn Your Local Shop Into a{" "}
            <span className="bg-gradient-to-r from-[#FF5C00] to-amber-500 bg-clip-text text-transparent">
              High-Speed POS
            </span>{" "}
            & Online Superstore.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Run instant counter billing, prevent overselling with live stock sync, and launch a branded online storefront with Cash on Delivery — all from one beautiful desk.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button size="lg" asChild className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#FF5C00] hover:bg-[#E55300] text-white font-extrabold text-sm shadow-md shadow-orange-500/25">
              <Link href="/register-shop">
                <span>Start Your Shop Free</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto h-12 px-7 rounded-full text-slate-800 font-bold text-sm bg-white hover:bg-slate-50 border-slate-200 shadow-xs">
              <Link href="/login">
                <span>Try Demo Logins</span>
              </Link>
            </Button>
          </div>

          {/* Demo Logins Box */}
          <div className="pt-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-2.5 text-xs text-slate-600 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FF5C00]" />
                Instant Demo Logins:
              </span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
                <strong>Seller:</strong> nila@nexdrop.local / Shop@123
              </span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
                <strong>Admin:</strong> admin@nexdrop.local / Admin@123
              </span>
              <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
                <strong>Customer:</strong> customer@nexdrop.local / Customer@123
              </span>
            </div>
          </div>
        </div>

        {/* Live Interactive Widget Showcase */}
        <div id="demo" className="mt-12 sm:mt-16">
          <InteractiveHeroShowcase />
        </div>
      </section>

      {/* Feature Bento Grid (Inspired by the attached UI components) */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-14">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="orange" className="uppercase font-bold tracking-wider text-[11px]">
            Designed For Retail & Grocery
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Built From the Ground Up for Speed & Simplicity
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Eliminate bulky cash registers and clunky software. NexDrop gives you modern, responsive tools that run on any laptop, tablet, or phone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Easy POS Billing */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 text-[#FF5C00] flex items-center justify-center font-bold shadow-xs">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Lightning Fast POS Counter
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Speed up checkout lines with instantaneous SKU & barcode search. Supports rapid Cash tender calculation, UPI QR, and thermal receipt printing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Fast Search & Scan</span>
                  <Badge variant="success" className="text-[10px]">Instant</Badge>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Cash & UPI Change Due</span>
                  <span className="font-mono text-[#00B074]">Auto-computed</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Thermal Receipts (58/80mm)</span>
                  <span className="font-mono text-slate-500">1-Click Print</span>
                </div>
              </div>
            </div>

            <Link href="/login" className="text-xs font-bold text-[#FF5C00] hover:text-[#E55300] flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>Experience POS Terminal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2: Live ACID Inventory */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-[#00B074] flex items-center justify-center font-bold shadow-xs">
                <Boxes className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Unified Inventory Ledger
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Never oversell an item. When a burger or rice bag is sold at your physical counter, storefront stock immediately updates in PostgreSQL.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Oversell Guard Lock</span>
                  <Badge variant="orange" className="text-[10px]">ACID Safe</Badge>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Low Stock Warnings</span>
                  <span className="font-mono text-amber-600">&le; 5 units left</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Restock History Log</span>
                  <span className="font-mono text-slate-500">Audit trail</span>
                </div>
              </div>
            </div>

            <Link href="/login" className="text-xs font-bold text-[#00B074] hover:text-emerald-700 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>View Stock Architecture</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 3: WhatsApp & Online Storefront */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Branded Online Storefront
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Share your store link on WhatsApp and social media. Let local neighbors order groceries with Cash on Delivery and track delivery status live.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Cash on Delivery (COD)</span>
                  <Badge variant="purple" className="text-[10px]">Zero Commission</Badge>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Order Tracking Timeline</span>
                  <span className="font-mono text-[#00B074]">Live Status</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>English & Malayalam</span>
                  <span className="font-mono text-slate-500">en / ml</span>
                </div>
              </div>
            </div>

            <Link href="/shop/nila-provisions" className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span>Browse Live Storefront</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Local Stores Directory */}
      <section id="shops" className="py-20 sm:py-24 px-4 sm:px-8 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="orange" className="uppercase font-bold tracking-wider text-[11px] mb-2">
                Merchant Community
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Live Neighborhood Stores on NexDrop
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
              Discover real retail stores, provisions, and specialty shops active across Kerala and India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="rounded-3xl border border-slate-200/80 bg-[#F8FAFC] p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                      {shop.settings?.businessCategory ?? "Local Store"}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#FF5C00]">
                      {shop._count.products} products
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      {shop.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {shop.settings?.businessCategory ? `${shop.settings.businessCategory} • Local provisions & essentials.` : "Fresh local groceries, grains, dairy, and household provisions."}
                    </p>
                  </div>

                  {shop.settings?.address && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{shop.settings.address}</span>
                    </p>
                  )}
                </div>

                <div className="pt-5">
                  <Button asChild className="w-full h-10 rounded-2xl bg-[#FF5C00] hover:bg-[#E55300] text-white text-xs font-bold shadow-sm shadow-orange-500/20">
                    <Link href={`/shop/${shop.slug}`}>
                      <span>Visit Live Storefront</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparent SaaS Pricing */}
      <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <Badge variant="orange" className="uppercase font-bold tracking-wider text-[11px]">
            Zero Commission
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Simple, Honest Pricing
          </h2>
          <p className="text-sm text-slate-600">
            Keep 100% of your counter and storefront sales. Pay a flat software subscription.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isPopular = p.slug === "growth";
            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-7 border relative flex flex-col justify-between transition-all ${
                  isPopular
                    ? "border-[#FF5C00] ring-2 ring-[#FF5C00]/30 shadow-xl shadow-orange-500/10"
                    : "border-slate-200/80 shadow-xs hover:border-slate-300"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF5C00] text-white text-[11px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-4xl font-black text-slate-900 font-mono">
                      {formatInr(Number(p.priceMonthly))}
                    </span>
                    <span className="text-xs font-semibold text-slate-400"> / month</span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Everything Included:
                    </span>
                    <ul className="space-y-2 text-xs font-medium text-slate-600">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[#00B074] shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    asChild
                    className={`w-full h-11 rounded-2xl text-xs font-bold ${
                      isPopular
                        ? "bg-[#FF5C00] hover:bg-[#E55300] text-white shadow-md shadow-orange-500/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <Link href="/register-shop">Get Started</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-8 bg-white border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Clear answers on hardware, thermal printing, and online store setup
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">
                What devices can I use for the POS counter billing?
              </h4>
              <p className="text-slate-600 leading-relaxed">
                NexDrop runs on any modern browser. You can use your existing PC, tablet, iPad, or mobile phone. Simply connect your USB or Bluetooth barcode scanner and receipt printer.
              </p>
            </div>

            <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">
                How does Cash on Delivery (COD) and POS payments work?
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Customers choose Cash on Delivery at checkout. When delivering or at the counter, you collect payment directly in Cash or via your store’s UPI QR code. NexDrop charges zero commission.
              </p>
            </div>

            <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">
                Is Malayalam language supported?
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Yes! The entire platform features a dedicated English and Malayalam switcher with full unicode Malayalam search support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High-Converting Bottom Banner */}
      <section className="py-16 px-4 sm:px-8 bg-gradient-to-br from-[#FF5C00] to-[#E55300] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Ready to Modernize Your Counter and Grow Online?
          </h2>
          <p className="text-sm text-orange-100 max-w-xl mx-auto">
            Join local groceries, bakeries, and neighborhood merchants using NexDrop for POS billing and online delivery.
          </p>
          <div className="pt-2">
            <Button size="lg" asChild className="h-12 px-8 rounded-full bg-white text-[#FF5C00] hover:bg-orange-50 font-extrabold text-sm shadow-xl">
              <Link href="/register-shop">
                <span>Start Your Shop Free Today</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-[#FF5C00] text-white flex items-center justify-center font-bold shadow-xs">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-black text-slate-900 text-sm tracking-tight">NexDrop</span>
            <span>&bull; Local commerce, simplified.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/login" className="hover:text-[#FF5C00]">Sign In</Link>
            <Link href="/register-shop" className="hover:text-[#FF5C00]">Register Shop</Link>
            <Link href="/shop/nila-provisions" className="hover:text-[#FF5C00]">Demo Storefront</Link>
          </div>

          <p>&copy; {new Date().getFullYear()} NexDrop Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
