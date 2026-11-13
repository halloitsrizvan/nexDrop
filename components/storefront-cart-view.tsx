"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatInr, productPrice } from "@/lib/utils";
import { updateCartItemQtyAction } from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Package,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

interface CartLineItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    discountPrice: number | null;
    images: string[];
    stock: number;
  };
}

export function StorefrontCartView({
  shopSlug,
  items,
  minOrderValue,
  deliveryCharge,
  freeDeliveryAbove,
}: {
  shopSlug: string;
  items: CartLineItem[];
  minOrderValue: number;
  deliveryCharge: number;
  freeDeliveryAbove: number | null;
}) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateQty = (cartItemId: string, newQty: number) => {
    startTransition(async () => {
      await updateCartItemQtyAction(cartItemId, newQty);
    });
  };

  const subtotal = items.reduce((sum, item) => {
    const unit = productPrice({
      price: item.product.price,
      discountPrice: item.product.discountPrice,
    });
    return sum + unit * item.quantity;
  }, 0);

  const isFreeDelivery =
    freeDeliveryAbove !== null && subtotal >= freeDeliveryAbove;
  const delivery = items.length === 0 ? 0 : isFreeDelivery ? 0 : deliveryCharge;
  const total = subtotal + delivery;
  const belowMinOrder = subtotal < minOrderValue;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your selected groceries and order fulfillment details
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold">
          <Link href={`/shop/${shopSlug}`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="h-16 w-16 rounded-2xl bg-[#FFF2EC] text-[#FF5C00] flex items-center justify-center mx-auto shadow-xs">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xl">Your cart is empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore freshly stocked groceries, provisions, and spices from this store.
            </p>
          </div>
          <Button variant="orange" className="rounded-xl font-bold" asChild>
            <Link href={`/shop/${shopSlug}`}>Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => {
              const unit = productPrice({
                price: item.product.price,
                discountPrice: item.product.discountPrice,
              });
              const lineTotal = unit * item.quantity;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-100 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-orange-100 transition-all"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 p-1 overflow-hidden relative shrink-0 border border-slate-100 flex items-center justify-center">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {formatInr(unit)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Quantity controls matching Image 1 */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                        disabled={isPending}
                        className="h-7 w-7 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-xs rounded-lg active:scale-95 transition-all"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs font-mono text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                        disabled={isPending || item.quantity >= item.product.stock}
                        className="h-7 w-7 flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-xs rounded-lg active:scale-95 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-black text-sm text-slate-900 w-20 text-right font-mono">
                      {formatInr(lineTotal)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, 0)}
                      disabled={isPending}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 space-y-5">
            <h3 className="font-extrabold text-slate-900 text-lg">Order Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {formatInr(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900 font-mono">
                  {isFreeDelivery ? (
                    <span className="text-[#00B074] font-black">FREE</span>
                  ) : (
                    formatInr(delivery)
                  )}
                </span>
              </div>

              {freeDeliveryAbove && !isFreeDelivery && (
                <div className="p-2.5 rounded-xl bg-[#E6F7F0] text-[#00B074] text-[11px] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>
                    Add {formatInr(freeDeliveryAbove - subtotal)} more for Free Delivery
                  </span>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between font-black text-base text-slate-900">
                <span>Total Amount</span>
                <span className="font-mono text-xl text-[#FF5C00]">
                  {formatInr(total)}
                </span>
              </div>
            </div>

            {belowMinOrder ? (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  Minimum order amount is <strong>{formatInr(minOrderValue)}</strong>.
                </span>
              </div>
            ) : (
              <Button
                variant="orange"
                className="w-full rounded-2xl font-black text-sm h-11"
                asChild
              >
                <Link href={`/shop/${shopSlug}/checkout`}>
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
