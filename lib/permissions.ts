import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireSession();
  if (!roles.includes(user.role)) {
    if (user.role === "SUPER_ADMIN") redirect("/admin");
    if (user.role === "SHOP_OWNER") redirect("/dashboard");
    redirect("/account");
  }
  return user;
}

export async function requireShopContext() {
  const user = await requireRole("SHOP_OWNER", "SUPER_ADMIN");
  if (user.role === "SUPER_ADMIN" && user.shopId) {
    const shop = await prisma.shop.findUnique({ where: { id: user.shopId } });
    if (!shop) redirect("/admin");
    return { user, shop };
  }

  const membership = await prisma.shopMember.findFirst({
    where: { userId: user.id },
    include: { shop: true },
    orderBy: { createdAt: "asc" },
  });
  if (!membership) redirect("/login");
  if (membership.shop.status === "SUSPENDED") redirect("/dashboard/suspended");
  return { user, shop: membership.shop };
}

export async function requireAdmin() {
  return requireRole("SUPER_ADMIN");
}

export function assertShopId(expected: string, given: string | undefined) {
  if (!given || given !== expected) {
    throw new Error("Unauthorized shop access");
  }
}
