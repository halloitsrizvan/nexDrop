"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatInr } from "@/lib/utils";
import { addToCartAction, toggleWishlistAction } from "@/lib/actions/customer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingCart,
  Heart,
  Package,
  Check,
  Sparkles,
  Plus,
  Minus,
  Store,
  Flame,
} from "lucide-react";

interface StoreProduct {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  brand: string | null;
  price: number;
  discountPrice: number | null;
  images: string[];
  featured: boolean;
  categoryId: string | null;
  stock: number;
}

interface StoreCategory {
  id: string;
  name: string;
  slug: string;
}

export function StorefrontCatalog({
  shopId,
  shopSlug,
  products,
  categories,
  isLoggedIn,
}: {
  shopId: string;
  shopSlug: string;
  products: StoreProduct[];
  categories: StoreCategory[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const featuredProducts = products.filter((p) => p.featured);

  const filtered = products.filter((p) => {
    const matchesCat =
      selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  const getQty = (id: string) => quantities[id] ?? 1;

  const changeQty = (id: string, delta: number, maxStock: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleAddToCart = (product: StoreProduct) => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/shop/${shopSlug}`);
      return;
    }
    const qty = getQty(product.id);
    setAddingId(product.id);
    startTransition(async () => {
      await addToCartAction(shopId, product.id, qty);
      setTimeout(() => setAddingId(null), 800);
    });
  };

  const handleToggleWishlist = (productId: string) => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/shop/${shopSlug}`);
      return;
    }
    startTransition(async () => {
      const res = await toggleWishlistAction(shopId, productId);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (res.saved) next.add(productId);
        else next.delete(productId);
        return next;
      });
    });
  };

  return (
    <div className="space-y-8">
      {/* Featured Banner / Hero Offer */}
      {featuredProducts.length > 0 && selectedCategory === "ALL" && !search && (
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl overflow-hidden relative border border-slate-700/50">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#FF5C00]/20 to-transparent pointer-events-none" />
          <div className="max-w-xl space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2EC] text-[#FF5C00] text-xs font-bold shadow-xs">
              <Flame className="h-3.5 w-3.5 fill-[#FF5C00]" />
              Today&apos;s Store Special
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {featuredProducts[0].name}
            </h2>
            {featuredProducts[0].description && (
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                {featuredProducts[0].description}
              </p>
            )}
            <div className="pt-2 flex items-center gap-4">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                {formatInr(featuredProducts[0].discountPrice ?? featuredProducts[0].price)}
              </span>
              <Button
                variant="orange"
                size="sm"
                onClick={() => handleAddToCart(featuredProducts[0])}
                className="font-bold text-xs"
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                Add Special to Cart
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Easy POS Category Filter Pills & Search Bar (Exact Image 1 Style) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 text-xs no-scrollbar flex-1">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all text-xs ${
              selectedCategory === "ALL"
                ? "bg-[#FFF2EC] border border-[#FFD7C2] text-[#FF5C00] shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all text-xs ${
                selectedCategory === c.id
                  ? "bg-[#FFF2EC] border border-[#FFD7C2] text-[#FF5C00] shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search Input with Image 1 Green Button */}
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs w-full md:w-80 shrink-0">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-xs bg-transparent h-8 px-2"
          />
          <button
            type="button"
            className="h-8 w-8 rounded-xl bg-[#00B074] hover:bg-[#009663] text-white flex items-center justify-center shrink-0 transition-colors shadow-xs"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Products Grid (Exact Image 1 Easy POS Style) */}
      {filtered.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl border border-dashed border-slate-200">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="font-extrabold text-slate-800 text-lg">No matching products found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or switching to another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product) => {
            const hasDiscount =
              product.discountPrice && product.discountPrice < product.price;
            const effectivePrice = product.discountPrice ?? product.price;
            const isOutOfStock = product.stock <= 0;
            const isAdding = addingId === product.id;
            const isWishlisted = wishlistIds.has(product.id);
            const qty = getQty(product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-100 p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-orange-100 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Image & Wishlist Button */}
                <div className="aspect-square bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center mb-3">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <Package className="h-12 w-12" />
                    </div>
                  )}

                  {hasDiscount && (
                    <span className="absolute top-2.5 left-2.5 bg-[#FF5C00] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                      SALE
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(product.id)}
                    className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/95 backdrop-blur text-slate-500 hover:text-red-500 flex items-center justify-center shadow-xs transition-colors"
                    title="Wishlist"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isWishlisted ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    {product.brand && (
                      <span className="text-[11px] font-semibold text-slate-400 block truncate">
                        {product.brand}
                      </span>
                    )}
                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-2 mt-0.5 group-hover:text-[#FF5C00] transition-colors leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Price and Stock Indicator */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-slate-400 font-medium">Price</span>
                        <span className="font-black text-base text-slate-900 font-mono">
                          {formatInr(effectivePrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-slate-400 line-through font-mono">
                            {formatInr(product.price)}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-bold ${
                          product.stock > 5
                            ? "text-[#00B074]"
                            : product.stock > 0
                            ? "text-[#FF5C00]"
                            : "text-red-500"
                        }`}
                      >
                        {product.stock > 5
                          ? "In Stock"
                          : product.stock > 0
                          ? `${product.stock} left`
                          : "Sold Out"}
                      </span>
                    </div>

                    {/* Image 1 Easy POS [- 1 +] Quantity Selector & Cart Action */}
                    {isOutOfStock ? (
                      <Button
                        size="sm"
                        disabled
                        className="w-full text-xs font-bold h-9 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
                      >
                        Out of Stock
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Minus / Qty / Plus pill */}
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => changeQty(product.id, -1, product.stock)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:shadow-xs active:scale-95 transition-all"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs font-mono text-slate-800">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => changeQty(product.id, 1, product.stock)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:shadow-xs active:scale-95 transition-all"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Add to Cart button */}
                        <Button
                          type="button"
                          variant="orange"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={isAdding}
                          className="flex-1 text-xs font-bold h-8 rounded-xl"
                        >
                          {isAdding ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
