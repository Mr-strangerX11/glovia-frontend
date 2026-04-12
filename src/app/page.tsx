import { fetchBrands, fetchBanners } from "@/lib/serverApi";
import { getServerErrorSummary } from "@/lib/serverError";
import HomeContent from "./HomeContent.client";
import type { Metadata } from 'next';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Shop from Nepal\'s best vendors — Beauty, Medicine, Clothing & Essentials. Trusted sellers, fast delivery, secure checkout.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Glovia Marketplace — Nepal\'s Premier Vendor Platform',
    description:
      'Discover verified vendors across Beauty, Medicine, Clothing & Essentials. Premium marketplace built for Nepal.',
    url: '/',
    type: 'website',
  },
};

export default async function HomePage() {
  const [brandsResult, bannersResult] = await Promise.allSettled([
    fetchBrands(),
    fetchBanners(),
  ]);

  const brands =
    brandsResult.status === "fulfilled"
      ? brandsResult.value || []
      : [];

  const banners =
    bannersResult.status === "fulfilled"
      ? bannersResult.value || []
      : [];

  if (brandsResult.status === "rejected") {
    console.warn(
      `[HomePage] Brands fetch failed (${getServerErrorSummary(
        brandsResult.reason
      )}). Rendering without vendors.`
    );
  }

  if (bannersResult.status === "rejected") {
    console.warn(
      `[HomePage] Banners fetch failed (${getServerErrorSummary(
        bannersResult.reason
      )}). Rendering without banners.`
    );
  }

  return <HomeContent brands={brands} banners={banners} />;
}
