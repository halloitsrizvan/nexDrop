"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatInr } from "@/lib/utils";
import { addToCartAction } from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import {
  StorefrontCartDrawer,
  type DrawerCartItem,
} from "@/components/storefront-cart-drawer";
import type {
  MarketplaceShop,
  MarketplaceProduct,
} from "@/lib/actions/marketplace";
import {
  Search,
  ShoppingCart,
  Store,
  MapPin,
  Phone,
  Truck,
  Package,
  Star,
  CheckCircle2,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

export function MarketplaceView({
  shops,
  products,
  categories,
  initialQuery = "",
  initialTab = "products",
  isLoggedIn = false,
}: {
  shops: MarketplaceShop[];
  products: MarketplaceProduct[];
  categories: { id: string; name: string }[];
  initialQuery?: string;
  initialTab?: "products" | "shops";
  isLoggedIn?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"products" | "shops">(initialTab);
  const [search, setSearch] = useState(initialQuery);
  const [selectedShopId, setSelectedShopId] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active target shop for the drawer checkout (default to first active shop or selected shop)
  const activeShop =
    shops.find((s) => s.id === selectedShopId) || shops[0] || {
      id: "all",
      slug: "marketplace",
      freeDeliveryAbove: 500,
      deliveryCharge: 40,
    };

  // Lazy state initializer from localStorage cache
  const [cartItems, setCartItems] = useState<DrawerCartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(`nexdrop_cart_${activeShop.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Listen to external drawer open & storage events
  useEffect(() => {
    const handleOpenDrawer = () => setCartDrawerOpen(true);
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem(`nexdrop_cart_${activeShop.id}`);
        if (stored) setCartItems(JSON.parse(stored));
      } catch {
        // ignore
      }
    };

    window.addEventListener("open-cart-drawer", handleOpenDrawer);
    window.addEventListener("cart-updated", handleStorage);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("open-cart-drawer", handleOpenDrawer);
      window.removeEventListener("cart-updated", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [activeShop.id]);

  const persistCart = (updated: DrawerCartItem[], shopId: string) => {
    setCartItems(updated);
    try {
      localStorage.setItem(`nexdrop_cart_${shopId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("cart-updated"));
  };

  const handleDrawerUpdateQty = (productId: string, delta: number) => {
    const next = cartItems
      .map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((i): i is DrawerCartItem => i !== null);
    persistCart(next, activeShop.id);
  };

  const handleDrawerRemoveItem = (productId: string) => {
    const next = cartItems.filter((i) => i.id !== productId);
    persistCart(next, activeShop.id);
  };

  const handleDrawerClearCart = () => {
    persistCart([], activeShop.id);
  };

  // Client-side quick filter
  const filteredProducts = products.filter((p) => {
    const matchesShop = selectedShopId === "ALL" || p.shopId === selectedShopId;
    const matchesCat =
      selectedCategory === "ALL" ||
      p.categoryId === selectedCategory ||
      (p.categoryName && p.categoryName.toLowerCase() === selectedCategory.toLowerCase());
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.shopName.toLowerCase().includes(q);
    return matchesShop && matchesCat && matchesQuery;
  });

  const filteredShops = shops.filter((s) => {
    const q = search.toLowerCase().trim();
    return (
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.businessCategory.toLowerCase().includes(q) ||
      (s.address && s.address.toLowerCase().includes(q))
    );
  });

  const handleAddToCart = (product: MarketplaceProduct) => {
    setAddingId(product.id);

    // Instant local cart update (0ms, no server lag)
    const existingIndex = cartItems.findIndex((i) => i.id === product.id);
    let updated: DrawerCartItem[];
    if (existingIndex >= 0) {
      updated = cartItems.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updated = [
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          images: product.images,
          quantity: 1,
          stock: product.stock,
          brand: product.brand,
        },
      ];
    }
    persistCart(updated, product.shopId);

    // Open right-side cart sidebar
    setCartDrawerOpen(true);

    // Toast feedback
    setToastMsg(
      `✓ Added "${product.name}" from ${product.shopName}! (Guest ordering supported)`
    );
    setTimeout(() => setToastMsg(null), 4000);
    setTimeout(() => setAddingId(null), 400);

    // Async background sync if logged in
    if (isLoggedIn) {
      addToCartAction(product.shopId, product.id, 1).catch(() => {});
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Global Search */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#DEF3E3] via-[#E8F6EE] to-[#DEF3E3] border border-[#BCE3C9] p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#00B074] text-xs font-bold shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              Neighborhood Marketplace
            </span>
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Shop directly from verified local stores
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#253D4E] tracking-tight leading-tight">
            Discover Stores &amp; Fresh Provisions
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
            Search thousands of grocery items, bakery fresh treats, spices, and grains across all local stores or explore individual storefronts.
          </p>

          {/* Search Input Bar with Shop Filter */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2 max-w-2xl bg-white p-2 rounded-2xl shadow-sm border border-emerald-100">
            <div className="flex-1 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search products, brands, or shop names..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-slate-400 hover:text-slate-600 text-xs px-2"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-2">
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Shops ({shops.length})</option>
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.productCount})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Discovery View Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Toggle Mode: All Products vs Browse Shops */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl max-w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "products"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Package className="h-4 w-4 text-[#00B074]" />
            All Products
            <span className="px-1.5 py-0.2 rounded-md bg-[#DEF3E3] text-[#00B074] text-[10px] font-black">
              {filteredProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shops")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "shops"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Store className="h-4 w-4 text-[#00B074]" />
            Browse Shops
            <span className="px-1.5 py-0.2 rounded-md bg-[#DEF3E3] text-[#00B074] text-[10px] font-black">
              {filteredShops.length}
            </span>
          </button>
        </div>

        {/* Category Pills (Only when on Products tab) */}
        {activeTab === "products" && categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors text-xs shrink-0 ${
                selectedCategory === "ALL"
                  ? "bg-[#00B074] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Categories
            </button>
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors text-xs shrink-0 ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? "bg-[#00B074] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === "products" ? (
        /* A. UNIVERSAL PRODUCTS CATALOG */
        filteredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-800 text-base">
              No matching products found
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords or switching the store filter to &quot;All Shops&quot;.
            </p>
            <Button
              onClick={() => {
                setSearch("");
                setSelectedShopId("ALL");
                setSelectedCategory("ALL");
              }}
              className="mt-4 bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {filteredProducts.map((product) => {
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;
              const effectivePrice = product.discountPrice ?? product.price;
              const isOutOfStock = product.stock <= 0;
              const isAdding = addingId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-[#BCE3C9] p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group relative"
                >
                  {/* Shop Origin Badge */}
                  <Link
                    href={`/shop/${product.shopSlug}`}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-[#00B074] px-2 py-0.5 rounded-full border border-slate-100 truncate max-w-[90%] mb-2 transition-colors"
                    title={`Visit ${product.shopName}`}
                  >
                    <Store className="h-3 w-3 text-[#00B074] shrink-0" />
                    <span className="truncate">{product.shopName}</span>
                  </Link>

                  {/* Thumbnail Image */}
                  <div className="aspect-square bg-[#F8F9FA] rounded-xl relative overflow-hidden flex items-center justify-center mb-2.5">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-[#F74B81] text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        {product.brand ?? product.categoryName ?? "Grocery"}
                      </span>
                      <h4 className="font-extrabold text-[#253D4E] text-xs sm:text-sm line-clamp-2 mt-0.5 group-hover:text-[#00B074] transition-colors leading-snug">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-700">4.8</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-50">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex flex-col">
                          <span className="font-black text-sm sm:text-base text-[#00B074] font-mono leading-none">
                            {formatInr(effectivePrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-slate-400 line-through font-mono mt-0.5">
                              {formatInr(product.price)}
                            </span>
                          )}
                        </div>

                        {/* Instant Add to Cart */}
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                            Sold Out
                          </span>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={isAdding}
                            className="h-7 px-2.5 rounded-lg bg-[#DEF3E3] hover:bg-[#00B074] text-[#00B074] hover:text-white font-extrabold text-xs transition-colors shadow-2xs border border-[#00B074]/30"
                          >
                            {isAdding ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <>
                                Add
                                <ShoppingCart className="h-3 w-3 ml-1" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* B. BROWSE SHOPS DIRECTORY */
        filteredShops.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200">
            <Store className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-800 text-base">
              No matching stores found
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Try searching with another name or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-3xl border border-slate-100 hover:border-emerald-200 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Shop Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#DEF3E3] text-[#00B074] flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                        <Store className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base group-hover:text-[#00B074] transition-colors">
                            {shop.name}
                          </h3>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-[#DEF3E3] text-[#00B074]">
                            Verified
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          {shop.businessCategory}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description & Contact Details */}
                  {shop.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {shop.description}
                    </p>
                  )}

                  <div className="space-y-1 text-xs text-slate-500 pt-1">
                    {shop.address && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{shop.address}</span>
                      </p>
                    )}
                    {shop.contactNumber && (
                      <p className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Phone className="h-3.5 w-3.5 text-[#00B074] shrink-0" />
                        <span>Hotline: {shop.contactNumber}</span>
                      </p>
                    )}
                  </div>

                  {/* Delivery & Catalog Highlights */}
                  <div className="flex items-center gap-2 pt-2 flex-wrap text-[11px] font-medium text-slate-600">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100">
                      <Package className="h-3 w-3 text-slate-400" />
                      {shop.productCount} Products
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-[#00B074] border border-emerald-100 font-bold">
                      <Truck className="h-3 w-3" />
                      {shop.freeDeliveryAbove
                        ? `Free delivery > ₹${shop.freeDeliveryAbove}`
                        : `₹${shop.deliveryCharge} delivery`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-5 border-t border-slate-100 mt-4 flex items-center gap-2">
                  <Button
                    asChild
                    className="flex-1 bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold rounded-xl h-10 shadow-xs"
                  >
                    <Link href={`/shop/${shop.slug}`}>
                      Visit Storefront
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedShopId(shop.id);
                      setActiveTab("products");
                    }}
                    className="text-xs font-bold rounded-xl h-10 px-3 border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    View Items
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Floating Toast Notification on Cart Add */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="h-7 w-7 rounded-full bg-[#00B074] text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold leading-snug">{toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="ml-auto text-slate-400 hover:text-white text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Right-Side Cart Drawer for Checkout */}
      <StorefrontCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        shopId={activeShop.id}
        shopSlug={activeShop.slug}
        items={cartItems}
        onUpdateQty={handleDrawerUpdateQty}
        onRemoveItem={handleDrawerRemoveItem}
        onClearCart={handleDrawerClearCart}
        deliveryCharge={activeShop.deliveryCharge}
        freeDeliveryAbove={activeShop.freeDeliveryAbove}
        minOrderValue={0}
      />
    </div>
  );
}
