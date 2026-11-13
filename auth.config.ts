import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.shopId = (user as { shopId?: string | null }).shopId;
        token.shopSlug = (user as { shopSlug?: string | null }).shopSlug;
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role ?? "CUSTOMER") as "SUPER_ADMIN" | "SHOP_OWNER" | "CUSTOMER";
        session.user.shopId = (token.shopId as string | null | undefined) ?? null;
        session.user.shopSlug = (token.shopSlug as string | null | undefined) ?? null;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
