import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?:
    | "default"
    | "outline"
    | "success"
    | "warn"
    | "muted"
    | "orange"
    | "purple"
    | "red";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "bg-[#FF5C00] text-white shadow-xs",
        variant === "orange" && "bg-orange-50 text-[#FF5C00] border border-orange-100",
        variant === "purple" && "bg-purple-50 text-purple-700 border border-purple-100",
        variant === "success" && "bg-emerald-50 text-emerald-700 border border-emerald-100",
        variant === "warn" && "bg-amber-50 text-amber-700 border border-amber-100",
        variant === "red" && "bg-red-50 text-red-600 border border-red-100",
        variant === "muted" && "bg-slate-100 text-slate-600",
        variant === "outline" && "border border-slate-200 text-slate-700 bg-white",
        className,
      )}
      {...props}
    />
  );
}
