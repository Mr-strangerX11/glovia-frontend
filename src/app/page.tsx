import { fetchFeaturedProducts, fetchBanners } from "@/lib/serverApi";
import { getServerErrorSummary } from "@/lib/serverError";
import HomeContent from "./HomeContent.client";
import type { Metadata } from 'next';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Shop premium skincare, haircare, makeup, and beauty essentials in Nepal with trusted delivery and secure checkout.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Glovia Market place - Premium Beauty Marketplace',
    description:
      'Discover trending beauty products, seasonal offers, and trusted sellers across Nepal.',
    url: '/',
    type: 'website',
  },
};

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

