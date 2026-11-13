"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatInr } from "@/lib/utils";
import { addToCartAction, toggleWishlistAction } from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  StorefrontCartDrawer,
  type DrawerCartItem,
} from "@/components/storefront-cart-drawer";
import {
  Search,
  ShoppingCart,
  Heart,
  Package,
  Check,
  Star,
  ArrowRight,
  Flame,
  Sparkles,
  Send,
  CheckCircle2,
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

// Pastel category color definitions matching the Nest/Sea design
const CATEGORY_STYLES = [
  { name: "Cake & Milk", bg: "bg-[#FFF3FF]", border: "border-[#F8D8F8]", icon: "🥛", count: 26 },
  { name: "Organic Kiwi", bg: "bg-[#DEF3E3]", border: "border-[#C5E8CF]", icon: "🥝", count: 28 },
  { name: "Peaches", bg: "bg-[#FEEFEA]", border: "border-[#FCD7CB]", icon: "🍑", count: 14 },
  { name: "Red Apples", bg: "bg-[#FFF3EB]", border: "border-[#FFE0CF]", icon: "🍎", count: 54 },
  { name: "Snacks", bg: "bg-[#FFFCEB]", border: "border-[#FCEEC2]", icon: "🍿", count: 56 },
  { name: "Vegetables", bg: "bg-[#DEF3E3]", border: "border-[#C5E8CF]", icon: "🥦", count: 72 },
  { name: "Strawberry", bg: "bg-[#FDE0E9]", border: "border-[#F9C3D4]", icon: "🍓", count: 36 },
  { name: "Black Plum", bg: "bg-[#E8E2FA]", border: "border-[#D4CBF4]", icon: "🍇", count: 22 },
  { name: "Custard Apple", bg: "bg-[#E3F9E5]", border: "border-[#C5F2CA]", icon: "🥑", count: 41 },
  { name: "Coffees & Teas", bg: "bg-[#FEEFEA]", border: "border-[#FCD7CB]", icon: "☕", count: 89 },
];

export function StorefrontCatalog({
  shopId,
  shopSlug,
  products,
  categories,
  isLoggedIn,
  deliveryCharge = 40,
  freeDeliveryAbove = null,
  minOrderValue = 0,
}: {
  shopId: string;
  shopSlug: string;
  products: StoreProduct[];
  categories: StoreCategory[];
  isLoggedIn: boolean;
  deliveryCharge?: number;
  freeDeliveryAbove?: number | null;
  minOrderValue?: number;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [popularTab, setPopularTab] = useState<string>("ALL");
  const [bestSellsTab, setBestSellsTab] = useState<string>("Featured");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<DrawerCartItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Load cart from client cache on mount and listen to drawer open events
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`nexdrop_cart_${shopId}`);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    const handleOpenDrawer = () => setCartDrawerOpen(true);
    window.addEventListener("open-cart-drawer", handleOpenDrawer);

    if (typeof window !== "undefined" && window.location.search.includes("openCart=true")) {
      setCartDrawerOpen(true);
    }

    return () => window.removeEventListener("open-cart-drawer", handleOpenDrawer);
  }, [shopId]);

  // Helper to persist cart items
  const persistCart = (updated: DrawerCartItem[]) => {
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
    persistCart(next);
  };

  const handleDrawerRemoveItem = (productId: string) => {
    const next = cartItems.filter((i) => i.id !== productId);
    persistCart(next);
  };

  const handleDrawerClearCart = () => {
    persistCart([]);
  };

  // Simulated countdown timer for "Deals Of The Day"
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 18,
    minutes: 45,
    seconds: 12,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered popular products based on category & search
  const filtered = products.filter((p) => {
    const activeCat = selectedCategory !== "ALL" ? selectedCategory : popularTab !== "ALL" ? popularTab : "ALL";
    const matchesCat = activeCat === "ALL" || p.categoryId === activeCat;
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });

  // Zero-load instant add-to-cart: updates cache, opens right sidebar, displays message
  const handleAddToCart = (product: StoreProduct) => {
    setAddingId(product.id);

    // 1. Instant local cart cache update (0ms, no server wait, no screen lag)
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
    persistCart(updated);

    // 2. Open right-side cart sidebar immediately
    setCartDrawerOpen(true);

    // 3. Show confirmation toast message
    setToastMsg(`✓ Added "${product.name}" to cart! (Guest ordering supported — no sign up required)`);
    setTimeout(() => setToastMsg(null), 4000);
    setTimeout(() => setAddingId(null), 400);

    // 4. In background: sync with server if logged in (non-blocking)
    if (isLoggedIn) {
      addToCartAction(shopId, product.id, 1).catch(() => {});
    }
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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 4000);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 1. Hero Banner: Exact "Don't miss amazing grocery deals." */}
      <section className="relative overflow-hidden rounded-3xl bg-[#D8F1E5] border border-[#BCE3C9] px-6 py-10 sm:px-12 sm:py-16 shadow-[0_8px_30px_rgba(0,176,116,0.06)]">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-[#00B074] text-xs font-bold shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Fresh Farm to Table Daily
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#253D4E] tracking-tight leading-[1.1]">
            Don&apos;t miss amazing grocery deals.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-medium max-w-lg">
            Sign up for the daily newsletter or explore handpicked neighborhood farm picks, bakery treats, and fresh provisions.
          </p>

          {/* Newsletter pill input */}
          <form
            onSubmit={handleNewsletterSubmit}
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-md bg-white p-1.5 rounded-full shadow-md border border-emerald-100"
          >
            <div className="flex-1 flex items-center pl-4">
              <Send className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                required
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#00B074] hover:bg-[#009663] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              {newsletterSubscribed ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Subscribed!
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        </div>

        {/* Decorative Grocery Bag Illustration / Graphics */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none w-80 h-80 xl:w-96 xl:h-96">
          <div className="w-full h-full rounded-full bg-radial from-white/90 via-emerald-100/40 to-transparent flex items-center justify-center p-6">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80"
              alt="Fresh Groceries in Bag"
              className="w-full h-full object-contain rounded-2xl drop-shadow-xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section with Pastel Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-6 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-[#253D4E] tracking-tight">
              Featured Categories
            </h2>
            <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-500">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`hover:text-[#00B074] transition-colors ${
                  selectedCategory === "ALL" ? "text-[#00B074] underline underline-offset-4" : ""
                }`}
              >
                All Categories
              </button>
              {categories.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`hover:text-[#00B074] transition-colors ${
                    selectedCategory === c.id ? "text-[#00B074] underline underline-offset-4" : ""
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pastel Category Cards Carousel / Scrollable Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2.5 sm:gap-3.5">
          {CATEGORY_STYLES.map((cat, idx) => {
            const matchedCategory = categories.find(
              (c) => c.name.toLowerCase() === cat.name.toLowerCase()
            );
            const isSelected = matchedCategory && selectedCategory === matchedCategory.id;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (matchedCategory) {
                    setSelectedCategory(selectedCategory === matchedCategory.id ? "ALL" : matchedCategory.id);
                  }
                }}
                className={`group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all text-center ${
                  cat.bg
                } ${
                  isSelected
                    ? "border-[#00B074] ring-2 ring-[#00B074]/30 shadow-sm"
                    : `${cat.border} hover:-translate-y-1 hover:shadow-md`
                }`}
              >
                <div className="text-3xl sm:text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h4 className="font-extrabold text-[#253D4E] text-xs leading-tight line-clamp-1">
                  {cat.name}
                </h4>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {cat.count} items
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. 3 Promo Feature Banners (Exact 3-card banner row from image) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Banner 1: Onions / Fresh Veg */}
        <div className="relative overflow-hidden rounded-3xl bg-[#FFF5E9] border border-[#FDE3CA] p-6 sm:p-8 flex flex-col justify-between min-h-[190px] shadow-xs group">
          <div className="max-w-[65%] space-y-2 relative z-10">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Everyday Fresh
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#253D4E] leading-snug">
              Onions &amp; Farm Fresh at First Slice
            </h3>
            <button
              onClick={() => setSelectedCategory("ALL")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold transition-all shadow-xs group-hover:gap-2.5"
            >
              Shop Now
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="absolute -right-2 -bottom-2 w-32 h-32 pointer-events-none opacity-90 group-hover:scale-105 transition-transform duration-300">
            <img
              src="https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=300&q=80"
              alt="Fresh Onions"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Banner 2: Quick, Fresh, and Good for You */}
        <div className="relative overflow-hidden rounded-3xl bg-[#FEEFEA] border border-[#FCD7CB] p-6 sm:p-8 flex flex-col justify-between min-h-[190px] shadow-xs group">
          <div className="max-w-[65%] space-y-2 relative z-10">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Healthy Breakfast
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#253D4E] leading-snug">
              Quick, Fresh, and Good for You
            </h3>
            <button
              onClick={() => setSelectedCategory("ALL")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold transition-all shadow-xs group-hover:gap-2.5"
            >
              Shop Now
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="absolute -right-2 -bottom-2 w-32 h-32 pointer-events-none opacity-90 group-hover:scale-105 transition-transform duration-300">
            <img
              src="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80"
              alt="Dairy and Fresh Juice"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Banner 3: Best Organic Products Online */}
        <div className="relative overflow-hidden rounded-3xl bg-[#ECFFEC] border border-[#C6F2C6] p-6 sm:p-8 flex flex-col justify-between min-h-[190px] shadow-xs group">
          <div className="max-w-[65%] space-y-2 relative z-10">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              100% Certified
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#253D4E] leading-snug">
              The Best Organic Products Online
            </h3>
            <button
              onClick={() => setSelectedCategory("ALL")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold transition-all shadow-xs group-hover:gap-2.5"
            >
              Shop Now
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="absolute -right-2 -bottom-2 w-32 h-32 pointer-events-none opacity-90 group-hover:scale-105 transition-transform duration-300">
            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80"
              alt="Fresh Salad Greens"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* 4. Popular Products Section with Filter Tabs & Search */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <h2 className="text-xl sm:text-2xl font-black text-[#253D4E] tracking-tight">
              Popular Products
            </h2>
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setPopularTab("ALL");
                }}
                className={`font-bold transition-colors whitespace-nowrap px-2 py-1 rounded-lg ${
                  selectedCategory === "ALL" && popularTab === "ALL"
                    ? "text-[#00B074] bg-[#DEF3E3]/60"
                    : "text-slate-500 hover:text-[#00B074]"
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setPopularTab(c.id);
                  }}
                  className={`font-bold transition-colors whitespace-nowrap px-2 py-1 rounded-lg ${
                    selectedCategory === c.id
                      ? "text-[#00B074] bg-[#DEF3E3]/60"
                      : "text-slate-500 hover:text-[#00B074]"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search in catalog */}
          <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 shadow-2xs w-full lg:w-72">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 text-xs bg-transparent h-8 px-1"
            />
            <button
              type="button"
              className="h-7 w-7 rounded-full bg-[#00B074] hover:bg-[#009663] text-white flex items-center justify-center shrink-0 transition-colors shadow-xs"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Product Cards Grid: Matching Nest/Sea 5-column / responsive grid */}
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-extrabold text-slate-800 text-base">No matching products found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or switching to another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {filtered.map((product, idx) => {
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;
              const effectivePrice = product.discountPrice ?? product.price;
              const isOutOfStock = product.stock <= 0;
              const isAdding = addingId === product.id;
              const isWishlisted = wishlistIds.has(product.id);

              // Cycle friendly badge labels
              const badges = ["Save 35%", "Hot", "Sale", "Best Deal", "New"];
              const badgeLabel = hasDiscount
                ? `Save ${Math.round(((product.price - effectivePrice) / product.price) * 100)}%`
                : badges[idx % badges.length];

              const badgeColor =
                idx % 4 === 0
                  ? "bg-[#F74B81] text-white"
                  : idx % 4 === 1
                  ? "bg-[#67BCEE] text-white"
                  : idx % 4 === 2
                  ? "bg-[#FF5C00] text-white"
                  : "bg-[#00B074] text-white";

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-[#BCE3C9] p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,176,116,0.12)] transition-all flex flex-col justify-between overflow-hidden group relative"
                >
                  {/* Badge */}
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-0.5 rounded-br-xl rounded-tl-xl shadow-2xs z-10 ${badgeColor}`}
                  >
                    {badgeLabel}
                  </span>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(product.id)}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/95 backdrop-blur text-slate-400 hover:text-red-500 flex items-center justify-center shadow-xs transition-colors z-10"
                    title="Wishlist"
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${
                        isWishlisted ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>

                  {/* Product Image */}
                  <div className="aspect-square bg-[#F8F9FA] rounded-xl relative overflow-hidden flex items-center justify-center mb-3">
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
                  </div>

                  {/* Details */}
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                        {product.brand ?? "Grocery"}
                      </span>
                      <h3 className="font-extrabold text-[#253D4E] text-xs sm:text-sm line-clamp-2 mt-0.5 group-hover:text-[#00B074] transition-colors leading-snug">
                        {product.name}
                      </h3>
                      {/* Star Ratings */}
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <span className="text-slate-400 text-[10px] font-bold">(4.5)</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {/* Price Row & Add Button */}
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

                        {/* Image 4 Nest/Sea Style Green "Add 🛒" button */}
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
        )}
      </section>

      {/* 5. Daily Best Sells: Exact Left Leaf Promo + Right Product Cards with Sold Progress */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-[#253D4E] tracking-tight">
            Daily Best Sells
          </h2>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            {["Featured", "Popular", "New added"].map((tab) => (
              <button
                key={tab}
                onClick={() => setBestSellsTab(tab)}
                className={`transition-colors px-3 py-1 rounded-full ${
                  bestSellsTab === tab
                    ? "bg-[#00B074] text-white shadow-xs"
                    : "hover:text-[#00B074]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Left Feature Leaf Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1C3A2B] to-[#0D2218] text-white p-6 sm:p-8 flex flex-col justify-between shadow-md min-h-[300px] md:min-h-auto">
            <div className="space-y-3 relative z-10">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#00B074] text-[10px] font-black uppercase tracking-wider">
                Daily Offer
              </span>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                Bring nature into your home
              </h3>
              <p className="text-xs text-emerald-200">
                100% natural, farm-fresh provisions curated for your daily vitality.
              </p>
            </div>
            <div className="relative z-10 pt-4">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold transition-all shadow-xs"
              >
                Shop Now
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Background leaf overlay */}
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none w-48 h-48">
              <Sparkles className="w-full h-full text-emerald-400" />
            </div>
          </div>

          {/* Right Cards with "Sold: 90/120" progress bars */}
          {(products.slice(0, 4).length > 0 ? products.slice(0, 4) : products).map((product, idx) => {
            const effectivePrice = product.discountPrice ?? product.price;
            const soldCount = 75 + (idx * 15);
            const totalStock = 120;
            const progress = Math.min(100, Math.round((soldCount / totalStock) * 100));

            return (
              <div
                key={`bestsell-${product.id}`}
                className="bg-white rounded-2xl border border-slate-100 hover:border-[#BCE3C9] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-[#F8F9FA] rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                  <span className="absolute top-2 left-2 bg-[#00B074] text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                    Save 15%
                  </span>
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-contain p-2 hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Package className="h-10 w-10 text-slate-300" />
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {product.brand ?? "Superstore"}
                  </span>
                  <h4 className="font-extrabold text-xs text-[#253D4E] line-clamp-1">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-700 text-[10px]">4.8</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="font-black text-sm text-[#00B074] font-mono">
                      {formatInr(effectivePrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through font-mono">
                      {formatInr(product.price * 1.15)}
                    </span>
                  </div>

                  {/* Sold: 90/120 Progress Bar (Exact feature from Image 4) */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#00B074] h-full rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      Sold: {soldCount}/{totalStock}
                    </span>
                  </div>

                  {/* Full-width Add To Cart Button */}
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-2 bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold rounded-xl h-8 shadow-xs"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                    Add To Cart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Deals Of The Day with Live Countdown Timer (Exact card style from Image 4) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#253D4E] tracking-tight">
              Deals Of The Day
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              <Flame className="h-3 w-3 fill-red-500" />
              Limited Offer
            </span>
          </div>
          <Link
            href={`/shop/${shopSlug}`}
            className="text-xs font-bold text-[#00B074] hover:underline flex items-center gap-1"
          >
            All Deals
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(products.slice(0, 4).length > 0 ? products.slice(0, 4) : products).map((product) => {
            const effectivePrice = product.discountPrice ?? product.price;

            return (
              <div
                key={`deal-${product.id}`}
                className="bg-white rounded-2xl border border-slate-100 hover:border-[#BCE3C9] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all flex flex-col justify-between relative group"
              >
                {/* Image */}
                <div className="aspect-square bg-[#F8F9FA] rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Package className="h-10 w-10 text-slate-300" />
                  )}

                  {/* Countdown Timer Floating Bar */}
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm rounded-xl p-1.5 shadow-sm border border-slate-100 flex items-center justify-center gap-2 font-mono text-[11px] font-black text-[#253D4E]">
                    <div className="flex flex-col items-center">
                      <span className="text-[#00B074] leading-none">0{timeLeft.days}</span>
                      <span className="text-[8px] text-slate-400 font-sans">Days</span>
                    </div>
                    <span>:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[#00B074] leading-none">{String(timeLeft.hours).padStart(2, "0")}</span>
                      <span className="text-[8px] text-slate-400 font-sans">Hours</span>
                    </div>
                    <span>:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[#00B074] leading-none">{String(timeLeft.minutes).padStart(2, "0")}</span>
                      <span className="text-[8px] text-slate-400 font-sans">Mins</span>
                    </div>
                    <span>:</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[#00B074] leading-none">{String(timeLeft.seconds).padStart(2, "0")}</span>
                      <span className="text-[8px] text-slate-400 font-sans">Sec</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    {product.brand ?? "Special Selection"}
                  </span>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#253D4E] line-clamp-2 leading-snug">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-700 text-[10px]">5.0 (Nest Verified)</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="font-black text-base text-[#00B074] font-mono leading-none">
                        {formatInr(effectivePrice)}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through font-mono mt-0.5">
                        {formatInr(product.price * 1.25)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      className="bg-[#00B074] hover:bg-[#009663] text-white font-bold text-xs rounded-xl h-8 px-3 shadow-xs"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Delivery Rider Banner: "Stay Home. We'll Bring the Groceries to You." */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#D8F1E5] via-[#E6F7F0] to-[#DEF3E3] border border-[#BCE3C9] p-6 sm:p-12 shadow-xs">
        <div className="max-w-xl space-y-3 relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white text-[#00B074] text-xs font-bold shadow-2xs">
            Free Home Delivery
          </span>
          <h3 className="text-2xl sm:text-4xl font-black text-[#253D4E] tracking-tight">
            Stay Home. We&apos;ll Bring the Groceries to You.
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Order your fresh dairy, organic vegetables, and pantry staples in minutes. Enjoy prompt neighborhood doorstep drop-off with safe contactless handling.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#00B074] hover:bg-[#009663] text-white font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              Start Shopping Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Decorative delivery visual */}
        <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none opacity-90">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
            alt="Delivery Groceries"
            className="w-full h-full object-contain rounded-2xl drop-shadow-md"
          />
        </div>
      </section>

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

      {/* Right-Side Cart Drawer / Sidebar */}
      <StorefrontCartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        shopId={shopId}
        shopSlug={shopSlug}
        items={cartItems}
        onUpdateQty={handleDrawerUpdateQty}
        onRemoveItem={handleDrawerRemoveItem}
        onClearCart={handleDrawerClearCart}
        deliveryCharge={deliveryCharge}
        freeDeliveryAbove={freeDeliveryAbove}
        minOrderValue={minOrderValue}
      />
    </div>
  );
}
