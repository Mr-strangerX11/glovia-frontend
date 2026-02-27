import dynamic from "next/dynamic";
import { fetchFeaturedProducts, fetchBanners } from "@/lib/serverApi";

const HomeContent = dynamic(() => import("./HomeContent.client"), { ssr: false });

export default async function HomePage() {
  // Fetch data on the server
  const featuredProducts = await fetchFeaturedProducts(8);
  const banners = await fetchBanners();
  return <HomeContent featuredProducts={featuredProducts} banners={banners} />;
}
