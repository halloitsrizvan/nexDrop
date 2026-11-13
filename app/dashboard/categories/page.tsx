import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { CategoryManager } from "@/components/category-manager";

export default async function DashboardCategoriesPage() {
  const { shop } = await requireShopContext();

  const categories = await prisma.category.findMany({
    where: { shopId: shop.id },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return <CategoryManager categories={categories} />;
}
