"use server";

import { prisma } from "@/lib/db";

export interface MarketplaceShop {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  businessCategory: string;
  address: string | null;
  contactNumber: string | null;
  freeDeliveryAbove: number | null;
  deliveryCharge: number;
  productCount: number;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  brand: string | null;
  price: number;
  discountPrice: number | null;
  images: string[];
  featured: boolean;
  categoryId: string | null;
  categoryName: string | null;
  stock: number;
  shopId: string;
  shopName: string;
  shopSlug: string;
  shopCategory: string;
}

export async function getMarketplaceData(params?: {
  q?: string;
  category?: string;
  shopId?: string;
}) {
  const q = params?.q?.trim();
  const shopFilter = params?.shopId && params.shopId !== "ALL" ? params.shopId : undefined;
  const categoryFilter = params?.category && params.category !== "ALL" ? params.category : undefined;

  // 1. Fetch all active shops
  const rawShops = await prisma.shop.findMany({
    where: { status: "ACTIVE" },
    include: {
      settings: true,
      _count: {
        select: {
          products: { where: { status: "ACTIVE" } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const shops: MarketplaceShop[] = rawShops.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    logo: s.logo,
    description: s.description,
    businessCategory: s.settings?.businessCategory || "General Superstore",
    address: s.settings?.address || null,
    contactNumber: s.settings?.contactNumber || null,
    freeDeliveryAbove: s.settings?.freeDeliveryAbove ? Number(s.settings.freeDeliveryAbove) : null,
    deliveryCharge: Number(s.settings?.deliveryCharge ?? 40),
    productCount: s._count.products,
  }));

  // 2. Fetch products from active shops with search & filter
  const productWhere: Record<string, unknown> = {
    status: "ACTIVE",
    shop: { status: "ACTIVE" },
  };

  if (shopFilter) {
    productWhere.shopId = shopFilter;
  }

  if (categoryFilter) {
    productWhere.OR = [
      { categoryId: categoryFilter },
      { category: { name: { equals: categoryFilter, mode: "insensitive" } } },
    ];
  }

  if (q) {
    productWhere.AND = [
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { shop: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
    ];
  }

  const [rawProducts, rawCategories] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      include: {
        shop: { select: { id: true, name: true, slug: true, settings: { select: { businessCategory: true } } } },
        category: { select: { id: true, name: true } },
        inventory: { select: { quantity: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 60,
    }),
    prisma.category.findMany({
      where: { shop: { status: "ACTIVE" } },
      select: { id: true, name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
    }),
  ]);

  const products: MarketplaceProduct[] = rawProducts.map((p) => ({
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
    categoryName: p.category?.name || null,
    stock: p.inventory?.quantity ?? 0,
    shopId: p.shop.id,
    shopName: p.shop.name,
    shopSlug: p.shop.slug,
    shopCategory: p.shop.settings?.businessCategory || "Superstore",
  }));

  return {
    shops,
    products,
    categories: rawCategories.map((c) => ({ id: c.id, name: c.name })),
  };
}
