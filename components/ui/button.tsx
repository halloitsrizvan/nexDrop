import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF5C00] text-white hover:bg-[#E55300] shadow-sm shadow-orange-500/20",
        orange:
          "bg-[#FF5C00] text-white hover:bg-[#E55300] shadow-sm shadow-orange-500/20",
        green:
          "bg-[#00B074] text-white hover:bg-[#009B66] shadow-sm shadow-emerald-500/20",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200/80",
        outline:
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs",
        ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-500/20",
        link: "text-[#FF5C00] underline-offset-4 hover:underline p-0 h-auto font-medium",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8.5 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-7 text-base",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
