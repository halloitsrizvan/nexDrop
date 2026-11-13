"use client";

import { useState } from "react";
import Link from "next/link";
import { formatInr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  LayoutDashboard,
  Store,
  Plus,
  Minus,
  Search,
  ShoppingCart,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  ArrowRight,
  MoreVertical,
  Download,
  Filter,
  Sparkles,
  Phone,
  Check,
  X,
  Share2,
  Users,
  Bell,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export function InteractiveHeroShowcase() {
  const [activeTab, setActiveTab] = useState<"overview" | "pos" | "products">("overview");
  const [radialValue, setRadialValue] = useState(67.2);
  const [callAccepted, setCallAccepted] = useState(false);

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FF5C00]/10 via-[#FF5C00]/5 to-transparent blur-3xl rounded-[40px] -z-10 pointer-events-none" />

      {/* Floating Micro-Card Left: Customer Call / Lead (from reference image) */}
      <div className="hidden xl:block absolute -left-12 top-24 z-20 w-52 bg-white rounded-2xl p-3.5 border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.08)] animate-float">
        <div className="bg-[#FF5C00] text-white text-[10px] font-bold px-2.5 py-1 rounded-xl mb-2 flex items-center justify-between">
          <span>Customer Order</span>
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
        </div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-9 w-9 rounded-full bg-orange-100 text-[#FF5C00] font-black text-xs flex items-center justify-center shrink-0 border border-orange-200">
            BJ
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-slate-900 leading-none">Brenda Johnson</h5>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">VIP &bull; Matta Rice 5kg</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCallAccepted(true)}
            className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              callAccepted
                ? "bg-[#00B074] text-white"
                : "bg-[#FF5C00] hover:bg-[#E55300] text-white shadow-xs"
            }`}
          >
            <Check className="h-3 w-3" />
            {callAccepted ? "Accepted" : "Accept"}
          </button>
          <button
            onClick={() => setCallAccepted(false)}
            className="h-7 w-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Micro-Card Right: Sales Target (from reference image) */}
      <div className="hidden xl:block absolute -right-12 top-20 z-20 w-56 bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-extrabold text-slate-500">Sales Target by Channel</span>
          <MoreVertical className="h-3.5 w-3.5 text-slate-300" />
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-black text-slate-900 font-mono">$21,480</span>
          <span className="text-[10px] font-bold text-[#00B074] bg-emerald-50 px-1.5 py-0.5 rounded-md">+18.4%</span>
        </div>
        {/* Stream progress bars matching image */}
        <div className="space-y-2 text-[10px] font-semibold text-slate-500">
          <div>
            <div className="flex justify-between mb-1">
              <span>POS In-Store</span>
              <span className="font-bold text-slate-900">70%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#FF5C00] rounded-full" style={{ width: "70%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>Online WhatsApp</span>
              <span className="font-bold text-slate-900">50%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-slate-800 rounded-full" style={{ width: "50%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Glass Canvas Container (Exact Neura Hero Dashboard Style) */}
      <div className="bg-white/95 backdrop-blur-xl rounded-[32px] border border-slate-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden transition-all">
        {/* Top Floating App Header inside Dashboard */}
        <div className="border-b border-slate-100 px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70">
          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
            {/* Neura/NexDrop Logo Pill */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#FF5C00] text-white flex items-center justify-center font-black shadow-xs">
                <Store className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">NexDrop</span>
            </div>

            {/* Pill Navigation Tabs matching image */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeTab === "overview"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("pos")}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeTab === "pos"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                POS Counter
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeTab === "products"
                    ? "bg-white text-slate-900 shadow-xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          {/* Right actions matching image: Search, Avatar, + AI Assistant */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-slate-900 font-medium w-36 focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                readOnly
                value="Matta Rice"
              />
            </div>

            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Bell className="h-4 w-4" />
            </div>

            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-200 to-orange-400 p-0.5 flex items-center justify-center">
              <span className="font-extrabold text-[11px] text-slate-800">MB</span>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF5C00] text-white text-xs font-black shadow-sm shadow-orange-500/25">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Assistant</span>
            </div>
          </div>
        </div>

        {/* Dashboard Canvas Body (Exact reproduction of Neura Image widgets) */}
        <div className="p-5 sm:p-8 bg-[#FAFAFC]">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Header Greeting inside Canvas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Sales Overview & Counter Metrics
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time synchronization between in-store POS register and online storefront
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-700">NP</div>
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-orange-200 text-[10px] font-bold flex items-center justify-center text-[#FF5C00]">MS</div>
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-emerald-200 text-[10px] font-bold flex items-center justify-center text-[#00B074]">CD</div>
                  </div>
                  <button className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors">
                    + Invite Staff
                  </button>
                  <button className="px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </div>

              {/* 3 Core Data Cards (Exact Match to Image 3) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Widget 1: Speedometer / Radial Gauge (67.2%) */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                        Sales Velocity
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#FF5C00] text-xs font-extrabold">
                      <Sparkles className="h-3 w-3" />
                      You&apos;re in top 15% of stores
                    </span>
                  </div>

                  {/* SVG Segmented Radial Speedometer Gauge */}
                  <div className="py-6 flex flex-col items-center justify-center relative">
                    <svg viewBox="0 0 200 120" className="w-56 h-36">
                      {/* Background Arc */}
                      <path
                        d="M 20 110 A 80 80 0 0 1 180 110"
                        fill="none"
                        stroke="#F1F5F9"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      {/* Segmented Gradient Arcs in Vibrant Orange */}
                      <path
                        d="M 20 110 A 80 80 0 0 1 145 42"
                        fill="none"
                        stroke="#FF5C00"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute top-16 text-center">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                        67.2%
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
                        Capacity Achieved
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Daily Counter Target</span>
                    <span className="font-mono font-bold text-slate-900">₹45,000 / ₹65,000</span>
                  </div>
                </div>

                {/* Widget 2: Performance Index Bar Chart (85.2%) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                        Performance Index
                      </span>
                      <span className="text-[11px] font-bold font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        13 Apr 2026
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                        85.2%
                      </span>
                      <span className="text-xs font-bold text-[#00B074]">
                        +12.4% vs last week
                      </span>
                    </div>
                  </div>

                  {/* Multi-Bar Graph */}
                  <div className="pt-6 pb-2">
                    <div className="h-32 flex items-end justify-between gap-2 px-2">
                      {[
                        { day: "Mon", height: "45%", val: "₹18k" },
                        { day: "Tue", height: "65%", val: "₹26k" },
                        { day: "Wed", height: "85%", val: "₹34k", active: true },
                        { day: "Thu", height: "55%", val: "₹22k" },
                        { day: "Fri", height: "95%", val: "₹39k", active: true },
                        { day: "Sat", height: "75%", val: "₹30k" },
                        { day: "Sun", height: "90%", val: "₹36k" },
                      ].map((bar, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                          <div
                            className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 ${
                              bar.active
                                ? "bg-gradient-to-t from-[#FF5C00] to-amber-400 shadow-sm"
                                : "bg-slate-100 hover:bg-slate-200"
                            }`}
                            style={{ height: bar.height }}
                          />
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-800">
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Highest sales spike: <strong>Friday POS Counter</strong></span>
                    <span className="text-[#00B074] font-bold">Optimal</span>
                  </div>
                </div>

                {/* Widget 3: Conversion Rate Circular Ring (37.5%) */}
                <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                        Convert Rate
                      </span>
                      <MoreVertical className="h-4 w-4 text-slate-300" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Storefront to completed checkout
                    </span>
                  </div>

                  {/* Sleek Dark Circular Meter Ring from image */}
                  <div className="py-4 flex flex-col items-center justify-center">
                    <div className="relative h-28 w-28 rounded-full bg-slate-900 text-white flex flex-col items-center justify-center shadow-lg shadow-slate-900/10">
                      <span className="text-2xl font-black font-mono">37.5%</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                        Convert Rate
                      </span>
                      {/* Dotted border ring */}
                      <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#FF5C00]/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Visits</span>
                      <span className="font-bold text-slate-800 font-mono">1,420</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paid Receipts</span>
                      <span className="font-bold text-[#00B074] font-mono">532</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pos" && (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-[#FFF2EC] text-[#FF5C00] flex items-center justify-center mx-auto">
                <Calculator className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-black text-slate-900">High-Speed POS Counter Active</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Instant barcode search, UPI QR payments, and thermal receipt generation ready for your merchant account.
              </p>
              <div className="pt-2">
                <Button variant="orange" size="sm" asChild className="rounded-full px-6 font-bold text-xs">
                  <Link href="/login">Launch POS Terminal</Link>
                </Button>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-[#00B074] flex items-center justify-center mx-auto">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Advanced Analytics Engine</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Category sales velocity, SKU stock turnover, and customer retention metrics.
              </p>
              <div className="pt-2">
                <Button variant="orange" size="sm" asChild className="rounded-full px-6 font-bold text-xs">
                  <Link href="/login">View Full Analytics</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
