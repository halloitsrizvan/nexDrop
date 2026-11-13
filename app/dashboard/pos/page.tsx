import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { PosTerminal } from "@/components/pos-terminal";

export default async function DashboardPosPage() {
  const { shop, user } = await requireShopContext();

  const [productsRaw, categories, shopSettings] = await Promise.all([
    prisma.product.findMany({
      where: { shopId: shop.id, status: "ACTIVE" },
      include: {
        inventory: { select: { quantity: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { shopId: shop.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.shopSettings.findUnique({
      where: { shopId: shop.id },
    }),
  ]);

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    images: p.images,
    categoryId: p.categoryId,
    stock: p.inventory?.quantity ?? 0,
  }));

  return (
    <PosTerminal
      shopName={shop.name}
      shopAddress={shopSettings?.address}
      shopPhone={shopSettings?.contactNumber}
      products={products}
      categories={categories}
      cashierName={user.name ?? "Cashier"}
    />
  );
}
