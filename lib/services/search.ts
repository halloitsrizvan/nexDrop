import { Prisma } from "@prisma/client";

/**
 * Postgres ILIKE search. Extensible later with pg_trgm / semantic search.
 */
export function productSearchWhere(shopId: string | undefined, q: string): Prisma.ProductWhereInput {
  const query = q.trim();
  const shopFilter = shopId ? { shopId } : {};
  if (!query) return { ...shopFilter, status: "ACTIVE" };
  return {
    ...shopFilter,
    status: "ACTIVE",
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { category: { name: { contains: query, mode: "insensitive" } } },
    ],
  };
}
