import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-xs transition-all placeholder:text-slate-400 placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]/25 focus-visible:border-[#FF5C00] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
        className,
      )}
      {...props}
    />
  );
}
