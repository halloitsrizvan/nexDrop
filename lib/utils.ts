import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function productPrice(product: {
  price: { toString(): string } | number;
  discountPrice?: { toString(): string } | number | null;
}) {
  const list = Number(product.price.toString());
  const sale = product.discountPrice ? Number(product.discountPrice.toString()) : null;
  return sale && sale > 0 && sale < list ? sale : list;
}

export function orderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ND-${y}-${rand}${now.getMilliseconds()}`;
}
