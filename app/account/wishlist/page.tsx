import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/permissions";
import { formatInr, productPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Store, Package } from "lucide-react";

export default async function CustomerWishlistPage() {
  const user = await requireSession();

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { wishlist: { userId: user.id } },
    include: {
      product: {
        include: {
          shop: { select: { name: true, slug: true } },
          inventory: { select: { quantity: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Wishlist</h1>
        <p className="text-xs text-slate-500">
          Saved products from local shops for quick ordering
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <Card className="p-16 text-center border-dashed">
          <Heart className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-800">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Browse our neighborhood shops and save products you like.
          </p>
          <Button asChild size="sm">
            <Link href="/">Explore Stores</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlistItems.map((item) => {
            const unit = productPrice({
              price: item.product.price,
              discountPrice: item.product.discountPrice,
            });

            return (
              <Card key={item.id} className="overflow-hidden flex flex-col justify-between">
                <div className="aspect-square bg-slate-100 relative">
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
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Store className="h-3 w-3 text-green-700" />
                    <Link
                      href={`/shop/${item.product.shop.slug}`}
                      className="hover:underline truncate"
                    >
                      {item.product.shop.name}
                    </Link>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="font-bold text-xs text-slate-900 font-mono">
                    {formatInr(unit)}
                  </p>
                  <Button asChild size="sm" className="w-full text-xs h-8">
                    <Link href={`/shop/${item.product.shop.slug}`}>
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      View in Store
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
