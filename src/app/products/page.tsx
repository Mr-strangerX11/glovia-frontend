import ProductsContent from "./ProductsContent.client";
import { fetchAllProducts, fetchBrands, fetchCategories, fetchFeaturedProducts, fetchWishlist } from "@/lib/serverApi";
import { cookies } from "next/headers";

export default async function ProductsPage({ searchParams }: { searchParams: any }) {
  const category = searchParams?.category || undefined;
  const brand = searchParams?.brand || undefined;
  const search = searchParams?.search || searchParams?.q || undefined;

  const [products, brands, categories, featuredProducts, wishlist] = await Promise.all([
    fetchAllProducts({ category, brand, search }),
    fetchBrands(),
    fetchCategories(),
    fetchFeaturedProducts(12),
    fetchWishlist(cookies()),
  ]);

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
