import dynamic from "next/dynamic";
import { fetchFeaturedProducts, fetchBanners } from "@/lib/serverApi";
import { getServerErrorSummary } from "@/lib/serverError";

const HomeContent = dynamic(() => import("./HomeContent.client"), { ssr: false });

export default async function HomePage() {
  const [featuredProductsResult, bannersResult] = await Promise.allSettled([
    fetchFeaturedProducts(8),
    fetchBanners(),
  ]);

  const featuredProducts =
    featuredProductsResult.status === "fulfilled"
      ? featuredProductsResult.value || []
      : [];

  const banners =
    bannersResult.status === "fulfilled"
      ? bannersResult.value || []
      : [];

  if (featuredProductsResult.status === "rejected") {
    console.warn(
      `[HomePage] Featured products fetch failed (${getServerErrorSummary(
        featuredProductsResult.reason
      )}). Rendering without featured products.`
    );
  }

  if (bannersResult.status === "rejected") {
    console.warn(
      `[HomePage] Banners fetch failed (${getServerErrorSummary(
        bannersResult.reason
      )}). Rendering without banners.`
    );
  }

  return <HomeContent featuredProducts={featuredProducts} banners={banners} />;
}

