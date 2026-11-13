import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { StorefrontCatalog } from "@/components/storefront-catalog";

export default async function ShopHomePage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;
  const session = await auth();

  const shop = await prisma.shop.findUnique({
    where: { slug: shopSlug },
  });

  if (!shop || shop.status !== "ACTIVE") {
    notFound();
  }

  const [productsRaw, categories] = await Promise.all([
    prisma.product.findMany({
      where: { shopId: shop.id, status: "ACTIVE" },
      include: {
        inventory: { select: { quantity: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({
      where: { shopId: shop.id },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    description: p.description,
    brand: p.brand,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    images: p.images,
    featured: p.featured,
    categoryId: p.categoryId,
    stock: p.inventory?.quantity ?? 0,
  }));

  return (
    <StorefrontCatalog
      shopId={shop.id}
      shopSlug={shop.slug}
      products={products}
      categories={categories}
      isLoggedIn={!!session?.user}
    />
  );
}
