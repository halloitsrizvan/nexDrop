import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { ProductCatalogView } from "@/components/product-catalog-view";

export default async function DashboardProductsPage() {
  const { shop } = await requireShopContext();

  const [productsRaw, categories] = await Promise.all([
    prisma.product.findMany({
      where: { shopId: shop.id },
      include: {
        category: { select: { id: true, name: true } },
        inventory: { select: { quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { shopId: shop.id },
      select: {
        id: true,
        name: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    status: p.status,
    images: p.images,
    category: p.category,
    inventory: p.inventory,
  }));

  return <ProductCatalogView products={products} categories={categories} />;
}
