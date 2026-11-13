"use server";

import { revalidatePath } from "next/cache";
import { CouponType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { couponSchema, shopSettingsSchema } from "@/lib/validations";

export async function createCouponAction(formData: FormData) {
  const { shop } = await requireShopContext();

  const raw = {
    code: String(formData.get("code") ?? "").toUpperCase().trim(),
    type: formData.get("type") as CouponType,
    value: Number(formData.get("value") ?? 0),
    minOrder: Number(formData.get("minOrder") ?? 0),
    active: formData.get("active") === "true" || formData.get("active") === "on",
  };

  const parsed = couponSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please check coupon inputs." };

  const existing = await prisma.coupon.findUnique({
    where: { shopId_code: { shopId: shop.id, code: parsed.data.code } },
  });
  if (existing) return { error: "Coupon code already exists in this shop." };

  await prisma.coupon.create({
    data: {
      shopId: shop.id,
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrder: parsed.data.minOrder ?? 0,
      active: parsed.data.active ?? true,
    },
  });

  revalidatePath("/dashboard/coupons");
  return { success: true };
}

export async function deleteCouponAction(couponId: string) {
  const { shop } = await requireShopContext();

  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!coupon || coupon.shopId !== shop.id) throw new Error("Coupon not found");

  await prisma.coupon.delete({ where: { id: couponId } });

  revalidatePath("/dashboard/coupons");
  return { success: true };
}

export async function updateShopSettingsAction(formData: FormData) {
  const { shop } = await requireShopContext();

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    contactNumber: formData.get("contactNumber") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    pinCode: formData.get("pinCode") || undefined,
    businessCategory: formData.get("businessCategory") || undefined,
    openingHours: formData.get("openingHours") || undefined,
    deliveryEnabled: formData.get("deliveryEnabled") === "true" || formData.get("deliveryEnabled") === "on",
    pickupEnabled: formData.get("pickupEnabled") === "true" || formData.get("pickupEnabled") === "on",
    deliveryCharge: Number(formData.get("deliveryCharge") ?? 40),
    minOrderValue: Number(formData.get("minOrderValue") ?? 0),
    storeOpen: formData.get("storeOpen") === "true" || formData.get("storeOpen") === "on",
  };

  const parsed = shopSettingsSchema.safeParse(raw);
  if (!parsed.success) return { error: "Please verify all fields and try again." };

  await prisma.$transaction([
    prisma.shop.update({
      where: { id: shop.id },
      data: { name: parsed.data.name },
    }),
    prisma.shopSettings.upsert({
      where: { shopId: shop.id },
      update: {
        contactNumber: parsed.data.contactNumber,
        email: parsed.data.email || null,
        address: parsed.data.address,
        pinCode: parsed.data.pinCode,
        businessCategory: parsed.data.businessCategory,
        openingHours: parsed.data.openingHours,
        deliveryEnabled: parsed.data.deliveryEnabled ?? true,
        pickupEnabled: parsed.data.pickupEnabled ?? true,
        deliveryCharge: parsed.data.deliveryCharge,
        minOrderValue: parsed.data.minOrderValue,
        storeOpen: parsed.data.storeOpen ?? true,
      },
      create: {
        shopId: shop.id,
        contactNumber: parsed.data.contactNumber,
        email: parsed.data.email || null,
        address: parsed.data.address,
        pinCode: parsed.data.pinCode,
        businessCategory: parsed.data.businessCategory,
        openingHours: parsed.data.openingHours,
        deliveryEnabled: parsed.data.deliveryEnabled ?? true,
        pickupEnabled: parsed.data.pickupEnabled ?? true,
        deliveryCharge: parsed.data.deliveryCharge,
        minOrderValue: parsed.data.minOrderValue,
        storeOpen: parsed.data.storeOpen ?? true,
      },
    }),
  ]);

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath(`/shop/${shop.slug}`);
  return { success: true };
}
