import Link from "next/link";
import { requireSession } from "@/lib/permissions";
import { logoutAction } from "@/lib/actions/auth";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  Store,
  LogOut,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-green-800 text-lg">
            <div className="h-8 w-8 rounded-lg bg-green-800 text-white flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
            NexDrop
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Signed in as <strong className="text-slate-800">{user.name ?? user.email}</strong>
            </span>
            <LanguageSwitcher />
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1 text-sm font-medium">
          <Link
            href="/account"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <User className="h-4 w-4 text-slate-400" />
            Account Overview
          </Link>
          <Link
            href="/account/orders"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ShoppingBag className="h-4 w-4 text-slate-400" />
            My Orders
          </Link>
          <Link
            href="/account/addresses"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <MapPin className="h-4 w-4 text-slate-400" />
            Saved Addresses
          </Link>
          <Link
            href="/account/wishlist"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Heart className="h-4 w-4 text-slate-400" />
            Wishlist
          </Link>
        </aside>

        {/* Content View */}
        <main className="md:col-span-3">
          {children}
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} NexDrop. Local commerce, simplified.
      </footer>
    </div>
  );
}
