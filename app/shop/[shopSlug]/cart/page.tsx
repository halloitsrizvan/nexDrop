import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { StorefrontCartView } from "@/components/storefront-cart-view";

export default async function ShopCartPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/shop/${shopSlug}/cart`);
  }

  const shop = await prisma.shop.findUnique({
    where: { slug: shopSlug },
    include: { settings: true },
  });

  if (!shop || shop.status !== "ACTIVE") {
    notFound();
  }

  const cart = await prisma.cart.findUnique({
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

  const items = (cart?.items ?? []).map((i) => ({
    id: i.id,
    quantity: i.quantity,
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
    <StorefrontCartView
      shopSlug={shop.slug}
      items={items}
      minOrderValue={Number(shop.settings?.minOrderValue ?? 0)}
      deliveryCharge={Number(shop.settings?.deliveryCharge ?? 40)}
      freeDeliveryAbove={
        shop.settings?.freeDeliveryAbove
          ? Number(shop.settings.freeDeliveryAbove)
          : null
      }
    />
  );
}
