import dynamic from "next/dynamic";
import { fetchFeaturedProducts, fetchBanners } from "@/lib/serverApi";

const HomeContent = dynamic(() => import("./HomeContent.client"), { ssr: false });

function getErrorSummary(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "unknown error";
  }

  const possibleError = error as {
    message?: string;
    response?: { status?: number; statusText?: string };
    code?: string;
  };

  const status = possibleError.response?.status;
  const statusText = possibleError.response?.statusText;
  const message = possibleError.message;
  const code = possibleError.code;

  if (status && statusText) {
    return `${status} ${statusText}`;
  }

  if (status) {
    return `HTTP ${status}`;
  }

  if (message) {
    return code ? `${code}: ${message}` : message;
  }

  return "unknown error";
}

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
      `[HomePage] Featured products fetch failed (${getErrorSummary(
        featuredProductsResult.reason
      )}). Rendering without featured products.`
    );
  }

  if (bannersResult.status === "rejected") {
    console.warn(
      `[HomePage] Banners fetch failed (${getErrorSummary(
        bannersResult.reason
      )}). Rendering without banners.`
    );
  }

  return <HomeContent featuredProducts={featuredProducts} banners={banners} />;
}

