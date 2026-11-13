import Link from "next/link";
import { Store } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-[#FF5C00]/20 selection:text-[#FF5C00]">
      {/* Sleek Minimal Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-black text-slate-900 text-xl tracking-tight group">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-[#FF5C00] to-[#E55300] text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Store className="h-5 w-5" />
          </div>
          <span>
            Nex<span className="text-[#FF5C00]">Drop</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          &larr; Back to Home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white">
        &copy; {new Date().getFullYear()} NexDrop Technologies. Unified local retail OS.
      </footer>
    </div>
  );
}
