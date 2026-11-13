import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { ProductForm } from "@/components/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { shop } = await requireShopContext();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    }),
    prisma.category.findMany({
      where: { shopId: shop.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product || product.shopId !== shop.id) {
    notFound();
  }

  const initialData = {
    id: product.id,
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: product.brand,
    categoryId: product.categoryId,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    status: product.status,
    featured: product.featured,
    images: product.images,
    stockQuantity: product.inventory?.quantity ?? 0,
  };

  return <ProductForm categories={categories} initialData={initialData} />;
}
