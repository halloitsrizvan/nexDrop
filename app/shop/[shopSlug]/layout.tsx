import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { StorefrontHeaderCart } from "@/components/storefront-header-cart";
import {
  Store,
  ShoppingBag,
  Heart,
  User,
  MapPin,
  Phone,
  ShieldCheck,
  Search,
  Grid,
  Headphones,
  Flame,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
  ChevronDown,
} from "lucide-react";

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;
  const session = await auth();

  const shop = await prisma.shop.findUnique({
    where: { slug: shopSlug },
    include: { settings: true },
  });

  if (!shop || shop.status === "SUSPENDED" || shop.status === "REJECTED") {
    notFound();
  }

  // Fetch cart & wishlist counts and cart total if user is logged in
  let cartCount = 0;
  let cartTotal = 0;
  let wishlistCount = 0;

  if (session?.user?.id) {
    const [cart, wishlist] = await Promise.all([
      prisma.cart.findUnique({
        where: { userId_shopId: { userId: session.user.id, shopId: shop.id } },
        include: {
          items: {
            include: { product: { select: { price: true, discountPrice: true } } },
          },
        },
      }),
      prisma.wishlist.findUnique({
        where: { userId_shopId: { userId: session.user.id, shopId: shop.id } },
        include: { items: { select: { id: true } } },
      }),
    ]);
    cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    cartTotal =
      cart?.items.reduce((sum, i) => {
        const p = i.product.discountPrice ? Number(i.product.discountPrice) : Number(i.product.price);
        return sum + p * i.quantity;
      }, 0) ?? 0;
    wishlistCount = wishlist?.items.length ?? 0;
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col justify-between selection:bg-[#00B074]/20 selection:text-[#00B074]">
      {/* 1. Top Superstore Contact & Utility Bar (Exact Sea/Nest style from image) */}
      <div className="bg-white border-b border-slate-100 text-[11px] text-slate-500 py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-500">
            {shop.settings?.contactNumber && (
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <Phone className="h-3 w-3 text-[#00B074]" />
                Hotline: {shop.settings.contactNumber}
              </span>
            )}
            {shop.settings?.address && (
              <span className="hidden md:flex items-center gap-1.5 truncate max-w-sm">
                <MapPin className="h-3 w-3 text-slate-400" />
                {shop.settings.address}
              </span>
            )}
          </div>

          <div className="flex items-center gap-5 font-semibold text-slate-500">
            {shop.settings?.freeDeliveryAbove && (
              <span className="text-[#00B074] hidden lg:inline flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Free delivery on orders above ₹{Number(shop.settings.freeDeliveryAbove)}
              </span>
            )}
            <Link href={`/shop/${shop.slug}`} className="hover:text-[#00B074] transition-colors">
              Hot Deals
            </Link>
            <Link href="/account/orders" className="hover:text-[#00B074] transition-colors">
              Track Your Order
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Middle Brand & Search Bar (Exact layout from attached image) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href={`/shop/${shop.slug}`}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="h-10 w-10 rounded-2xl bg-[#E6F7F0] text-[#00B074] border border-[#00B074]/20 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-none group-hover:text-[#00B074] transition-colors truncate max-w-[140px] sm:max-w-xs md:max-w-none">
                  {shop.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F7F0] text-[#00B074] shrink-0">
                  Superstore
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                {shop.settings?.businessCategory ?? "Fresh Grocery & Daily Provisions"}
              </span>
            </div>
          </Link>

          {/* Quick Action Icons: Wishlist, Cart, Account */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href={`/shop/${shop.slug}/wishlist`}
              className="relative flex items-center gap-1.5 text-slate-600 hover:text-[#00B074] transition-colors text-xs font-bold"
              title="Wishlist"
            >
              <div className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#00B074] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Wishlist</span>
            </Link>

            <StorefrontHeaderCart
              shopId={shop.id}
              initialCount={cartCount}
              initialTotal={cartTotal}
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

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* 4. Trust Badges Row (Exact feature from bottom of attached image) */}
      <div className="bg-[#F4FBF7] border-y border-emerald-100 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Best Prices & Offers</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Orders ₹50 or more</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Free Local Delivery</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">24/7 amazing service</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Great Daily Deals</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">When you sign up</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Wide Assortment</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Mega store discounts</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-xs text-[#00B074] flex items-center justify-center shrink-0">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h5 className="font-extrabold text-xs text-slate-900">Easy Returns</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Within 24 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Rich Superstore Footer (Dark Emerald / Forest Green matching image) */}
      <footer className="bg-[#1C3A2B] text-slate-300 py-12 px-4 sm:px-8 text-xs">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Store Bio */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-black text-lg">
                <div className="h-8 w-8 rounded-xl bg-[#00B074] text-white flex items-center justify-center">
                  <Store className="h-4 w-4" />
                </div>
                <span>{shop.name}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Awesome grocery superstore platform powered by NexDrop. Fresh farm provisions, dairy, grains, and spices delivered to your doorstep.
              </p>
              {shop.settings?.address && (
                <p className="text-slate-400 text-xs flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#00B074] shrink-0" />
                  <span>{shop.settings.address}</span>
                </p>
              )}
              {shop.settings?.contactNumber && (
                <p className="text-slate-400 text-xs flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#00B074] shrink-0" />
                  <span>Call Us: {shop.settings.contactNumber}</span>
                </p>
              )}
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h5 className="text-white font-extrabold text-sm mb-3">Shop Categories</h5>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href={`/shop/${shop.slug}`} className="hover:text-white transition-colors">Dairy & Milk</Link></li>
                <li><Link href={`/shop/${shop.slug}`} className="hover:text-white transition-colors">Rice, Grains & Flours</Link></li>
                <li><Link href={`/shop/${shop.slug}`} className="hover:text-white transition-colors">Authentic Spices & Oils</Link></li>
                <li><Link href={`/shop/${shop.slug}`} className="hover:text-white transition-colors">Packaged Snacks</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="text-white font-extrabold text-sm mb-3">Customer Service</h5>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/account/orders" className="hover:text-white transition-colors">Track Order</Link></li>
                <li><Link href={`/shop/${shop.slug}/cart`} className="hover:text-white transition-colors">Shopping Cart</Link></li>
                <li><Link href={`/shop/${shop.slug}/wishlist`} className="hover:text-white transition-colors">My Wishlist</Link></li>
                <li><Link href="/account" className="hover:text-white transition-colors">Account Settings</Link></li>
              </ul>
            </div>

            {/* Cash on Delivery / Payments Notice */}
            <div className="space-y-3">
              <h5 className="text-white font-extrabold text-sm">Secure Shopping</h5>
              <p className="text-slate-400 leading-relaxed text-xs">
                Supports Cash on Delivery (COD) and in-person UPI QR scanning at your doorstep. Zero hidden delivery fees.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-300">
                <ShieldCheck className="h-4 w-4 text-[#00B074]" />
                <span>100% Genuine Neighborhood Store</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
            <p>&copy; {new Date().getFullYear()} {shop.name}. All rights reserved.</p>
            <p>Powered by <Link href="/" className="text-[#00B074] font-bold hover:underline">NexDrop Superstore</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
