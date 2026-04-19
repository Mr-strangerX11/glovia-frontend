"use client";
import Link from "next/link";
import { SafeImage as Image } from "@/components/common/SafeImage";
import dynamic from 'next/dynamic';
import {
  Heart, Loader2, SlidersHorizontal, X, Star,
  Search, ArrowRight, ChevronDown, LayoutGrid, List,
  Sparkles, Tag, Filter, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { wishlistAPI } from "@/lib/api";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui";
import {
  GLOVIA_AI_SHORTCUTS,
  GLOVIA_PRICE_FILTERS,
  GLOVIA_SMART_TAGS,
  GLOVIA_SUBCATEGORY_GROUPS,
  inferSmartTags,
  type SmartTag,
} from "@/data/beautyCatalog";

const Recommendations = dynamic(() => import('@/components/Recommendations'), {
  ssr: false,
  loading: () => null,
});

type CatalogProduct = {
  id?: string;
  _id?: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  averageRating?: number;
  isBestSeller?: boolean;
  createdAt?: string;
  images?: Array<{ url: string }>;
  category?: { name?: string };
  brand?: { slug?: string; name?: string };
};

type BrandOption = { slug: string; name: string; isFeatured?: boolean };
type CategoryOption = { slug: string; name: string };

type WishlistEntry = {
  id?: string;
  _id?: string;
  product?: { id?: string; _id?: string };
  productId?: string;
};

type ProductsContentProps = {
  products: CatalogProduct[];
  brands: BrandOption[];
  categories: CategoryOption[];
  featuredProducts: CatalogProduct[];
  wishlist: WishlistEntry[];
  initialCategory?: string;
  initialBrand?: string;
  initialSearch?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  const candidate = error as { response?: { data?: { message?: string } } };
  return candidate?.response?.data?.message || fallback;
}

// Helper function to generate demo discount prices if not available
function generateDemoDiscount(product: CatalogProduct): { originalPrice: number; discountedPrice: number; discountPercentage: number } {
  // If already has discount data, use it
  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    const discount = Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    return {
      originalPrice: product.compareAtPrice,
      discountedPrice: product.price,
      discountPercentage: discount
    };
  }
  
  if (product.discountPercentage && product.discountPercentage > 0) {
    const originalPrice = Math.round(product.price / (1 - product.discountPercentage / 100));
    return {
      originalPrice,
      discountedPrice: product.price,
      discountPercentage: product.discountPercentage
    };
  }
  
  // Generate demo discounts based on product position for demonstration
  // This ensures discounts are consistent for the same product
  const pseudoHash = (product.slug || product.name || '').charCodeAt(0) || 0;
  const discountPercentages = [15, 18, 20, 25, 30, 35, 40, 50];
  const selectedDiscount = discountPercentages[pseudoHash % discountPercentages.length];
  const originalPrice = Math.round(product.price / (1 - selectedDiscount / 100));
  
  return {
    originalPrice,
    discountedPrice: product.price,
    discountPercentage: selectedDiscount
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function ProductsContent({
  products,
  brands,
  categories,
  featuredProducts,
  wishlist,
  initialCategory,
  initialBrand,
  initialSearch
}: ProductsContentProps) {
  const { user } = useAuthStore();
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [localWishlistIds, setLocalWishlistIds] = useState<Set<string>>(() => {
    if (!wishlist) return new Set<string>();
    return new Set(
      wishlist.map((item: WishlistEntry) => item.product?.id || item.productId || item.product?._id).filter(Boolean) as string[]
    );
  });

  const wishlistItemIdByProduct = useMemo(() => {
    if (!wishlist) return new Map<string, string>();
    const map = new Map<string, string>();
    wishlist.forEach((item: WishlistEntry) => {
      const productId = item.product?.id || item.productId || item.product?._id;
      const itemId = item.id || item._id;
      if (productId && itemId) map.set(productId, itemId);
    });
    return map;
  }, [wishlist]);

  const handleWishlistToggle = async (productId: string) => {
    if (!user) { toast.error("Please login to use wishlist"); return; }
    try {
      setUpdatingId(productId);
      if (localWishlistIds.has(productId)) {
        const itemId = wishlistItemIdByProduct.get(productId);
        if (itemId) await wishlistAPI.remove(itemId);
        setLocalWishlistIds(prev => { const next = new Set(prev); next.delete(productId); return next; });
        toast.success("Removed from wishlist");
      } else {
        await wishlistAPI.add(productId);
        setLocalWishlistIds(prev => new Set([...prev, productId]));
        toast.success("Added to wishlist");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update wishlist"));
    } finally {
      setUpdatingId(null);
    }
  };

  const [searchValue, setSearchValue] = useState(initialSearch || "");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedBrand, setSelectedBrand] = useState(initialBrand || "all");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<(typeof GLOVIA_PRICE_FILTERS)[number]["id"]>("all");
  const [selectedSmartTag, setSelectedSmartTag] = useState<"all" | SmartTag>("all");

  const allProducts = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  const maxPrice = useMemo(() => {
    const prices = allProducts.map((item) => Number(item.price || 0));
    return Math.max(1000, ...(prices.length ? prices : [0]));
  }, [allProducts]);

  const [priceCap, setPriceCap] = useState(maxPrice);

  const handleSearch = useCallback((value: string) => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`/products?${params.toString()}`);
  }, [router]);

  const category = initialCategory;
  const brand = initialBrand;

  const filteredProducts = useMemo(() => {
    const searchTerm = (searchValue || "").toLowerCase().trim();
    const normalized = [...allProducts].filter((product) => {
      const productPrice = Number(product.price || 0);
      const productBrandSlug = product.brand?.slug || "";
      const productRating = Number(product.averageRating || 0);
      const name = String(product.name || "").toLowerCase();
      const description = String(product.description || "").toLowerCase();
      const matchedPriceFilter = GLOVIA_PRICE_FILTERS.find((item) => item.id === selectedPriceFilter) || GLOVIA_PRICE_FILTERS[0];
      const smartTags = inferSmartTags(product);
      return (
        (selectedBrand === "all" || selectedBrand === productBrandSlug) &&
        productPrice <= priceCap &&
        productPrice >= matchedPriceFilter.min && productPrice <= matchedPriceFilter.max &&
        productRating >= ratingFilter &&
        (!searchTerm || name.includes(searchTerm) || description.includes(searchTerm)) &&
        (selectedSmartTag === "all" || smartTags.includes(selectedSmartTag))
      );
    });

    normalized.sort((a, b) => {
      const aP = Number(a.price || 0), bP = Number(b.price || 0);
      const aR = Number(a.averageRating || 0), bR = Number(b.averageRating || 0);
      if (sortBy === "price-asc") return aP - bP;
      if (sortBy === "price-desc") return bP - aP;
      if (sortBy === "rating") return bR - aR;
      if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === "bestseller") return Number(b.isBestSeller || 0) - Number(a.isBestSeller || 0);
      if (sortBy === "alphabetical-asc") return String(a.name || "").localeCompare(String(b.name || ""));
      if (sortBy === "alphabetical-desc") return String(b.name || "").localeCompare(String(a.name || ""));
      return 0;
    });
    return normalized;
  }, [allProducts, selectedBrand, priceCap, ratingFilter, searchValue, sortBy, selectedPriceFilter, selectedSmartTag]);

  const activeFilters = useMemo(() => {
    let count = 0;
    if (selectedBrand !== "all") count++;
    if (ratingFilter > 0) count++;
    if (priceCap < maxPrice) count++;
    if (selectedPriceFilter !== "all") count++;
    if (selectedSmartTag !== "all") count++;
    return count;
  }, [selectedBrand, ratingFilter, priceCap, maxPrice, selectedPriceFilter, selectedSmartTag]);

  const resetFilters = () => {
    setSelectedBrand(initialBrand || "all");
    setRatingFilter(0);
    setPriceCap(maxPrice);
    setSortBy("relevance");
    setSelectedPriceFilter("all");
    setSelectedSmartTag("all");
  };

  // ── Product Card ──────────────────────────────────────────────
  const renderProductCard = (product: CatalogProduct, listMode = false) => {
    const productId = product.id || product._id || "";
    const isWishlisted = localWishlistIds.has(productId);
    const smartTags = inferSmartTags(product);
    const firstTag = smartTags[0];
    
    // Get discount information
    const { originalPrice, discountedPrice, discountPercentage } = generateDemoDiscount(product);

    if (listMode) {
      return (
        <motion.div key={product.id || product.slug} variants={fadeUp}>
          <Link
            href={`/products/${product.slug}`}
            className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:border-primary-200 hover:shadow-md"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
              <Image
                src={product.images?.[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                fill
                sizes="96px"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              />
              {firstTag && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-primary-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {firstTag}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between gap-1 min-w-0">
              <div>
                <p className="text-[11px] text-gray-400">{product.category?.name}</p>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-700 transition-colors">
                  {product.name}
                </h3>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(Number(product.averageRating || 0)) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                  <span className="ml-1 text-[11px] text-gray-500">{Number(product.averageRating || 0).toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  {discountPercentage > 0 ? (
                    <>
                      <p className="text-xs text-gray-400 line-through">NPR {Number(originalPrice || 0).toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-black text-red-600">NPR {Number(discountedPrice || 0).toLocaleString()}</p>
                        <span className="text-[10px] font-black bg-red-500 text-white rounded px-1.5 py-0.5">-{discountPercentage}%</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-base font-black text-primary-700">NPR {Number(product.price || 0).toLocaleString()}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); if (!updatingId && productId) handleWishlistToggle(productId); }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors shrink-0 ${isWishlisted ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-red-300 hover:bg-red-50"}`}
                >
                  {updatingId === productId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
                  ) : (
                    <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-red-500 stroke-red-500" : "stroke-gray-400"}`} />
                  )}
                </button>
              </div>
            </div>
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.div key={product.id || product.slug} variants={fadeUp}>
        <Link
          href={`/products/${product.slug}`}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-white">
            <Image
              src={product.images?.[0]?.url || "/placeholder.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.06]"
            />

            {/* Wishlist */}
            <button
              type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); if (!updatingId && productId) handleWishlistToggle(productId); }}
              className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all duration-200 ${
                isWishlisted ? "border-red-400 bg-red-50 scale-110" : "border-white/80 bg-white/95 opacity-0 group-hover:opacity-100 hover:bg-white"
              }`}
              aria-label={isWishlisted ? "Wishlisted" : "Add to wishlist"}
            >
              {updatingId === productId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
              ) : (
                <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-red-500 stroke-red-500" : "stroke-gray-600"}`} />
              )}
            </button>

            {/* Tag badge */}
            {firstTag && (
              <span className="absolute left-2.5 top-2.5 rounded-full bg-primary-600/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                {firstTag}
              </span>
            )}

            {/* Sale badge */}
            {discountPercentage > 0 && (
              <span className="absolute left-2.5 bottom-2.5 rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-black text-white shadow-md">
                -{discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-1.5 border-t border-gray-100 p-3.5">
            <div className="flex items-start justify-between gap-1.5">
              <p className="text-[11px] font-medium text-gray-400">{product.category?.name || '\u00a0'}</p>
              {product.brand?.name && Array.isArray(brands) && brands.find(b => b.slug === product.brand?.slug && b.isFeatured) && (
                <span
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setSelectedBrand(product.brand?.slug || "all"); setIsMobileFilterOpen(false); }}
                  className="cursor-pointer shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  {product.brand.name}
                </span>
              )}
            </div>

            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 leading-snug group-hover:text-primary-700 transition-colors">
              {product.name}
            </h3>

            {/* Stars */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < Math.floor(Number(product.averageRating || 0)) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
              ))}
              <span className="ml-1.5 text-[11px] text-gray-400">{Number(product.averageRating || 0).toFixed(1)}</span>
            </div>

            {/* Price */}
            <div className="mt-auto pt-2 flex items-center justify-between gap-2">
              <div className="flex-1">
                {discountPercentage > 0 ? (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 line-through">NPR {Number(originalPrice || 0).toLocaleString()}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-black text-red-600">NPR {Number(discountedPrice || 0).toLocaleString()}</p>
                      <span className="text-[10px] font-black bg-red-500 text-white rounded px-1.5 py-0.5">-{discountPercentage}%</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg font-black text-primary-700">NPR {Number(product.price || 0).toLocaleString()}</p>
                )}
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm shrink-0">
                <ArrowRight className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  // ── Filter Panel ──────────────────────────────────────────────
  const FilterSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-2.5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      {children}
    </div>
  );

  const filterPanel = (
    <div className="space-y-6">
      {/* Reset */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Filters</h3>
        {activeFilters > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <X className="h-3 w-3" /> Reset all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection label="Category">
        <div className="space-y-0.5">
          <Link
            href="/products"
            className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors ${!category ? "bg-primary-50 font-semibold text-primary-700" : "text-gray-600 hover:bg-gray-50"}`}
          >
            All Categories
            {!category && <ChevronRight className="h-3.5 w-3.5 text-primary-400" />}
          </Link>
          {categories?.map((cat: CategoryOption) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors ${category === cat.slug ? "bg-primary-50 font-semibold text-primary-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {cat.name}
              {category === cat.slug && <ChevronRight className="h-3.5 w-3.5 text-primary-400" />}
            </Link>
          ))}
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection label="Brand">
        <div className="space-y-0.5">
          <button
            onClick={() => setSelectedBrand("all")}
            className={`w-full text-left rounded-lg px-2.5 py-2 text-sm transition-colors ${selectedBrand === "all" ? "bg-primary-50 font-semibold text-primary-700" : "text-gray-600 hover:bg-gray-50"}`}
          >
            All Brands
          </button>
          {Array.isArray(brands) && brands.filter(b => b.isFeatured).map((item) => (
            <button
              key={item.slug}
              onClick={() => setSelectedBrand(item.slug)}
              className={`w-full text-left rounded-lg px-2.5 py-2 text-sm transition-colors ${selectedBrand === item.slug ? "bg-primary-50 font-semibold text-primary-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection label="Price Range">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">Up to</span>
            <span className="text-xs font-bold text-primary-700">NPR {Number(priceCap || 0).toLocaleString()}</span>
          </div>
          <input
            type="range" min={0} max={maxPrice} step={100} value={priceCap}
            onChange={(e) => setPriceCap(Number(e.target.value))}
            className="w-full accent-primary-600 h-1.5"
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {GLOVIA_PRICE_FILTERS.map((pf) => (
            <button
              key={pf.id}
              onClick={() => setSelectedPriceFilter(pf.id)}
              className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors ${selectedPriceFilter === pf.id ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {pf.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection label="Min Rating">
        <div className="flex gap-1.5">
          {[0, 3, 4].map((value) => (
            <button
              key={value}
              onClick={() => setRatingFilter(value)}
              className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${ratingFilter === value ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {value === 0 ? "All" : `${value}★+`}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Smart Tags */}
      <FilterSection label="Smart Tags">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedSmartTag("all")}
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${selectedSmartTag === "all" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            All
          </button>
          {GLOVIA_SMART_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedSmartTag(tag)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${selectedSmartTag === tag ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* AI Shortcuts */}
      <FilterSection label="AI Beauty Assistant">
        <div className="space-y-1">
          {GLOVIA_AI_SHORTCUTS.map((prompt) => (
            <Link
              key={prompt}
              href={`/ai?prompt=${encodeURIComponent(prompt)}`}
              className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-100"
            >
              <Sparkles className="h-3 w-3 shrink-0" /> {prompt}
            </Link>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  // ── Active filter pills ───────────────────────────────────────
  const activePills = useMemo(() => {
    const pills: { label: string; clear: () => void }[] = [];
    if (selectedBrand !== "all") {
      const brandName = Array.isArray(brands) ? brands.find(b => b.slug === selectedBrand)?.name || selectedBrand : selectedBrand;
      pills.push({ label: `Brand: ${brandName}`, clear: () => setSelectedBrand("all") });
    }
    if (ratingFilter > 0) pills.push({ label: `${ratingFilter}★+`, clear: () => setRatingFilter(0) });
    if (priceCap < maxPrice) pills.push({ label: `≤ NPR ${priceCap.toLocaleString()}`, clear: () => setPriceCap(maxPrice) });
    if (selectedPriceFilter !== "all") {
      const pf = GLOVIA_PRICE_FILTERS.find(p => p.id === selectedPriceFilter);
      if (pf) pills.push({ label: pf.label, clear: () => setSelectedPriceFilter("all") });
    }
    if (selectedSmartTag !== "all") pills.push({ label: selectedSmartTag, clear: () => setSelectedSmartTag("all") });
    return pills;
  }, [selectedBrand, ratingFilter, priceCap, maxPrice, selectedPriceFilter, selectedSmartTag, brands]);

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950">

      {/* ─── Page Header ─── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 font-medium">
              {category || brand || initialSearch ? "Products" : "All Products"}
            </span>
            {(category || brand || initialSearch) && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-700 font-medium capitalize">
                  {initialSearch ? `"${initialSearch}"` : category || brand}
                </span>
              </>
            )}
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {initialSearch
                  ? <>Results for <span className="text-primary-700">&ldquo;{initialSearch}&rdquo;</span></>
                  : category ? <span className="capitalize">{category}</span>
                  : brand ? <span className="capitalize">{brand}</span>
                  : "All Products"}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filteredProducts.length.toLocaleString()} products found
                {category ? ` in ${category}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* ─── Toolbar ─── */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(searchValue); }}
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile filter button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilters > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                  {activeFilters}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white pl-3.5 pr-8 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
                <option value="bestseller">Best Seller</option>
                <option value="alphabetical-asc">A → Z</option>
                <option value="alphabetical-desc">Z → A</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            {/* View toggle */}
            <div className="hidden sm:flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-1.5 transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filter pills */}
        {activePills.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Active:
            </span>
            {activePills.map((pill) => (
              <button
                key={pill.label}
                onClick={pill.clear}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
              >
                {pill.label} <X className="h-3 w-3" />
              </button>
            ))}
            {activePills.length > 1 && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* ─── Main content with optional desktop sidebar ─── */}
        <div className="flex gap-6">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
              {filterPanel}
            </div>
          </aside>

          {/* Product Area */}
          <div className="flex-1 min-w-0">
            {/* Featured / empty states */}
            {(!products || products.length === 0) && !category && !brand && !initialSearch && featuredProducts?.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-500">
                  <Sparkles className="h-4 w-4 text-primary-500" /> Featured Products
                </p>
                <motion.div
                  variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                  initial="hidden"
                  animate="visible"
                  className={viewMode === 'grid'
                    ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
                    : "space-y-3"}
                >
                  {featuredProducts.map((p) => renderProductCard(p, viewMode === 'list'))}
                </motion.div>
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center dark:bg-gray-900 dark:border-gray-700">
                <div className="mb-4 text-5xl">🔍</div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No products found</h3>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  Try adjusting your filters or search for something else.
                </p>
                {activeFilters > 0 && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <motion.div
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                initial="hidden"
                animate="visible"
                className={viewMode === 'grid'
                  ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
                  : "space-y-3"}
              >
                {filteredProducts.map((p) => renderProductCard(p, viewMode === 'list'))}
              </motion.div>
            )}

            {/* AI Recommendations */}
            <div className="mt-12">
              <Recommendations userId={user?.id} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Filter Drawer ─── */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="fixed right-0 top-0 z-[60] flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl dark:bg-gray-900"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-gray-600" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Filters</h3>
                  {activeFilters > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-black text-white">
                      {activeFilters}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {filterPanel}
              </div>

              {/* Drawer footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-4">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 py-3 text-sm font-bold text-white shadow transition hover:from-primary-700 hover:to-primary-600"
                >
                  Show {filteredProducts.length} Products
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
