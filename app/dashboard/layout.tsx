import { requireShopContext } from "@/lib/permissions";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, shop } = await requireShopContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <DashboardNav
        shopName={shop.name}
        shopSlug={shop.slug}
        ownerName={user.name ?? "Shop Owner"}
      />
      <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
