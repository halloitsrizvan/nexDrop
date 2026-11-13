import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { StorefrontCheckoutView } from "@/components/storefront-checkout-view";

export default async function ShopCheckoutPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;
  const session = await auth();

  const shop = await prisma.shop.findUnique({
    where: { slug: shopSlug },
    include: { settings: true },
  });

  if (!shop || shop.status !== "ACTIVE") {
    notFound();
  }

  let cartItems: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      discountPrice: number | null;
    };
  }[] = [];

  let addresses: {
    id: string;
    label: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pinCode: string;
    phone?: string | null;
    isDefault: boolean;
  }[] = [];

  if (session?.user) {
    const [cart, addressesRaw] = await Promise.all([
      prisma.cart.findUnique({
        where: { userId_shopId: { userId: session.user.id, shopId: shop.id } },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.address.findMany({
        where: { userId: session.user.id },
        orderBy: { isDefault: "desc" },
      }),
    ]);

    cartItems = (cart?.items ?? []).map((i) => ({
      id: i.id,
      quantity: i.quantity,
      product: {
        id: i.product.id,
        name: i.product.name,
        price: Number(i.product.price),
        discountPrice: i.product.discountPrice ? Number(i.product.discountPrice) : null,
      },
    }));

    addresses = addressesRaw.map((a) => ({
      id: a.id,
      label: a.label,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      pinCode: a.pinCode,
      phone: a.phone,
      isDefault: a.isDefault,
    }));
  }

  return (
    <StorefrontCheckoutView
      shopId={shop.id}
      shopSlug={shop.slug}
      addresses={addresses}
      cartItems={cartItems}
      deliveryCharge={Number(shop.settings?.deliveryCharge ?? 40)}
      freeDeliveryAbove={
        shop.settings?.freeDeliveryAbove
          ? Number(shop.settings.freeDeliveryAbove)
          : null
      }
      isLoggedIn={!!session?.user}
    />
  );
}
