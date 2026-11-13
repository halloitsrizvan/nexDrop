"use client";

import { useSyncExternalStore } from "react";

function getCookieLocale() {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/locale=([^;]+)/);
  return match && (match[1] === "en" || match[1] === "ml") ? match[1] : "en";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function LanguageSwitcher({ locale: initialLocale }: { locale?: string }) {
  const currentLocale = useSyncExternalStore(
    subscribe,
    () => initialLocale ?? getCookieLocale(),
    () => initialLocale ?? "en"
  );

  function setLocale(next: string) {
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    window.location.reload();
  }
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-white text-xs overflow-hidden">
      <button
        type="button"
        className={`px-2 py-1 font-medium transition-colors ${currentLocale === "en" ? "bg-green-800 text-white" : "text-slate-600 hover:bg-slate-50"}`}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
      <button
        type="button"
        className={`px-2 py-1 font-medium transition-colors ${currentLocale === "ml" ? "bg-green-800 text-white" : "text-slate-600 hover:bg-slate-50"}`}
        onClick={() => setLocale("ml")}
      >
        മല
      </button>
    </div>
  );
}
