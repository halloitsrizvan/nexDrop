"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { formatInr } from "@/lib/utils";

export function StorefrontHeaderCart({
  shopId,
  initialCount = 0,
  initialTotal = 0,
}: {
  shopId: string;
  initialCount?: number;
  initialTotal?: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [total, setTotal] = useState(initialTotal);

  useEffect(() => {
    // Read from localStorage cache
    const updateFromCache = () => {
      try {
        const stored = localStorage.getItem(`nexdrop_cart_${shopId}`);
        if (stored) {
          const items = JSON.parse(stored) as Array<{
            id: string;
            price: number;
            quantity: number;
          }>;
          const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
          const totalAmt = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
          setCount(totalQty);
          setTotal(totalAmt);
        }
      } catch {
        // Fallback to server initial values
      }
    };

    updateFromCache();

    const handleUpdate = () => updateFromCache();
    window.addEventListener("cart-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [shopId]);

  const handleOpenDrawer = () => {
    window.dispatchEvent(new CustomEvent("open-cart-drawer"));
  };

  return (
    <button
      type="button"
      onClick={handleOpenDrawer}
      className="relative flex items-center gap-2 text-slate-700 hover:text-[#00B074] transition-colors text-xs font-bold p-1 group"
      title="Open Shopping Cart"
    >
      <div className="relative">
        <ShoppingBag className="h-5 w-5 text-slate-800 group-hover:text-[#00B074] transition-colors" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#00B074] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-200">
            {count}
          </span>
        )}
      </div>
      <div className="hidden sm:flex flex-col text-left leading-none">
        <span className="text-[10px] text-slate-400 font-normal">Cart</span>
        <span className="font-mono font-bold text-slate-900 text-xs">
          {formatInr(total)}
        </span>
      </div>
    </button>
  );
}
