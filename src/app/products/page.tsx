import ProductsContent from "./ProductsContent.client";
import { fetchAllProducts, fetchBrands, fetchCategories, fetchFeaturedProducts, fetchWishlist } from "@/lib/serverApi";
import { cookies } from "next/headers";
import { getServerErrorSummary } from "@/lib/serverError";

export default async function ProductsPage({ searchParams }: { searchParams: any }) {
  const category = searchParams?.category || undefined;
  const brand = searchParams?.brand || undefined;
  const search = searchParams?.search || searchParams?.q || undefined;

  const [productsResult, brandsResult, categoriesResult, featuredProductsResult, wishlistResult] = await Promise.allSettled([
    fetchAllProducts({ category, brand, search }),
    fetchBrands(),
    fetchCategories(),
    fetchFeaturedProducts(12),
    fetchWishlist(cookies()),
  ]);

  const products = productsResult.status === "fulfilled" ? productsResult.value || [] : [];
  const brands = brandsResult.status === "fulfilled" ? brandsResult.value || [] : [];
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value || [] : [];
  const featuredProducts = featuredProductsResult.status === "fulfilled" ? featuredProductsResult.value || [] : [];
  const wishlist = wishlistResult.status === "fulfilled" ? wishlistResult.value || [] : [];

  if (productsResult.status === "rejected") {
    console.warn(`[ProductsPage] Products fetch failed (${getServerErrorSummary(productsResult.reason)}). Rendering without products.`);
  }

  if (brandsResult.status === "rejected") {
    console.warn(`[ProductsPage] Brands fetch failed (${getServerErrorSummary(brandsResult.reason)}). Rendering without brands.`);
  }

  if (categoriesResult.status === "rejected") {
    console.warn(`[ProductsPage] Categories fetch failed (${getServerErrorSummary(categoriesResult.reason)}). Rendering without categories.`);
  }

  if (featuredProductsResult.status === "rejected") {
    console.warn(`[ProductsPage] Featured products fetch failed (${getServerErrorSummary(featuredProductsResult.reason)}). Rendering without featured products.`);
  }

  if (wishlistResult.status === "rejected") {
    console.warn(`[ProductsPage] Wishlist fetch failed (${getServerErrorSummary(wishlistResult.reason)}). Rendering without wishlist.`);
  }

  return (
    <ProductsContent
      products={products}
      brands={brands}
      categories={categories}
      featuredProducts={featuredProducts}
      wishlist={wishlist}
      initialCategory={category}
      initialBrand={brand}
      initialSearch={search}
    />
  );
}
