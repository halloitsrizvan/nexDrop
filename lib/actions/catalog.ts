"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { changeStock } from "@/lib/services/inventory";
import { slugify } from "@/lib/utils";
import { categorySchema, productSchema, stockAdjustSchema } from "@/lib/validations";

export async function createProductAction(formData: FormData) {
  const { shop, user } = await requireShopContext();

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    sku: formData.get("sku"),
    brand: formData.get("brand") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice") || undefined,
    stockQuantity: formData.get("stockQuantity") || 0,
    status: formData.get("status") || "ACTIVE",
    featured: formData.get("featured") === "true" || formData.get("featured") === "on",
    size: formData.get("size") || undefined,
    color: formData.get("color") || undefined,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Please verify all fields and try again." };
  }

  const existingSku = await prisma.product.findUnique({
    where: { shopId_sku: { shopId: shop.id, sku: parsed.data.sku } },
  });
  if (existingSku) {
    return { error: "A product with this SKU already exists in your shop." };
  }

  const imagesJson = formData.get("images") ? String(formData.get("images")) : "[]";
  let images: string[] = [];
  try {
    images = JSON.parse(imagesJson);
  } catch {
    images = [];
  }

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        shopId: shop.id,
        name: parsed.data.name,
        description: parsed.data.description,
        sku: parsed.data.sku,
        brand: parsed.data.brand,
        categoryId: parsed.data.categoryId || null,
        price: parsed.data.price,
        discountPrice: typeof parsed.data.discountPrice === "number" ? parsed.data.discountPrice : null,
        status: parsed.data.status,
        featured: !!parsed.data.featured,
        images,
        variants: (parsed.data.size || parsed.data.color)
          ? {
              create: [
                {
                  shopId: shop.id,
                  name: [parsed.data.size, parsed.data.color].filter(Boolean).join(" / ") || "Standard",
                  sku: `${parsed.data.sku}-STD`,
                  size: parsed.data.size,
                  color: parsed.data.color,
                  price: parsed.data.price,
                },
              ],
            }
          : undefined,
      },
    });

    const inventory = await tx.inventory.create({
      data: {
        shopId: shop.id,
        productId: product.id,
        quantity: parsed.data.stockQuantity,
      },
    });

    if (parsed.data.stockQuantity > 0) {
      await tx.stockMovement.create({
        data: {
          shopId: shop.id,
          inventoryId: inventory.id,
          type: "ADDED",
          quantity: parsed.data.stockQuantity,
          reason: "Initial stock on product creation",
          userId: user.id,
        },
      });
    }
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
  revalidatePath(`/shop/${shop.slug}`);
  redirect("/dashboard/products");
}

export async function updateProductAction(productId: string, formData: FormData) {
  const { shop } = await requireShopContext();

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    sku: formData.get("sku"),
    brand: formData.get("brand") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    price: formData.get("price"),
    discountPrice: formData.get("discountPrice") || undefined,
    stockQuantity: formData.get("stockQuantity") || 0,
    status: formData.get("status") || "ACTIVE",
    featured: formData.get("featured") === "true" || formData.get("featured") === "on",
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Please verify all fields and try again." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product || product.shopId !== shop.id) {
    return { error: "Product not found or access denied." };
  }

  const imagesJson = formData.get("images") ? String(formData.get("images")) : null;
  let images = product.images;
  if (imagesJson) {
    try {
      images = JSON.parse(imagesJson);
    } catch {
      // keep existing
    }
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      sku: parsed.data.sku,
      brand: parsed.data.brand,
      categoryId: parsed.data.categoryId || null,
      price: parsed.data.price,
      discountPrice: typeof parsed.data.discountPrice === "number" ? parsed.data.discountPrice : null,
      status: parsed.data.status,
      featured: !!parsed.data.featured,
      images,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/${productId}`);
  revalidatePath(`/shop/${shop.slug}`);
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  const { shop } = await requireShopContext();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.shopId !== shop.id) {
    throw new Error("Product not found");
  }

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/inventory");
  revalidatePath(`/shop/${shop.slug}`);
  redirect("/dashboard/products");
}

export async function createCategoryAction(formData: FormData) {
  const { shop } = await requireShopContext();

  const name = String(formData.get("name") ?? "").trim();
  const parsed = categorySchema.safeParse({ name });
  if (!parsed.success) return { error: "Invalid category name" };

  let slug = slugify(name);
  const existing = await prisma.category.findUnique({
    where: { shopId_slug: { shopId: shop.id, slug } },
  });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  await prisma.category.create({
    data: {
      shopId: shop.id,
      name,
      slug,
    },
  });

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string) {
  const { shop } = await requireShopContext();

  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat || cat.shopId !== shop.id) throw new Error("Category not found");

  await prisma.category.delete({ where: { id: categoryId } });

  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function adjustStockAction(formData: FormData) {
  const { shop, user } = await requireShopContext();

  const parsed = stockAdjustSchema.safeParse({
    productId: formData.get("productId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: "Check your stock adjustment inputs." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await changeStock(tx, {
        shopId: shop.id,
        productId: parsed.data.productId,
        type: parsed.data.type,
        quantity: parsed.data.quantity,
        reason: parsed.data.reason,
        userId: user.id,
      });
    });
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to adjust stock" };
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
  return { success: true };
}
