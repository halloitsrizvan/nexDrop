import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatInr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Volume2,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  Phone,
  Mail,
  ChevronRight,
  Search,
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
    <div className="flex flex-col min-h-screen bg-[#FAFAFC] text-slate-900 selection:bg-[#FF5C00]/20 selection:text-[#FF5C00]">
      {/* Floating Pill Glass Navbar (Exact Neura Inspiration) */}
      <header className="sticky top-4 z-50 px-4 sm:px-8 max-w-6xl mx-auto w-full transition-all">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-full px-5 sm:px-7 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex items-center justify-between">
          {/* Logo with Orange Icon */}
          <Link href="/" className="flex items-center gap-2.5 font-black text-slate-900 text-lg tracking-tight group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF5C00] to-[#E54800] text-white flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
              <Store className="h-4 w-4" />
            </div>
            <span>NexDrop</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
            <Link href="/shops" className="text-[#00B074] font-black flex items-center gap-1 hover:text-[#009663] transition-colors">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Shop All Stores</span>
            </Link>
            <a href="#tools" className="hover:text-[#FF5C00] transition-colors">Tools</a>
            <a href="#features" className="hover:text-[#FF5C00] transition-colors">Features</a>
            <a href="#shops" className="hover:text-[#FF5C00] transition-colors">Live Stores</a>
            <a href="#pricing" className="hover:text-[#FF5C00] transition-colors">Pricing</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/shops"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DEF3E3] text-[#00B074] hover:bg-[#00B074] hover:text-white transition-all text-xs font-black shadow-2xs group"
            >
              <ShoppingBag className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
              <span>Shop Now</span>
            </Link>
            {session?.user ? (
              <Button asChild size="sm" className="bg-[#FF5C00] hover:bg-[#E55300] text-white text-xs font-bold rounded-full px-5 shadow-sm shadow-orange-500/20">
                <Link
                  href={
                    session.user.role === "SUPER_ADMIN"
                      ? "/admin"
                      : session.user.role === "SHOP_OWNER"
                      ? "/dashboard"
                      : "/account"
                  }
                >
                  <span>Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors hidden sm:inline"
                >
                  Login
                </Link>
                <Button size="sm" asChild className="bg-[#FF5C00] hover:bg-[#E55300] text-white text-xs font-bold rounded-full px-5 shadow-sm shadow-orange-500/20">
                  <Link href="/register-shop">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section (Exact Neura Inspiration with App Icon & Flow Lines) */}
      <section className="relative overflow-hidden pt-12 pb-24 px-4 sm:px-8">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-radial from-[#FF5C00]/12 via-[#FF5C00]/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6 pt-4">
          {/* Center App Icon with Circuit Lines (Exact Neura Hero Feature) */}
          <div className="flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FF5C00] via-[#FF5C00] to-[#E54800] text-white flex items-center justify-center shadow-xl shadow-orange-500/30 mb-5 relative group">
              <Store className="h-7 w-7" />
              {/* Subtle line dropping down to tag */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-px h-5 bg-gradient-to-b from-[#FF5C00]/60 to-orange-200" />
            </div>

            {/* Glowing Pill Tag: • Scale Smarter • */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-200/80 text-[#FF5C00] text-xs font-extrabold shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5C00]" />
              </span>
              <span>Scale Smarter</span>
            </div>
          </div>

          {/* Main Hero Headline (Editorial typography) */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            Sales Efficiency Elevated
          </h1>

          {/* Sub-feature pill badges row matching image */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs">
              <Zap className="h-3.5 w-3.5 text-[#FF5C00]" />
              Power POS Counter
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs">
              <Boxes className="h-3.5 w-3.5 text-[#FF5C00]" />
              Instant Stock Sync
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-bold text-slate-700 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-[#FF5C00]" />
              AI Assistant
            </span>
          </div>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            The first modern retail & POS platform built to close orders faster, automate inventory fulfillment, and grow your local business.
          </p>

          {/* Hero CTAs & Quick Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild className="w-full sm:w-auto h-12 px-8 rounded-full bg-[#00B074] hover:bg-[#009663] text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 group">
              <Link href="/shops">
                <ShoppingBag className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                <span>Shop All Stores</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button size="lg" asChild className="w-full sm:w-auto h-12 px-7 rounded-full bg-[#FF5C00] hover:bg-[#E55300] text-white font-extrabold text-sm shadow-md shadow-orange-500/20">
              <Link href="/register-shop">
                <span>Open Store Free</span>
              </Link>
            </Button>
          </div>

          {/* Inline Global Marketplace Search Pill */}
          <form action="/shops" method="GET" className="max-w-xl mx-auto pt-4 flex items-center bg-white border border-slate-200/90 rounded-full p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#00B074]/30 transition-all">
            <div className="flex-1 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Search fresh grocery, provisions, or local stores..."
                className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-[#00B074] hover:bg-[#009663] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 shrink-0"
            >
              Search
              <ArrowRight className="h-3 w-3" />
            </button>
          </form>
        </div>

        {/* Live Interactive Hero Showcase (with Speedometer, Performance Index & Convert Rate) */}
        <div className="mt-14 sm:mt-16">
          <InteractiveHeroShowcase />
        </div>
      </section>

      {/* "The tools & intelligence you need" Section (from right side of attached image) */}
      <section id="tools" className="py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Section Header with Left Title and Right Subtitle */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-orange-200/80 text-[#FF5C00] text-xs font-extrabold">
            <span>&bull; Tools &bull;</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-md">
              The tools & intelligence you need
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              Engage shoppers, sync local inventory & forecast sales to scale your retail operation faster.
            </p>
          </div>
        </div>

        {/* Bento Grid (Matching the exact cards from the right side of the attached image) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Card 1: Vibrant Solid Orange "Campaign builder" Card */}
          <div className="md:col-span-5 bg-[#FF5C00] text-white rounded-3xl p-8 shadow-xl shadow-orange-500/20 flex flex-col justify-between space-y-6">
            <div className="h-12 w-12 rounded-2xl bg-black/15 flex items-center justify-center text-white backdrop-blur-sm">
              <Volume2 className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black tracking-tight leading-tight">
                Campaign & Offer Builder
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 leading-relaxed font-normal">
                Keep your retail team focused on promotions that convert. Filter customers by spending history, broadcast WhatsApp receipts, and drive repeat footfall.
              </p>
            </div>
            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white/90">
              <span>Automated WhatsApp & SMS</span>
              <span>Active</span>
            </div>
          </div>

          {/* Card 2: "Scheduled meetings & Orders" Clean White Card */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                Scheduled Queue
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Scheduled Pickups & Home Deliveries
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                See all neighborhood orders scheduled in one central register. Filter by dispatch slot, delivery partner, customer address, and payment confirmation.
              </p>
            </div>

            {/* Interactive Activity Status Bar (Exact reproduction from attached image) */}
            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">Incoming order from Nila Provisions to Ramesh</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">Just now</span>
              </div>

              {/* Sleek Dark Action Pill from image */}
              <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs font-semibold shadow-md shadow-slate-900/10">
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-[#FF5C00]" />
                  </div>
                  <span>Rudi sent paid receipt to customer WhatsApp</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <Boxes className="h-3.5 w-3.5 text-[#00B074]" />
                <span>Rudi updated inventory: Traditional Palakkadan Matta Rice 5kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bento Row: Optimized Performance Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#FFF2EC] text-[#FF5C00] flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-lg">Optimized Retail Performance</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Revolutionize your shop workflow with ACID-safe PostgreSQL transactions, instant barcode scanner integration, and thermal receipt printing.
              </p>
            </div>
          </div>
          <Button variant="orange" size="sm" asChild className="rounded-full px-6 font-bold text-xs shrink-0">
            <Link href="/register-shop">
              <span>+ Explore more</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Live Local Stores Directory & Marketplace Entry */}
      <section id="shops" className="py-20 sm:py-24 px-4 sm:px-8 bg-white border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DEF3E3] text-[#00B074] text-xs font-extrabold mb-2">
                <span>&bull; Neighborhood Marketplace &bull;</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Live Neighborhood Stores on NexDrop
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
                Shop directly from verified local merchants or browse thousands of provisions across all stores in one unified catalog.
              </p>
            </div>

            <Button asChild className="bg-[#00B074] hover:bg-[#009663] text-white text-xs font-extrabold rounded-full px-6 h-11 shadow-sm shrink-0">
              <Link href="/shops">
                <span>Browse All Products ({shops.reduce((sum, s) => sum + s._count.products, 0)}+)</span>
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#DEF3E3] text-[#00B074]">
                      {shop.settings?.businessCategory ?? "Local Store"}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {shop._count.products} products
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-[#00B074] transition-colors">
                      {shop.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {shop.settings?.businessCategory ? `${shop.settings.businessCategory} &bull; Quality local goods.` : "Fresh local groceries, grains, dairy, and household provisions."}
                    </p>
                  </div>

                  {shop.settings?.address && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{shop.settings.address}</span>
                    </p>
                  )}
                </div>

                <div className="pt-5 border-t border-slate-100 mt-4 flex items-center gap-2">
                  <Button asChild className="flex-1 h-10 rounded-xl bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold shadow-xs">
                    <Link href={`/shop/${shop.slug}`}>
                      <span>Visit Store</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-3.5">
                    <Link href={`/shops?shopId=${shop.id}`}>
                      <span>View Items</span>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF2EC] text-[#FF5C00] text-xs font-extrabold">
            <span>&bull; Zero Commission &bull;</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple, Honest Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500">
              Clear answers on hardware, thermal printing, and online store setup
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-5 bg-[#FAFAFC] rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">
                What devices can I use for the POS counter billing?
              </h4>
              <p className="text-slate-600 leading-relaxed">
                NexDrop runs on any modern browser. You can use your existing PC, tablet, iPad, or mobile phone. Simply connect your USB or Bluetooth barcode scanner and receipt printer.
              </p>
            </div>

            <div className="p-5 bg-[#FAFAFC] rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">
                How does Cash on Delivery (COD) and POS payments work?
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Customers choose Cash on Delivery at checkout. When delivering or at the counter, you collect payment directly in Cash or via your store’s UPI QR code. NexDrop charges zero commission.
              </p>
            </div>

            <div className="p-5 bg-[#FAFAFC] rounded-2xl border border-slate-200/80 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">
                How fast is real-time inventory synchronization?
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Inventory transactions execute atomically on PostgreSQL. When an item is sold at the POS counter, its online quantity immediately decrements, completely preventing overselling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High-Converting Bottom Banner */}
      <section className="py-16 px-4 sm:px-8 bg-gradient-to-br from-[#FF5C00] to-[#E54800] text-white text-center">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Ready to Elevate Your Retail Commerce?
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

      {/* Modern Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-12 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-xl bg-[#FF5C00] text-white flex items-center justify-center font-bold shadow-xs">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight">NexDrop</span>
            <span>&bull; Retail Commerce Elevated.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/login" className="hover:text-[#FF5C00]">Sign In</Link>
            <Link href="/register-shop" className="hover:text-[#FF5C00]">Register Shop</Link>
            <Link href="/shop/nila-provisions" className="hover:text-[#FF5C00]">Storefront Demo</Link>
          </div>

          <p>&copy; {new Date().getFullYear()} NexDrop Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
