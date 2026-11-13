import { prisma } from "@/lib/db";
import { requireShopContext } from "@/lib/permissions";
import { CouponsManager } from "@/components/coupons-manager";

export default async function DashboardCouponsPage() {
  const { shop } = await requireShopContext();

  const couponsRaw = await prisma.coupon.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
  });

  const coupons = couponsRaw.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    minOrder: Number(c.minOrder),
    active: c.active,
  }));

  return <CouponsManager coupons={coupons} />;
}
