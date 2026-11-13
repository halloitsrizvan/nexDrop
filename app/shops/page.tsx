import { auth } from "@/auth";
import { getMarketplaceData } from "@/lib/actions/marketplace";
import { MarketplaceView } from "@/components/marketplace-view";

export const dynamic = "force-dynamic";

export default async function ShopsMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    shopId?: string;
    tab?: string;
  }>;
}) {
  const params = await searchParams;
  const session = await auth();

  const data = await getMarketplaceData({
    q: params.q,
    category: params.category,
    shopId: params.shopId,
  });

  return (
    <MarketplaceView
      shops={data.shops}
      products={data.products}
      categories={data.categories}
      initialQuery={params.q || ""}
      initialTab={params.tab === "shops" ? "shops" : "products"}
      isLoggedIn={!!session?.user}
    />
  );
}
