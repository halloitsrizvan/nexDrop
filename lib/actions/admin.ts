"use server";

import { revalidatePath } from "next/cache";
import { ShopStatus, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";

export async function updateShopStatusAction(shopId: string, status: ShopStatus) {
  await requireAdmin();

  await prisma.shop.update({
    where: { id: shopId },
    data: { status },
  });

  revalidatePath("/admin/shops");
  revalidatePath("/admin");
  return { success: true };
}

export async function createSubscriptionPlanAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const priceMonthly = Number(formData.get("priceMonthly") ?? 0);
  const description = String(formData.get("description") ?? "");
  const featuresRaw = String(formData.get("features") ?? "");
  const features = featuresRaw.split(",").map((f) => f.trim()).filter(Boolean);

  if (!name || !slug) return { error: "Name and slug are required" };

  await prisma.subscriptionPlan.create({
    data: {
      name,
      slug,
      priceMonthly,
      description,
      features,
    },
  });

  revalidatePath("/admin/subscriptions");
  return { success: true };
}

export async function updateSubscriptionPlanAction(planId: string, formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const priceMonthly = Number(formData.get("priceMonthly") ?? 0);
  const description = String(formData.get("description") ?? "");
  const featuresRaw = String(formData.get("features") ?? "");
  const features = featuresRaw.split(",").map((f) => f.trim()).filter(Boolean);

  if (!name || !slug) return { error: "Name and slug are required" };

  try {
    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        name,
        slug,
        priceMonthly,
        description,
        features,
      },
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath("/#pricing");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update plan" };
  }
}

export async function deleteSubscriptionPlanAction(planId: string) {
  await requireAdmin();

  try {
    // Check if there are active subscriptions
    const subCount = await prisma.subscription.count({
      where: { planId, status: "ACTIVE" },
    });
    if (subCount > 0) {
      return { error: `Cannot delete plan with ${subCount} active shop subscriptions.` };
    }

    await prisma.subscriptionPlan.delete({
      where: { id: planId },
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath("/#pricing");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete plan" };
  }
}

export async function assignShopSubscriptionAction(data: {
  shopId: string;
  planId: string;
  status: SubscriptionStatus;
}) {
  await requireAdmin();

  // Deactivate existing subscriptions if any
  await prisma.subscription.updateMany({
    where: { shopId: data.shopId },
    data: { status: "CANCELLED" },
  });

  await prisma.subscription.create({
    data: {
      shopId: data.shopId,
      planId: data.planId,
      status: data.status,
      startedAt: new Date(),
    },
  });

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/shops");
  return { success: true };
}

export async function updatePlatformSettingAction(key: string, value: string) {
  await requireAdmin();

  await prisma.platformSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
