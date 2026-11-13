"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { PaymentMethod } from "@prisma/client";
import { createPosSaleAction } from "@/lib/actions/orders";
import { formatInr, productPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  RotateCcw,
  CreditCard,
  Banknote,
  QrCode,
  Package,
  AlertCircle,
  Bell,
  ArrowRight,
  Receipt,
  Home,
  Users,
  Grid,
  History,
  FileText,
} from "lucide-react";

interface PosProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  categoryId: string | null;
  stock: number;
}

interface PosCategory {
  id: string;
  name: string;
}

interface CartItem {
  product: PosProduct;
  quantity: number;
}

interface CompletedReceipt {
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  method: PaymentMethod;
  tendered?: number;
  change?: number;
}

export function PosTerminal({
  shopName,
  shopAddress,
  shopPhone,
  products,
  categories,
  cashierName,
}: {
  shopName: string;
  shopAddress?: string | null;
  shopPhone?: string | null;
  products: PosProduct[];
  categories: PosCategory[];
  cashierName: string;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [tenderedAmount, setTenderedAmount] = useState<string>("");
  const [completedReceipt, setCompletedReceipt] = useState<CompletedReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, [completedReceipt]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const updateProductQuantityInCart = (product: PosProduct, nextQty: number) => {
    if (nextQty > product.stock) {
      setError(`Only ${product.stock} units available in stock.`);
      return;
    }
    setError(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (nextQty <= 0) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { product, quantity: nextQty }];
    });
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setTenderedAmount("");
    setError(null);
  };

  const subtotal = cart.reduce((sum, item) => {
    const unit = productPrice({
      price: item.product.price,
      discountPrice: item.product.discountPrice,
    });
    return sum + unit * item.quantity;
  }, 0);

  const total = Math.max(0, subtotal - discount);
  const tenderedNum = Number(tenderedAmount) || total;
  const changeDue = Math.max(0, tenderedNum - total);
  const totalItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    setError(null);

    const payload = {
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      method: paymentMethod,
      discount: discount > 0 ? discount : undefined,
    };

    startTransition(async () => {
      const res = await createPosSaleAction(payload);
      if (res?.error) {
        setError(res.error);
      } else if (res?.order) {
        setCompletedReceipt({
          orderNumber: res.order.orderNumber,
          date: new Date().toLocaleString("en-IN"),
          items: [...cart],
          subtotal,
          discount,
          total,
          method: paymentMethod,
          tendered: paymentMethod === "CASH" ? tenderedNum : total,
          change: paymentMethod === "CASH" ? changeDue : 0,
        });
        clearCart();
      }
    });
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Top Floating Bar matching Image 1 */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 px-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Easy <span className="text-[#FF5C00]">POS</span>
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-500 pl-4 border-l border-slate-200">
            <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
            <Link href="/dashboard/orders" className="hover:text-slate-900">Order List</Link>
            <Link href="/dashboard/inventory" className="hover:text-slate-900">History</Link>
            <Link href="/dashboard/payments" className="hover:text-slate-900">Bills</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FF5C00] text-white px-5 py-2 rounded-full font-bold text-xs shadow-md shadow-orange-500/20">
            <span>New Order ({totalItemCount})</span>
          </div>

          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Bell className="h-4 w-4" />
          </div>

          <div className="flex items-center gap-2 pl-2">
            <div className="h-8 w-8 rounded-full bg-orange-100 text-[#FF5C00] font-bold text-xs flex items-center justify-center">
              {cashierName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Terminal Body: Catalog on Left (8 cols), Active Register on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Filter Pills + Search + Grid of Cards */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Chips and Search Box (Image 1 style) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              <button
                onClick={() => setSelectedCategory("ALL")}
                className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedCategory === "ALL"
                    ? "bg-[#FF5C00] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                    selectedCategory === c.id
                      ? "bg-[#FF5C00] text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Search Input with Green Icon Button */}
            <div className="relative w-full sm:w-64 shrink-0 flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search item or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/20"
              />
              <button className="absolute right-1 top-1 h-6 w-6 rounded-lg bg-[#00B074] text-white flex items-center justify-center">
                <Search className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Product Cards Grid (Image 1 style with white background, subtle drop shadow, and [- 1 +] quantity button) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const unitPrice = productPrice({
                price: p.price,
                discountPrice: p.discountPrice,
              });
              const currentQty = cart.find((i) => i.product.id === p.id)?.quantity ?? 0;
              const isOutOfStock = p.stock <= 0;

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl p-3 border transition-all flex flex-col justify-between group ${
                    currentQty > 0
                      ? "border-[#FF5C00] ring-1 ring-[#FF5C00]/20 shadow-sm"
                      : "border-slate-200/80 hover:shadow-md"
                  }`}
                >
                  <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-2 relative">
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300">
                        <Package className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-[11px] font-bold text-[#FF5C00] font-mono mt-0.5">
                      {formatInr(unitPrice)}
                    </p>
                  </div>

                  {/* Quantity selector button row matching Image 1 */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {p.stock} left
                    </span>

                    {currentQty === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateProductQuantityInCart(p, 1)}
                        disabled={isOutOfStock}
                        className="h-6 px-3 rounded-lg bg-[#FF5C00] hover:bg-[#E55300] text-white text-xs font-bold shadow-xs disabled:opacity-40"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateProductQuantityInCart(p, currentQty - 1)}
                          className="h-6 w-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-bold text-[#FF5C00] px-1">
                          {currentQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateProductQuantityInCart(p, currentQty + 1)}
                          className="h-6 w-6 rounded-lg bg-[#FF5C00] hover:bg-[#E55300] text-white font-bold flex items-center justify-center text-xs shadow-xs"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Checkout Register Panel */}
        <div id="pos-register" className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[#FF5C00]" />
              <h3 className="font-black text-sm text-slate-900">Current Register</h3>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-[11px] text-slate-400 hover:text-red-600 font-semibold">
                Reset
              </button>
            )}
          </div>

          {/* Cart Item Lines */}
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30 text-slate-400" />
                No items added yet. Click &apos;+ Add&apos; on products.
              </div>
            ) : (
              cart.map((item) => {
                const unit = productPrice({
                  price: item.product.price,
                  discountPrice: item.product.discountPrice,
                });
                return (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="font-bold text-slate-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {formatInr(unit)} &times; {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold font-mono text-slate-900">
                        {formatInr(unit * item.quantity)}
                      </span>
                      <button
                        onClick={() => updateProductQuantityInCart(item.product, 0)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal ({totalItemCount} items)</span>
              <span className="font-mono font-semibold text-slate-800">{formatInr(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Discount (₹)</span>
              <Input
                type="number"
                min="0"
                value={discount || ""}
                placeholder="0"
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-24 h-7 text-xs text-right bg-slate-50 rounded-lg"
              />
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Payable</span>
              <span className="text-[#FF5C00] font-mono font-black">{formatInr(total)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <span className="text-xs font-bold text-slate-700 block">Payment Method</span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: "CASH", label: "Cash", icon: Banknote },
                { id: "UPI", label: "UPI QR", icon: QrCode },
                { id: "CARD", label: "Card", icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border font-bold transition-all ${
                      isSelected
                        ? "bg-[#FF5C00] text-white border-[#FF5C00] shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Tender (Cash only) */}
            {paymentMethod === "CASH" && cart.length > 0 && (
              <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-100 space-y-2 text-xs mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Tendered:</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder={String(total)}
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    className="w-28 h-7 text-xs text-right bg-white rounded-lg"
                  />
                </div>
                {changeDue > 0 && (
                  <div className="flex justify-between font-bold text-[#00B074] pt-1 border-t border-orange-200/60">
                    <span>Change to Return:</span>
                    <span className="font-mono">{formatInr(changeDue)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={handleCompleteSale}
            disabled={cart.length === 0 || isPending}
            className="w-full h-11 rounded-2xl bg-[#FF5C00] hover:bg-[#E55300] text-white font-black text-sm shadow-md shadow-orange-500/20"
          >
            {isPending ? "Recording Sale..." : `Charge ${formatInr(total)}`}
          </Button>
        </div>
      </div>

      {/* Completed Sale Receipt Modal */}
      {completedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-[#00B074] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">Sale Complete!</h3>
              <p className="text-xs text-slate-500 font-mono">
                Invoice #{completedReceipt.orderNumber}
              </p>
            </div>

            <div className="border border-dashed border-slate-300 p-4 rounded-2xl bg-slate-50 text-left text-xs font-mono space-y-2">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <p className="font-bold text-sm text-slate-900">{shopName}</p>
                {shopAddress && <p className="text-[10px] text-slate-500">{shopAddress}</p>}
                {shopPhone && <p className="text-[10px] text-slate-500">Ph: {shopPhone}</p>}
                <p className="text-[10px] text-slate-400 mt-1">{completedReceipt.date}</p>
              </div>

              <div className="space-y-1 py-1">
                {completedReceipt.items.map((i) => {
                  const unit = productPrice({
                    price: i.product.price,
                    discountPrice: i.product.discountPrice,
                  });
                  return (
                    <div key={i.product.id} className="flex justify-between text-[11px]">
                      <span>{i.product.name} &times; {i.quantity}</span>
                      <span>{formatInr(unit * i.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-1.5 space-y-0.5 text-[11px]">
                {completedReceipt.discount > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Discount</span>
                    <span>-{formatInr(completedReceipt.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1">
                  <span>TOTAL PAID</span>
                  <span className="text-[#FF5C00]">{formatInr(completedReceipt.total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Method</span>
                  <span>{completedReceipt.method}</span>
                </div>
                {completedReceipt.method === "CASH" && (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Tendered</span>
                      <span>{formatInr(completedReceipt.tendered ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#00B074] font-bold">
                      <span>Change</span>
                      <span>{formatInr(completedReceipt.change ?? 0)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Print
              </Button>
              <Button
                className="flex-1 rounded-xl bg-[#FF5C00] hover:bg-[#E55300] text-white font-bold"
                onClick={() => setCompletedReceipt(null)}
              >
                Next Sale
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Register Summary & Quick Jump */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in register
            </span>
            <span className="text-base font-black text-[#FF5C00] font-mono leading-tight">
              {formatInr(total)}
            </span>
          </div>
          <Button
            variant="orange"
            size="sm"
            onClick={() => {
              document.getElementById("pos-register")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-xl px-4 py-2 font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5"
          >
            <span>Complete Sale</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
