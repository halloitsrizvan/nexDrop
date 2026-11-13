import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { ProductForm } from "@/components/product-form";

export default async function NewProductPage() {
  const { shop } = await requireShopContext();

  const categories = await prisma.category.findMany({
    where: { shopId: shop.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <ProductForm categories={categories} />;
}
