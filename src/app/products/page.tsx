"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, Suspense, useState } from "react";
import { useProducts, useCategories, useBrands, useWishlist, useFeaturedProducts } from "@/hooks/useData";
import Image from "next/image";
import { Heart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { wishlistAPI } from "@/lib/api";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams?.get("category") || undefined;
  const brand = searchParams?.get("brand") || undefined;
  const search = searchParams?.get("search") || searchParams?.get("q") || undefined;

  const { categories } = useCategories();
  const { brands } = useBrands();
  const { wishlist, mutate: mutateWishlist } = useWishlist();
  const { user } = useAuthStore();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const categoryId = useMemo(() => {
    if (!category || !categories) return undefined;
    return categories.find((cat) => cat.slug === category)?.id;
  }, [category, categories]);

  const brandId = useMemo(() => {
    if (!brand || !brands) return undefined;
    return brands.find((b) => b.slug === brand)?.id;
  }, [brand, brands]);

  const { products, isLoading } = useProducts({
    categoryId,
    brandId,
    category,
    brand,
    search,
  });

  const { products: featuredProducts } = useFeaturedProducts(12);

  const wishlistIds = useMemo(() => {
    if (!wishlist) return new Set<string>();
    return new Set(
      wishlist.map((item: any) => item.product?.id || item.productId || item.product?._id).filter(Boolean)
    );
  }, [wishlist]);

  const wishlistItemIdByProduct = useMemo(() => {
    if (!wishlist) return new Map<string, string>();
    const map = new Map<string, string>();
    wishlist.forEach((item: any) => {
      const productId = item.product?.id || item.productId || item.product?._id;
      if (productId) map.set(productId, item.id || item._id);
    });
    return map;
  }, [wishlist]);

  const handleWishlistToggle = async (productId: string) => {
    if (!user) {
      toast.error("Please login to use wishlist");
      router.push("/auth/login");
      return;
    }

    try {
      setUpdatingId(productId);
      if (wishlistIds.has(productId)) {
        const itemId = wishlistItemIdByProduct.get(productId);
        if (itemId) {
          await wishlistAPI.remove(itemId);
        }
        toast.success("Removed from wishlist");
      } else {
        await wishlistAPI.add(productId);
        toast.success("Added to wishlist");
      }
      await mutateWishlist();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setUpdatingId(null);
    }
  };

  const title = useMemo(() => {
    if (category) return `Products - ${category}`;
    if (brand) return `Products - ${brand}`;
    if (search) return `Search: ${search}`;
    return "All Products";
  }, [category, brand, search]);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs sm:text-sm text-gray-500">Catalog</p>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        </div>

        {/* Featured Brands Section */}
        {Array.isArray(brands) && brands.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Shop by Brand</h2>
              <Link href="/brands" className="text-primary-600 hover:underline text-xs sm:text-sm font-medium">
                View All Brands →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {brands.slice(0, 6).map((b) => (
                <button
                  key={b.slug}
                  onClick={() => router.push(`/products?brand=${b.slug}`)}
                  className="card p-3 sm:p-4 hover:shadow-lg transition-shadow text-center group cursor-pointer bg-white border border-gray-200"
                >
                  {b.logo ? (
                    <div className="h-12 sm:h-16 flex items-center justify-center mb-2">
                      <img
                        src={b.logo}
                        alt={b.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="h-12 sm:h-16 bg-gray-100 rounded flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
                      <span className="text-xs text-gray-500 font-bold">{b.name.charAt(0)}</span>
                    </div>
                  )}
                  <p className="font-semibold text-xs sm:text-sm line-clamp-2 group-hover:text-primary-600">
                    {b.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Search products..."
              defaultValue={search || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch((e.target as HTMLInputElement).value);
              }}
              className="input w-full md:w-64"
            />
          </div>

          {/* Category Filters */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/products" className={`chip ${!category && !brand ? "chip-active" : ""}`}>
                All
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className={`chip ${category === cat.slug ? "chip-active" : ""}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Brand Filters */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Brands</p>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(brands) && brands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/products?brand=${b.slug}`}
                  className={`chip ${brand === b.slug ? "chip-active" : ""}`}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {isLoading && <p className="text-gray-600">Loading products...</p>}
        {!isLoading && (!products || products.length === 0) && !category && !brand && !search && featuredProducts?.length > 0 && (
          <div>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">Featured Products</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {featuredProducts.map((product) => {
                const productId = product.id || (product as any)._id;
                const isWishlisted = wishlistIds.has(productId);
                return (
                  <Link key={product.id || product.slug} href={`/products/${product.slug}`} className="card group">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (!updatingId) {
                            handleWishlistToggle(productId);
                          }
                        }}
                        className={`absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                          isWishlisted
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200 bg-white/90 hover:bg-white"
                        } ${updatingId === productId ? "opacity-60" : ""}`}
                        aria-label={isWishlisted ? "Wishlisted" : "Add to wishlist"}
                      >
                        {updatingId === productId ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                        ) : (
                          <Heart
                            className={`w-4 h-4 ${
                              isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"
                            }`}
                          />
                        )}
                      </button>
                    </div>
                    <div className="p-3 sm:p-4 space-y-1">
                      <p className="text-[10px] sm:text-xs text-gray-500">{product.category?.name}</p>
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base line-clamp-2">{product.name}</h3>
                      <p className="text-primary-600 font-bold text-sm sm:text-base">NPR {product.price}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {!isLoading && (!products || products.length === 0) && (category || brand || search) && (
          <p className="text-gray-600">No products found.</p>
        )}

        {!isLoading && products && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => {
              const productId = product.id || (product as any)._id;
              const isWishlisted = wishlistIds.has(productId);
              return (
              <Link key={product.id || product.slug} href={`/products/${product.slug}`} className="card group">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!updatingId) {
                        handleWishlistToggle(productId);
                      }
                    }}
                    className={`absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${
                      isWishlisted
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-white/90 hover:bg-white"
                    } ${updatingId === productId ? "opacity-60" : ""}`}
                    aria-label={isWishlisted ? "Wishlisted" : "Add to wishlist"}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>
                <div className="p-3 sm:p-4 space-y-1">
                  <p className="text-[10px] sm:text-xs text-gray-500">{product.category?.name}</p>
                  <h3 className="font-semibold text-xs sm:text-sm md:text-base line-clamp-2">{product.name}</h3>
                  <p className="text-primary-600 font-bold text-sm sm:text-base">NPR {product.price}</p>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

  export default function ProductsPage() {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <ProductsContent />
      </Suspense>
    );
  }
