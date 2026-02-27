import dynamic from "next/dynamic";
import { fetchFeaturedProducts, fetchBanners } from "@/lib/serverApi";

const HomeContent = dynamic(() => import("./HomeContent.client"), { ssr: false });

export default async function HomePage() {
  // Fetch data on the server with error handling
  let featuredProducts = [];
  let banners = [];
  
  try {
    featuredProducts = await fetchFeaturedProducts(8) || [];
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
  }
  
  try {
    banners = await fetchBanners() || [];
  } catch (error) {
    console.error('Failed to fetch banners:', error);
  }
  
  return <HomeContent featuredProducts={featuredProducts} banners={banners} />;
}

