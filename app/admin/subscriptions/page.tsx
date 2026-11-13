import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { AdminSubscriptionManager } from "@/components/admin-subscription-manager";

export default async function AdminSubscriptionsPage() {
  await requireAdmin();

  const [plansRaw, shopsRaw] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      orderBy: { priceMonthly: "asc" },
    }),
    prisma.shop.findMany({
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const plans = plansRaw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceMonthly: Number(p.priceMonthly),
    description: p.description,
    features: p.features,
  }));

  const shops = shopsRaw.map((s) => ({
    id: s.id,
    name: s.name,
    currentPlan: s.subscriptions[0]?.plan.name ?? null,
  }));

  return <AdminSubscriptionManager plans={plans} shops={shops} />;
}
