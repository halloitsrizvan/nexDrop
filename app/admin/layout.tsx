import { requireAdmin } from "@/lib/permissions";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <AdminNav adminEmail={user.email ?? "admin@nexdrop.local"} />
      <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
