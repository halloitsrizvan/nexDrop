import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { StorefrontWishlistView } from "@/components/storefront-wishlist-view";

export default async function ShopWishlistPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/shop/${shopSlug}/wishlist`);
  }

  const shop = await prisma.shop.findUnique({
    where: { slug: shopSlug },
  });

  if (!shop || shop.status !== "ACTIVE") {
    notFound();
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId_shopId: { userId: session.user.id, shopId: shop.id } },
    include: {
      items: {
        include: {
          product: {
            include: { inventory: { select: { quantity: true } } },
          },
        },
      },
    },
  });

  const items = (wishlist?.items ?? []).map((i) => ({
    id: i.id,
    product: {
      id: i.product.id,
      name: i.product.name,
      sku: i.product.sku,
      price: Number(i.product.price),
      discountPrice: i.product.discountPrice ? Number(i.product.discountPrice) : null,
      images: i.product.images,
      stock: i.product.inventory?.quantity ?? 0,
    },
  }));

  return (
    <StorefrontWishlistView
      shopId={shop.id}
      shopSlug={shop.slug}
      items={items}
    />
  );
}
