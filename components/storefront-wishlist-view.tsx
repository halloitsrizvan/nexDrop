"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatInr, productPrice } from "@/lib/utils";
import { addToCartAction, toggleWishlistAction } from "@/lib/actions/customer";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package } from "lucide-react";

interface WishlistLineItem {
  id: string;
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

export function StorefrontWishlistView({
  shopId,
  shopSlug,
  items,
}: {
  shopId: string;
  shopSlug: string;
  items: WishlistLineItem[];
}) {
  const [isPending, startTransition] = useTransition();

  const handleMoveToCart = (productId: string) => {
    startTransition(async () => {
      await addToCartAction(shopId, productId, 1);
      await toggleWishlistAction(shopId, productId);
    });
  };

  const handleRemove = (productId: string) => {
    startTransition(async () => {
      await toggleWishlistAction(shopId, productId);
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Your Wishlist
        </h1>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/shop/${shopSlug}`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">No saved items</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tap the heart icon on any product to save it here for later.
            </p>
          </div>
          <Button asChild>
            <Link href={`/shop/${shopSlug}`}>Explore Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => {
            const unit = productPrice({
              price: item.product.price,
              discountPrice: item.product.discountPrice,
            });

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between p-4 space-y-3 shadow-xs"
              >
                <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <Package className="h-10 w-10" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(item.product.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-slate-400 hover:text-red-600 shadow-xs"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-xs font-bold text-slate-900 font-mono mt-1">
                    {formatInr(unit)}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleMoveToCart(item.product.id)}
                  disabled={isPending || item.product.stock <= 0}
                  className="w-full text-xs font-semibold"
                >
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                  {item.product.stock > 0 ? "Move to Cart" : "Out of Stock"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
