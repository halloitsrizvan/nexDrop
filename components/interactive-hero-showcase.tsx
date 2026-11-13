"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatInr } from "@/lib/utils";
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
} from "lucide-react";

const DEMO_POS_ITEMS = [
  {
    id: "1",
    name: "Classic Cheese Burger",
    category: "Burger",
    price: 180,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    stock: 24,
  },
  {
    id: "2",
    name: "Crispy Golden Chicken",
    category: "Chicken",
    price: 260,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80",
    stock: 18,
  },
  {
    id: "3",
    name: "Palakkadan Matta Rice 5kg",
    category: "Grains",
    price: 340,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    stock: 35,
  },
  {
    id: "4",
    name: "Farm Fresh Milk 1L",
    category: "Dairy",
    price: 56,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    stock: 40,
  },
  {
    id: "5",
    name: "Malabar Pepper Spice 250g",
    category: "Spices",
    price: 195,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
    stock: 15,
  },
  {
    id: "6",
    name: "Fresh Kerala Banana Chips",
    category: "Snacks",
    price: 120,
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
    stock: 50,
  },
];

export function InteractiveHeroShowcase() {
  const [activeTab, setActiveTab] = useState<"pos" | "dashboard" | "storefront">("pos");
  const [posCart, setPosCart] = useState<Record<string, number>>({
    "1": 2,
    "2": 1,
  });
  const [activeCategory, setActiveCategory] = useState("All");

  const updateQty = (id: string, delta: number) => {
    setPosCart((prev) => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const cartTotal = Object.entries(posCart).reduce((sum, [id, qty]) => {
    const item = DEMO_POS_ITEMS.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const cartCount = Object.values(posCart).reduce((a, b) => a + b, 0);

  return (
    <div className="relative mx-auto max-w-6xl">
      {/* Glow effect behind container */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#FF5C00]/20 via-[#00B074]/20 to-purple-500/20 blur-2xl opacity-60 -z-10" />

      {/* Outer Floating Canvas */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Top Control Bar with Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 gap-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="ml-2 font-mono text-xs font-semibold text-slate-400">
              nexdrop-os v2.4 // live interactive preview
            </span>
          </div>

          {/* Interactive Mode Pills */}
          <div className="flex items-center gap-1 rounded-2xl bg-white p-1 border border-slate-200 shadow-xs text-xs font-semibold">
            <button
              onClick={() => setActiveTab("pos")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === "pos"
                  ? "bg-[#FF5C00] text-white shadow-sm shadow-orange-500/25"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              Easy POS
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#FF5C00] text-white shadow-sm shadow-orange-500/25"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Store Manager
            </button>
            <button
              onClick={() => setActiveTab("storefront")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === "storefront"
                  ? "bg-[#FF5C00] text-white shadow-sm shadow-orange-500/25"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              Live Storefront
            </button>
          </div>
        </div>

        {/* Tab 1: Easy POS UI (Exact inspiration from Image 1) */}
        {activeTab === "pos" && (
          <div className="p-4 sm:p-6 bg-[#F8FAFC]">
            {/* Top Bar of POS */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-3 px-5 border border-slate-200/60 shadow-xs mb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Easy <span className="text-[#FF5C00]">POS</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#00B074] text-xs font-semibold border border-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00B074] animate-pulse" />
                  Terminal Online
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="text-slate-800">Dashboard</span>
                  <span>Order List</span>
                  <span>History</span>
                  <span>Bills</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FF5C00] text-white px-4 py-2 rounded-full font-bold text-xs shadow-sm shadow-orange-500/20">
                  <span>New Order ({cartCount})</span>
                </div>
              </div>
            </div>

            {/* Category Filter Chips & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
                {["All", "Burger", "Chicken", "Grains", "Dairy", "Spices", "Snacks"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? "bg-[#FF5C00] text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search item or SKU..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
                />
              </div>
            </div>

            {/* Grid of Product Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {DEMO_POS_ITEMS.filter(
                (i) => activeCategory === "All" || i.category === activeCategory
              ).map((item) => {
                const qty = posCart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3 border border-slate-200/70 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-2 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[11px] font-bold text-[#FF5C00] font-mono mt-0.5">
                        ₹{item.price}
                      </p>
                    </div>

                    {/* Quantity Selector with Orange Buttons */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="h-6 w-6 rounded-lg bg-[#FF5C00] hover:bg-[#E55300] text-white font-bold flex items-center justify-center text-xs shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Register Checkout Bar */}
            <div className="mt-4 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#FF5C00] flex items-center justify-center font-bold">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Current Register Total: <span className="font-mono text-base text-[#FF5C00] font-extrabold">{formatInr(cartTotal)}</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {cartCount} items queued &bull; Stock will deduct instantly via PostgreSQL transaction
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-xl bg-[#FF5C00] hover:bg-[#E55300] text-white font-bold text-xs shadow-sm shadow-orange-500/20 flex items-center gap-1.5 transition-all"
                >
                  <span>Open Full POS Terminal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Grocery Store Manager Dashboard (Exact inspiration from Image 2) */}
        {activeTab === "dashboard" && (
          <div className="p-4 sm:p-6 bg-[#F8FAFC]">
            {/* Top Bar with Merchant Greetings */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Misa Bosle</h3>
                <p className="text-xs text-slate-400">Let&apos;s see an overview</p>
              </div>

              <div className="flex items-center gap-2">
                <button className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <Search className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF5C00] text-white text-xs font-bold shadow-xs">
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Report</span>
                </div>
              </div>
            </div>

            {/* 4 Colorful KPI Cards (Image 2 style) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
              {/* Green Card: Total Orders */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 text-[#00B074] flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <MoreVertical className="h-4 w-4 text-slate-300" />
                </div>
                <span className="text-xs font-bold text-slate-500 block">Total Orders</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">526</span>
                <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
                  +14% to last month
                </span>
              </div>

              {/* Purple Card: Total Revenue */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <MoreVertical className="h-4 w-4 text-slate-300" />
                </div>
                <span className="text-xs font-bold text-slate-500 block">Total Revenue</span>
                <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">₹84,250</span>
                <span className="text-[10px] font-bold text-purple-600 mt-1 block">
                  +18% to last month
                </span>
              </div>

              {/* Orange Card: Pending Orders */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-xl bg-orange-100 text-[#FF5C00] flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                  <MoreVertical className="h-4 w-4 text-slate-300" />
                </div>
                <span className="text-xs font-bold text-slate-500 block">Pending Orders</span>
                <span className="text-2xl font-black text-[#FF5C00] font-mono mt-0.5 block">14</span>
                <span className="text-[10px] font-bold text-orange-600 mt-1 block">
                  Ready for packing
                </span>
              </div>

              {/* Red Card: Low Stock Alerts */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <MoreVertical className="h-4 w-4 text-slate-300" />
                </div>
                <span className="text-xs font-bold text-slate-500 block">Low Stock Alerts</span>
                <span className="text-2xl font-black text-red-600 font-mono mt-0.5 block">3</span>
                <span className="text-[10px] font-bold text-red-600 mt-1 block">
                  Need reorder soon
                </span>
              </div>
            </div>

            {/* Top Selling Products Table (Image 2 style) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm text-slate-900">Top Selling Products</h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-medium">
                    <Filter className="h-3 w-3" />
                    <span>Filter</span>
                  </div>
                  <Link
                    href="/dashboard/products"
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#FF5C00] text-white text-[11px] font-bold"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Products</span>
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 font-medium border-y border-slate-100">
                    <tr>
                      <th className="py-2 px-3">Rank</th>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-center">Units Sold</th>
                      <th className="py-2 px-3 text-center">Stock Left</th>
                      <th className="py-2 px-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { rank: "01", name: "Premium Basmati Rice 5kg", cat: "Grains & Cereals", sold: 425, stock: 69, rev: "₹24,500" },
                      { rank: "02", name: "Fresh Milk (1L)", cat: "Dairy Products", sold: 350, stock: 42, rev: "₹18,200" },
                      { rank: "03", name: "Organic Brown Eggs (12pk)", cat: "Dairy & Poultry", sold: 322, stock: 88, rev: "₹12,400" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{row.rank}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{row.cat}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-emerald-600">{row.sold}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">{row.stock}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{row.rev}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Storefront Preview */}
        {activeTab === "storefront" && (
          <div className="p-4 sm:p-6 bg-[#F8FAFC]">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Nila Provisions &bull; Storefront</h4>
                  <p className="text-[11px] text-slate-400">Main Bazaar, Kochi &bull; Open for Home Delivery</p>
                </div>
              </div>
              <Link
                href="/shop/nila-provisions"
                className="px-3.5 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <span>Visit Live Shop</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DEMO_POS_ITEMS.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="aspect-video rounded-xl bg-slate-50 overflow-hidden mb-3">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{item.name}</h5>
                    <p className="text-xs font-bold text-emerald-700 font-mono mt-1">₹{item.price}</p>
                  </div>
                  <Link
                    href={`/shop/nila-provisions`}
                    className="mt-3 w-full py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Order Online (COD)</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
