import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { ShopSettingsForm } from "@/components/shop-settings-form";

export default async function DashboardSettingsPage() {
  const { shop } = await requireShopContext();

  const settings = await prisma.shopSettings.findUnique({
    where: { shopId: shop.id },
  });

  const initialData = {
    name: shop.name,
    slug: shop.slug,
    description: "",
    contactNumber: settings?.contactNumber,
    email: settings?.email,
    address: settings?.address,
    pinCode: settings?.pinCode,
    businessCategory: settings?.businessCategory,
    openingHours: settings?.openingHours,
    deliveryEnabled: settings?.deliveryEnabled ?? true,
    pickupEnabled: settings?.pickupEnabled ?? true,
    deliveryCharge: Number(settings?.deliveryCharge ?? 40),
    minOrderValue: Number(settings?.minOrderValue ?? 0),
    storeOpen: settings?.storeOpen ?? true,
  };

  return <ShopSettingsForm initialData={initialData} />;
}
