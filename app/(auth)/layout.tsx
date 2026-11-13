import Link from "next/link";
import { Store } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-green-800 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-green-800 text-white flex items-center justify-center">
            <Store className="h-5 w-5" />
          </div>
          NexDrop
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} NexDrop. Local commerce, simplified.
      </footer>
    </div>
  );
}
