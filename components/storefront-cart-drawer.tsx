"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { PaymentMethod } from "@prisma/client";
import { formatInr, productPrice } from "@/lib/utils";
import { placeGuestOrderAction } from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
  Truck,
  AlertCircle,
  CreditCard,
  User,
  Phone,
  MapPin,
  Sparkles,
} from "lucide-react";

export interface DrawerCartItem {
  id: string; // Product id
  name: string;
  price: number;
  discountPrice: number | null;
  images: string[];
  quantity: number;
  stock: number;
  brand?: string | null;
}

export function StorefrontCartDrawer({
  isOpen,
  onClose,
  shopId,
  shopSlug,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  deliveryCharge = 40,
  freeDeliveryAbove = null,
  minOrderValue = 0,
}: {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopSlug: string;
  items: DrawerCartItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  deliveryCharge?: number;
  freeDeliveryAbove?: number | null;
  minOrderValue?: number;
}) {
  const [viewMode, setViewMode] = useState<"cart" | "checkout" | "success">("cart");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCity, setCustomerCity] = useState("Kochi");
  const [customerPinCode, setCustomerPinCode] = useState("682001");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const unit = productPrice({
      price: item.price,
      discountPrice: item.discountPrice,
    });
    return sum + unit * item.quantity;
  }, 0);

  const isFreeDelivery = freeDeliveryAbove !== null && subtotal >= freeDeliveryAbove;
  const delivery = isFreeDelivery ? 0 : deliveryCharge;
  const grandTotal = subtotal + delivery;

  // Free delivery progress calculation
  const amountNeededForFree = freeDeliveryAbove ? Math.max(0, freeDeliveryAbove - subtotal) : 0;
  const freeDeliveryProgress = freeDeliveryAbove
    ? Math.min(100, Math.round((subtotal / freeDeliveryAbove) * 100))
    : 100;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setError("Please fill in your name, mobile number, and address.");
      return;
    }
    if (minOrderValue > 0 && subtotal < minOrderValue) {
      setError(`Minimum order value for this store is ₹${minOrderValue}`);
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await placeGuestOrderAction({
        shopId,
        customerName: customerName.trim(),
        phone: customerPhone.trim(),
        address: {
          line1: customerAddress.trim(),
          city: customerCity.trim() || "Kochi",
          state: "Kerala",
          pinCode: customerPinCode.trim() || "682001",
        },
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        paymentMethod,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.orderNumber) {
        setPlacedOrderNumber(res.orderNumber);
        setViewMode("success");
        onClearCart();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out border-l border-slate-100">
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#DEF3E3] text-[#00B074] flex items-center justify-center font-bold">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {viewMode === "checkout"
                      ? "Quick Guest Checkout"
                      : viewMode === "success"
                      ? "Order Confirmed!"
                      : "Shopping Cart"}
                  </h3>
                  {items.length > 0 && viewMode === "cart" && (
                    <span className="px-2 py-0.5 rounded-full bg-[#00B074] text-white text-[10px] font-black">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {viewMode === "checkout"
                    ? "No sign up required • Pay on delivery"
                    : "Fresh neighborhood store delivery"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              title="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 2. Free Delivery Banner (When in cart mode) */}
          {viewMode === "cart" && freeDeliveryAbove && (
            <div className="bg-[#F4FBF7] border-b border-emerald-100 px-4 py-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-[#00B074]" />
                  {isFreeDelivery ? (
                    <span className="text-[#00B074] font-black">
                      🎉 You unlocked FREE Delivery!
                    </span>
                  ) : (
                    <>
                      Add <strong className="text-[#00B074] font-mono">{formatInr(amountNeededForFree)}</strong> more for FREE delivery
                    </>
                  )}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-400">
                  {freeDeliveryProgress}%
                </span>
              </div>
              <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#00B074] h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 3. Main Content: Cart List, Guest Checkout, or Success Screen */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* A. SUCCESS VIEW */}
            {viewMode === "success" ? (
              <div className="py-12 text-center space-y-5">
                <div className="h-16 w-16 rounded-full bg-[#DEF3E3] text-[#00B074] mx-auto flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Order Received Successfully!
                  </span>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">
                    Thank You, {customerName}!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Your order has been sent directly to the store manager. We are packing your fresh groceries now.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 max-w-xs mx-auto text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order Number:</span>
                    <span className="font-mono font-bold text-[#00B074]">
                      #{placedOrderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Delivery Address:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">
                      {customerAddress}, {customerCity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment:</span>
                    <span className="font-bold text-slate-800">
                      Cash or UPI on Delivery
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setViewMode("cart");
                      onClose();
                    }}
                    className="w-full bg-[#00B074] hover:bg-[#009663] text-white font-bold text-xs rounded-xl h-10 shadow-xs"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            ) : viewMode === "checkout" ? (
              /* B. QUICK GUEST CHECKOUT FORM */
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700">
                    Delivery &amp; Contact Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewMode("cart")}
                    className="text-xs text-[#00B074] font-bold hover:underline"
                  >
                    &larr; Back to cart
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <User className="h-3 w-3 text-[#00B074]" />
                      Full Name *
                    </Label>
                    <Input
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-9 text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <Phone className="h-3 w-3 text-[#00B074]" />
                      Mobile / WhatsApp Number *
                    </Label>
                    <Input
                      required
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="h-9 text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3 w-3 text-[#00B074]" />
                      Delivery Address *
                    </Label>
                    <Input
                      required
                      placeholder="House / Flat No, Street name"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="h-9 text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] font-bold text-slate-700 mb-1 block">
                        City
                      </Label>
                      <Input
                        required
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="h-9 text-xs text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold text-slate-700 mb-1 block">
                        PIN Code
                      </Label>
                      <Input
                        required
                        value={customerPinCode}
                        onChange={(e) => setCustomerPinCode(e.target.value)}
                        className="h-9 text-xs text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Payment Method Option */}
                  <div className="pt-2">
                    <Label className="text-[11px] font-bold text-slate-700 mb-1.5 block">
                      Payment Mode
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("COD")}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === "COD"
                            ? "border-[#00B074] bg-[#DEF3E3]/40 text-[#00B074] font-bold ring-1 ring-[#00B074]"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-xs font-bold">Cash on Delivery</span>
                        <span className="text-[10px] text-slate-400">Pay cash at door</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("UPI")}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === "UPI"
                            ? "border-[#00B074] bg-[#DEF3E3]/40 text-[#00B074] font-bold ring-1 ring-[#00B074]"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="block text-xs font-bold">UPI on Delivery</span>
                        <span className="text-[10px] text-slate-400">Scan QR at door</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[#00B074] hover:bg-[#009663] text-white font-extrabold text-xs rounded-xl h-11 shadow-sm flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      "Placing Order..."
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Confirm &amp; Place Order ({formatInr(grandTotal)})
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : items.length === 0 ? (
              /* C. EMPTY CART VIEW */
              <div className="py-16 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">
                    Your cart is empty
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Add farm-fresh produce, groceries, and provisions from our catalog to get started.
                  </p>
                </div>
                <Button
                  onClick={onClose}
                  className="bg-[#00B074] hover:bg-[#009663] text-white text-xs font-bold rounded-xl"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              /* D. CART ITEMS LIST */
              <div className="space-y-3">
                {items.map((item) => {
                  const effectivePrice = item.discountPrice ?? item.price;
                  const itemTotal = effectivePrice * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-[#FDFDFD] hover:border-slate-200 transition-colors"
                    >
                      {/* Product thumbnail */}
                      <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100">
                        {item.images[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-slate-300" />
                        )}
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-mono text-xs font-black text-[#00B074]">
                            {formatInr(effectivePrice)}
                          </span>
                          {item.discountPrice && (
                            <span className="font-mono text-[10px] text-slate-400 line-through">
                              {formatInr(item.price)}
                            </span>
                          )}
                        </div>

                        {/* Interactive Quantity Adjusters [- 1 +] */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, -1)}
                              className="h-6 w-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-xs font-mono text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.id, 1)}
                              className="h-6 w-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <span className="font-mono text-xs font-black text-slate-900">
                            {formatInr(itemTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Footer Summary (Only in Cart mode with items) */}
          {viewMode === "cart" && items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatInr(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Delivery</span>
                  <span
                    className={`font-mono font-bold ${
                      delivery === 0 ? "text-[#00B074]" : "text-slate-800"
                    }`}
                  >
                    {delivery === 0 ? "FREE" : formatInr(delivery)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                  <span className="font-extrabold text-slate-900 text-sm">
                    Grand Total
                  </span>
                  <span className="font-mono font-black text-lg text-[#00B074]">
                    {formatInr(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Direct Checkout without sign up */}
              <div className="space-y-2 pt-1">
                <Button
                  onClick={() => setViewMode("checkout")}
                  className="w-full bg-[#00B074] hover:bg-[#009663] text-white font-extrabold text-xs rounded-xl h-11 shadow-sm flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-[#00B074]" />
                    Guest Checkout Supported
                  </span>
                  <button
                    onClick={onClose}
                    className="hover:text-slate-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
