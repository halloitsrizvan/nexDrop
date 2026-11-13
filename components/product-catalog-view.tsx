"use client";

import { useState } from "react";
import Link from "next/link";
import { formatInr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Plus,
  Package,
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  ArrowRight,
  MoreVertical,
} from "lucide-react";

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice: number | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  images: string[];
  category: { id: string; name: string } | null;
  inventory: { quantity: number } | null;
}

interface CategoryItem {
  id: string;
  name: string;
  _count: { products: number };
}

export function ProductCatalogView({
  products,
  categories,
}: {
  products: ProductItem[];
  categories: CategoryItem[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || p.status === statusFilter;
    const matchesCategory =
      categoryFilter === "ALL" || p.category?.id === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your store stock, categories, prices, and POS synchronization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="orange" size="sm" asChild className="rounded-xl font-bold shadow-xs">
            <Link href="/dashboard/products/new">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Products
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Layout: Left Filter Sidebar + Right Products Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <div className="space-y-5">
          {/* Search box with Image 1/2 accent */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, SKU..."
              className="pl-10 h-10 bg-white rounded-2xl border-slate-200 shadow-xs text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter tabs */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status Filter
            </h3>
            <div className="flex flex-col gap-1.5 text-xs font-semibold">
              {[
                { label: "All Products", value: "ALL", count: products.length },
                {
                  label: "Active",
                  value: "ACTIVE",
                  count: products.filter((p) => p.status === "ACTIVE").length,
                },
                {
                  label: "Draft",
                  value: "DRAFT",
                  count: products.filter((p) => p.status === "DRAFT").length,
                },
                {
                  label: "Archived",
                  value: "ARCHIVED",
                  count: products.filter((p) => p.status === "ARCHIVED").length,
                },
              ].map((tab) => {
                const isActive = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all ${
                      isActive
                        ? "bg-[#FFF2EC] text-[#FF5C00] font-black border border-[#FFD7C2]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#FF5C00] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category filter */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Categories
              </h3>
              <Link
                href="/dashboard/categories"
                className="text-xs text-[#FF5C00] hover:underline font-bold"
              >
                Manage
              </Link>
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-semibold max-h-64 overflow-y-auto">
              <button
                onClick={() => setCategoryFilter("ALL")}
                className={`flex items-center justify-between px-3.5 py-2 rounded-2xl text-left transition-all ${
                  categoryFilter === "ALL"
                    ? "bg-[#FFF2EC] text-[#FF5C00] font-black border border-[#FFD7C2]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>All Categories</span>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {products.length}
                </span>
              </button>
              {categories.map((c) => {
                const isCatActive = categoryFilter === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategoryFilter(c.id)}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-2xl text-left transition-all ${
                      isCatActive
                        ? "bg-[#FFF2EC] text-[#FF5C00] font-black border border-[#FFD7C2]"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate pr-2">{c.name}</span>
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                      {c._count.products}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Products Table (Exact Image 2 Top Selling Products Layout) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">
                Catalog Items
              </h2>
              <p className="text-xs text-slate-400">
                Showing {filtered.length} products
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filter
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center rounded-2xl border border-dashed border-slate-200">
              <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No products match your filters</p>
              <p className="text-xs text-slate-400 mt-1">
                Try resetting your search query or selecting &quot;All Products&quot;.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-100 text-slate-400 text-xs">
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock Left</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((product, idx) => {
                    const stock = product.inventory?.quantity ?? 0;
                    const rankNum = String(idx + 1).padStart(2, "0");
                    return (
                      <TableRow
                        key={product.id}
                        className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Rank */}
                        <TableCell className="font-mono text-xs font-bold text-slate-400">
                          {rankNum}
                        </TableCell>

                        {/* Product info */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                              {product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-full w-full object-contain p-0.5"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/dashboard/products/${product.id}`}
                                className="font-bold text-xs sm:text-sm text-slate-900 hover:text-[#FF5C00] transition-colors block"
                              >
                                {product.name}
                              </Link>
                              <span className="text-[11px] font-mono text-slate-400">
                                {product.sku}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell className="text-xs text-slate-600 font-medium">
                          {product.category?.name ?? "General"}
                        </TableCell>

                        {/* Price */}
                        <TableCell className="font-mono font-bold text-xs text-slate-900">
                          {formatInr(product.discountPrice ?? product.price)}
                        </TableCell>

                        {/* Stock Left */}
                        <TableCell>
                          <span
                            className={`font-mono font-bold text-xs ${
                              stock <= 5 ? "text-red-500" : "text-[#00B074]"
                            }`}
                          >
                            {stock}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {product.status === "ACTIVE" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F7F0] text-[#00B074]">
                              Active
                            </span>
                          ) : product.status === "DRAFT" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600">
                              Draft
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                              Archived
                            </span>
                          )}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg h-8 px-2 text-slate-400 hover:text-[#FF5C00]"
                            asChild
                          >
                            <Link href={`/dashboard/products/${product.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
