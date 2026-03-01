"use client";
import Link from "next/link";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { Heart, Loader2, SlidersHorizontal, X, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { wishlistAPI } from "@/lib/api";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GLOVIA_AI_SHORTCUTS,
  GLOVIA_MAIN_CATEGORIES,
  GLOVIA_PRICE_FILTERS,
  GLOVIA_SMART_TAGS,
  GLOVIA_SUBCATEGORY_GROUPS,
  inferMainCategorySlug,
  inferSmartTags,
  type MainCategorySlug,
  type SmartTag,
} from "@/data/beautyCatalog";

const Recommendations = dynamic(() => import('@/components/Recommendations'), {
  ssr: false,
  loading: () => null,
});

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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || "all");
  const [selectedMainCategory, setSelectedMainCategory] = useState<"all" | MainCategorySlug>("all");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<(typeof GLOVIA_PRICE_FILTERS)[number]["id"]>("all");
  const [selectedSmartTag, setSelectedSmartTag] = useState<"all" | SmartTag>("all");

  const allProducts = useMemo(() => {
    const collection = Array.isArray(products) ? products : [];
    return collection;
  }, [products]);

  const maxPrice = useMemo(() => {
    const prices = allProducts.map((item: any) => Number(item.price || 0));
    return Math.max(1000, ...(prices.length ? prices : [0]));
  }, [allProducts]);

  const [priceCap, setPriceCap] = useState(maxPrice);

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

  const filteredProducts = useMemo(() => {
    const searchTerm = (searchValue || "").toLowerCase().trim();

    const normalized = [...allProducts].filter((product: any) => {
      const productPrice = Number(product.price || 0);
      const productBrandSlug = product.brand?.slug || "";
      const productRating = Number(product.averageRating || 0);
      const name = String(product.name || "").toLowerCase();
      const description = String(product.description || "").toLowerCase();

      const mainCategory = inferMainCategorySlug(product);
      const matchedPriceFilter = GLOVIA_PRICE_FILTERS.find((item) => item.id === selectedPriceFilter) || GLOVIA_PRICE_FILTERS[0];
      const smartTags = inferSmartTags(product);

      const matchesBrand = selectedBrand === "all" || selectedBrand === productBrandSlug;
      const matchesPriceCap = productPrice <= priceCap;
      const matchesPresetPrice = productPrice >= matchedPriceFilter.min && productPrice <= matchedPriceFilter.max;
      const matchesRating = productRating >= ratingFilter;
      const matchesSearch = !searchTerm || name.includes(searchTerm) || description.includes(searchTerm);
      const matchesMainCategory = selectedMainCategory === "all" || selectedMainCategory === mainCategory;
      const matchesSmartTag = selectedSmartTag === "all" || smartTags.includes(selectedSmartTag);

      return matchesBrand && matchesPriceCap && matchesPresetPrice && matchesRating && matchesSearch && matchesMainCategory && matchesSmartTag;
    });

    normalized.sort((a: any, b: any) => {
      const aPrice = Number(a.price || 0);
      const bPrice = Number(b.price || 0);
      const aRating = Number(a.averageRating || 0);
      const bRating = Number(b.averageRating || 0);

      if (sortBy === "price-asc") return aPrice - bPrice;
      if (sortBy === "price-desc") return bPrice - aPrice;
      if (sortBy === "rating") return bRating - aRating;
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "bestseller") {
        return Number(b.isBestSeller || 0) - Number(a.isBestSeller || 0);
      }
      return 0;
    });

    return normalized;
  }, [allProducts, selectedBrand, priceCap, ratingFilter, searchValue, sortBy, selectedMainCategory, selectedPriceFilter, selectedSmartTag]);

  const activeFilters = useMemo(() => {
    let count = 0;
    if (selectedBrand !== "all") count += 1;
    if (ratingFilter > 0) count += 1;
    if (priceCap < maxPrice) count += 1;
    if (selectedMainCategory !== "all") count += 1;
    if (selectedPriceFilter !== "all") count += 1;
    if (selectedSmartTag !== "all") count += 1;
    return count;
  }, [selectedBrand, ratingFilter, priceCap, maxPrice, selectedMainCategory, selectedPriceFilter, selectedSmartTag]);

  const resetFilters = () => {
    setSelectedBrand(initialBrand || "all");
    setRatingFilter(0);
    setPriceCap(maxPrice);
    setSortBy("relevance");
    setSelectedMainCategory("all");
    setSelectedPriceFilter("all");
    setSelectedSmartTag("all");
  };

  const renderProductCard = (product: any) => {
    const productId = product.id || product._id;
    const isWishlisted = wishlistIds.has(productId);

    return (
      <motion.div
        key={product.id || product.slug}
        whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <Link href={`/products/${product.slug}`} className="card group rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images?.[0]?.url || "/placeholder.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
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
              className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                isWishlisted
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-white/90 hover:bg-white"
              } ${updatingId === productId ? "opacity-60" : ""}`}
              aria-label={isWishlisted ? "Wishlisted" : "Add to wishlist"}
            >
              {updatingId === productId ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
              ) : (
                <Heart
                  className={`h-4 w-4 ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              )}
            </button>
            {inferSmartTags(product).slice(0, 1).map((tag) => (
              <span key={tag} className="absolute left-3 top-3 rounded-full bg-primary-600 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">
                {tag}
              </span>
            ))}
          </div>
          <div className="space-y-1.5 p-3 sm:p-4">
            <p className="text-[10px] text-gray-500 sm:text-xs">{product.category?.name}</p>
            <h3 className="line-clamp-2 text-xs font-semibold sm:text-sm md:text-base">{product.name}</h3>
            <div className="flex items-center gap-1 text-xs text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(Number(product.averageRating || 0))
                      ? "fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-gray-500">{Number(product.averageRating || 0).toFixed(1)}</span>
            </div>
            <p className="text-sm font-bold text-primary-600 sm:text-base">NPR {Number(product.price || 0).toLocaleString()}</p>
          </div>
        </Link>
      </motion.div>
    );
  };

  const filterPanel = (
    <div className="space-y-5 rounded-2xl border border-white/50 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        <button onClick={resetFilters} className="text-xs font-semibold text-primary-600 hover:underline">Reset</button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Category</p>
        <div className="space-y-1">
          <Link href="/products" className={`block rounded-lg px-2 py-1.5 text-sm transition ${!category ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}>
            All Categories
          </Link>
          {categories?.map((cat: any) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`block rounded-lg px-2 py-1.5 text-sm transition ${category === cat.slug ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Main Category</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedMainCategory("all")}
            className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${selectedMainCategory === "all" ? "border-primary-600 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            All
          </button>
          {GLOVIA_MAIN_CATEGORIES.map((item) => (
            <button
              key={item.slug}
              onClick={() => setSelectedMainCategory(item.slug)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${selectedMainCategory === item.slug ? "border-primary-600 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {selectedMainCategory !== "all" && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Subcategories</p>
          <div className="space-y-2">
            {GLOVIA_SUBCATEGORY_GROUPS[selectedMainCategory].map((group) => (
              <div key={group.group} className="rounded-lg border border-gray-200 p-2">
                <p className="text-[11px] font-semibold text-gray-700">{group.group}</p>
                <p className="mt-1 text-[11px] text-gray-500 line-clamp-2">{group.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Brand</p>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="input"
        >
          <option value="all">All Brands</option>
          {Array.isArray(brands) && brands.map((item: any) => (
            <option key={item.slug} value={item.slug}>{item.name}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>Price Range</span>
          <span className="text-primary-700">Up to NPR {Number(priceCap || 0).toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxPrice}
          step={100}
          value={priceCap}
          onChange={(e) => setPriceCap(Number(e.target.value))}
          className="w-full accent-primary-600"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          {GLOVIA_PRICE_FILTERS.map((priceFilter) => (
            <button
              key={priceFilter.id}
              onClick={() => setSelectedPriceFilter(priceFilter.id)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${selectedPriceFilter === priceFilter.id ? "border-primary-600 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              {priceFilter.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Minimum Rating</p>
        <div className="grid grid-cols-3 gap-2">
          {[0, 3, 4].map((value) => (
            <button
              key={value}
              onClick={() => setRatingFilter(value)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                ratingFilter === value
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {value === 0 ? "All" : `${value}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Smart Tags</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedSmartTag("all")}
            className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${selectedSmartTag === "all" ? "border-primary-600 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            All Tags
          </button>
          {GLOVIA_SMART_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedSmartTag(tag)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${selectedSmartTag === tag ? "border-primary-600 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">AI Beauty Assistant</p>
        <div className="space-y-2">
          {GLOVIA_AI_SHORTCUTS.map((prompt) => (
            <Link
              key={prompt}
              href={`/ai?prompt=${encodeURIComponent(prompt)}`}
              className="block rounded-lg border border-indigo-100 bg-indigo-50/70 px-2.5 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
            >
              {prompt}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50/20 to-secondary-50/20">
      <div className="container py-6 sm:py-10 space-y-6 sm:space-y-8">
        <div className="flex items-end justify-between gap-3">
          <div>
          <p className="text-xs sm:text-sm text-gray-500">Catalog</p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {category ? `Products - ${category}` : brand ? `Products - ${brand}` : searchValue ? `Search: ${searchValue}` : "All Products"}
          </h1>
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters{activeFilters ? ` (${activeFilters})` : ""}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">{filterPanel}</div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/50 bg-white/80 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSearch(searchValue);
                  }}
                  className="input w-full"
                />
                <button onClick={() => handleSearch(searchValue)} className="btn-outline px-4 py-2">Go</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Sort</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                  <option value="bestseller">Best Seller</option>
                </select>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
            </p>

            {/* Featured Products */}
            {!isLoading && (!products || products.length === 0) && !category && !brand && !searchValue && featuredProducts?.length > 0 && (
              <div>
                <p className="mb-3 text-xs text-gray-500 sm:text-sm">Featured Products</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                  {featuredProducts.map((product: any) => renderProductCard(product))}
                </div>
              </div>
            )}

            {/* No Products Found */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-8 text-center text-gray-600">
                No products match your current filters.
              </div>
            )}

            {/* Product Grid */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                {filteredProducts.map((product: any) => renderProductCard(product))}
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations Section */}
        <Recommendations userId={user?.id} />
      </div>

      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.button
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              aria-label="Close filters"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="fixed right-0 top-0 z-[60] h-full w-[88%] max-w-sm bg-white p-4 shadow-2xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="rounded-lg border border-gray-200 p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {filterPanel}
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-primary mt-4 w-full justify-center"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
