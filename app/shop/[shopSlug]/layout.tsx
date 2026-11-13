import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { Store, ShoppingBag, Heart, User, MapPin, Phone, ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

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

  if (!shop || shop.status !== "ACTIVE") {
    notFound();
  }

  // Fetch cart & wishlist counts if user is logged in
  let cartCount = 0;
  let wishlistCount = 0;

  if (session?.user?.id) {
    const [cart, wishlist] = await Promise.all([
      prisma.cart.findUnique({
        where: { userId_shopId: { userId: session.user.id, shopId: shop.id } },
        include: { items: { select: { quantity: true } } },
      }),
      prisma.wishlist.findUnique({
        where: { userId_shopId: { userId: session.user.id, shopId: shop.id } },
        include: { items: { select: { id: true } } },
      }),
    ]);
    cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    wishlistCount = wishlist?.items.length ?? 0;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-[#FF5C00]/20 selection:text-[#FF5C00]">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-[11px] px-4 py-2 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-300">
            {shop.settings?.address && (
              <span className="flex items-center gap-1.5 truncate max-w-xs sm:max-w-md">
                <MapPin className="h-3 w-3 text-[#FF5C00]" />
                {shop.settings.address}
              </span>
            )}
            {shop.settings?.contactNumber && (
              <span className="hidden sm:flex items-center gap-1.5">
                <Phone className="h-3 w-3 text-[#00B074]" />
                {shop.settings.contactNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {shop.settings?.freeDeliveryAbove && (
              <span className="font-semibold text-emerald-400 hidden md:inline flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Free delivery on orders above ₹{Number(shop.settings.freeDeliveryAbove)}
              </span>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Storefront Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href={`/shop/${shop.slug}`}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="h-10 w-10 rounded-2xl bg-[#FFF2EC] text-[#FF5C00] border border-[#FFD7C2] flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-none group-hover:text-[#FF5C00] transition-colors">
                  {shop.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F7F0] text-[#00B074]">
                  Open Now
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                {shop.settings?.businessCategory ?? "Neighborhood Grocery & Provisions"}
              </span>
            </div>
          </Link>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href={`/shop/${shop.slug}/wishlist`}
              className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 transition-all"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href={`/shop/${shop.slug}/cart`}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5C00] text-white font-bold text-xs hover:bg-[#E55300] transition-all shadow-[0_4px_16px_rgba(255,92,0,0.25)] hover:shadow-[0_6px_20px_rgba(255,92,0,0.35)] active:scale-95"
              title="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#FF5C00] font-black px-1.5 py-0.2 rounded-full text-[10px] shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {session?.user ? (
              <Link
                href="/account"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#FFF2EC] text-[#FF5C00] flex items-center justify-center font-bold text-xs">
              <Store className="h-3.5 w-3.5" />
            </div>
            <span className="font-extrabold text-slate-900">{shop.name}</span>
            <span>&bull; Powered by</span>
            <Link href="/" className="font-bold text-[#FF5C00] hover:underline">
              NexDrop Easy POS
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} {shop.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
