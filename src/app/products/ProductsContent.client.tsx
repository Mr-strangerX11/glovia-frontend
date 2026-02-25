"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { wishlistAPI } from "@/lib/api";
import { useState, useMemo } from "react";
import Recommendations from '@/components/Recommendations';

export default function ProductsContent({
  products,
  brands,
  categories,
  featuredProducts,
  wishlist,
  initialCategory,
  initialBrand,
  initialSearch
}: any) {
  const { user } = useAuthStore();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update wishlist");
    } finally {
      setUpdatingId(null);
    }
  };

  const [searchValue, setSearchValue] = useState(initialSearch || "");
  const handleSearch = (value: string) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (value) params.set("search", value);
      else params.delete("search");
      window.location.href = `/products?${params.toString()}`;
    }
  };

  const category = initialCategory;
  const brand = initialBrand;
  const isLoading = false; // All data is loaded via SSR

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">Catalog</p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {category ? `Products - ${category}` : brand ? `Products - ${brand}` : searchValue ? `Search: ${searchValue}` : "All Products"}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") handleSearch(searchValue);
            }}
            className="input w-full md:w-64"
          />
        </div>

        {/* Category Filters */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/products" className={`chip ${!category && !brand ? "chip-active" : ""}`}>All</Link>
            {categories?.map((cat: any) => (
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
            {Array.isArray(brands) && brands.map((b: any) => (
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

        {/* Featured Products */}
        {!isLoading && (!products || products.length === 0) && !category && !brand && !searchValue && featuredProducts?.length > 0 && (
          <div>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">Featured Products</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {featuredProducts.map((product: any) => {
                const productId = product.id || product._id;
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
                        onClick={event => {
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

        {/* No Products Found */}
        {!isLoading && (!products || products.length === 0) && (category || brand || searchValue) && (
          <p className="text-gray-600">No products found.</p>
        )}

        {/* Product Grid */}
        {!isLoading && products && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product: any) => {
              const productId = product.id || product._id;
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
                      onClick={event => {
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

        {/* AI Recommendations Section */}
        <Recommendations userId={user?.id} />
      </div>
    </div>
  );
}
