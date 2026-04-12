"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { productsAPI, cartAPI, wishlistAPI, reviewsAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Heart, Star, Minus, Plus, ArrowLeft,
  Package, Truck, Shield, ChevronLeft, ChevronRight,
  RotateCcw, Zap, MapPin, Clock3, BadgeCheck, Share2,
  ChevronRight as BreadcrumbSep,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWishlist } from "@/hooks/useData";
import { GLOVIA_AI_SHORTCUTS, inferSmartTags } from "@/data/beautyCatalog";

const Recommendations = dynamic(() => import('@/components/Recommendations'), {
  ssr: false,
  loading: () => null,
});

type ProductImage = { id?: string; url: string };

type ProductReview = {
  id?: string; _id?: string;
  rating?: number; comment?: string; title?: string;
  approved?: boolean; createdAt?: string;
  user?: { firstName?: string; lastName?: string };
};

type RelatedProduct = {
  _id: string; id?: string; slug: string; name: string;
  price: number; compareAtPrice?: number; discountPercentage?: number;
  images?: ProductImage[];
};

type ProductDetail = {
  id?: string; _id: string;
  name: string; slug?: string;
  description?: string; ingredients?: string; benefits?: string; howToUse?: string; sku?: string;
  categoryId?: string;
  category?: { name?: string; slug?: string };
  brand?: { name?: string; slug?: string };
  images?: ProductImage[];
  price: number; compareAtPrice?: number; discountPercentage?: number;
  isNewProduct?: boolean; stockQuantity: number;
  averageRating?: number; reviewCount?: number;
  isBestSeller?: boolean; isNew?: boolean; suitableFor?: string[];
};

type WishlistEntry = { product?: { id?: string; _id?: string }; productId?: string };

function getErrorMessage(error: unknown, fallback: string) {
  const candidate = error as { response?: { data?: { message?: string } } };
  return candidate?.response?.data?.message || fallback;
}

function normalizeReviewsResponse(raw: unknown): ProductReview[] {
  if (Array.isArray(raw)) return raw as ProductReview[];
  if (!raw || typeof raw !== "object") return [];
  const candidate = raw as { data?: unknown; reviews?: unknown };
  if (Array.isArray(candidate.data)) return candidate.data as ProductReview[];
  if (candidate.data && typeof candidate.data === "object") {
    const nested = candidate.data as { data?: unknown; reviews?: unknown };
    if (Array.isArray(nested.data)) return nested.data as ProductReview[];
    if (Array.isArray(nested.reviews)) return nested.reviews as ProductReview[];
  }
  if (Array.isArray(candidate.reviews)) return candidate.reviews as ProductReview[];
  return [];
}

function normalizeImageUrl(url?: string) {
  if (!url) return "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://backend-glovia.vercel.app/api/v1";
    const origin = apiBase.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
    return `${origin}${url}`;
  }
  return url.replace("http://backend-glovia.vercel.app", "https://backend-glovia.vercel.app");
}

const DETAIL_TABS = ["Description", "Ingredients", "Benefits", "How to Use", "Reviews", "FAQ"] as const;
type DetailTab = typeof DETAIL_TABS[number];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";
  const { user } = useAuthStore();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [viewerRotation, setViewerRotation] = useState({ x: -7, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [deliveryDistrict, setDeliveryDistrict] = useState("Kathmandu");
  const [activeTab, setActiveTab] = useState<DetailTab>("Description");
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const { wishlist, mutate: mutateWishlist } = useWishlist();

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await productsAPI.getBySlug(slug);
      const item = data as ProductDetail;
      setProduct(item);

      if (item.categoryId) {
        try {
          const relRes = await productsAPI.getAll({ categoryId: item.categoryId, limit: 8 });
          const all = (relRes.data?.data || []) as RelatedProduct[];
          setRelatedProducts(all.filter((p) => p._id !== item._id && p.slug !== item.slug).slice(0, 4));
        } catch {
          try {
            const fbRes = await productsAPI.getAll({ limit: 5 });
            const all = (fbRes.data?.data || []) as RelatedProduct[];
            setRelatedProducts(all.filter((p) => p._id !== item._id && p.slug !== item.slug).slice(0, 4));
          } catch { setRelatedProducts([]); }
        }
      } else {
        try {
          const fbRes = await productsAPI.getAll({ limit: 5 });
          const all = (fbRes.data?.data || []) as RelatedProduct[];
          setRelatedProducts(all.filter((p) => p._id !== item._id && p.slug !== item.slug).slice(0, 4));
        } catch { setRelatedProducts([]); }
      }

      try {
        const pid = item._id || item.id;
        const rRes = pid ? await reviewsAPI.getByProduct(pid) : { data: [] };
        setReviews(normalizeReviewsResponse(rRes.data));
      } catch { setReviews([]); }
    } catch {
      toast.error("Product not found");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  }, [router, slug]);

  useEffect(() => { fetchProductData(); }, [fetchProductData]);

  useEffect(() => {
    if (!product) return;
    const items = (wishlist || []) as WishlistEntry[];
    const pid = product.id || product._id;
    setIsWishlisted(items.some((i) => (i.product?.id || i.productId || i.product?._id) === pid));
  }, [product, wishlist]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) { toast.error("Please login to add items to cart"); router.push("/auth/login"); return; }
    try {
      setIsAddingToCart(true);
      await cartAPI.add({ productId: product._id, quantity });
      toast.success("Added to cart!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add to cart"));
    } finally { setIsAddingToCart(false); }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!user) { toast.error("Please login to continue checkout"); router.push("/auth/login"); return; }
    try {
      setIsAddingToCart(true);
      await cartAPI.add({ productId: product._id, quantity });
      router.push("/checkout");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to continue checkout"));
    } finally { setIsAddingToCart(false); }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    if (!user) { toast.error("Please login to add items to wishlist"); router.push("/auth/login"); return; }
    if (isWishlisted) { toast.success("Already in wishlist"); return; }
    try {
      setIsAddingToWishlist(true);
      await wishlistAPI.add(product._id);
      await mutateWishlist();
      setIsWishlisted(true);
      toast.success("Added to wishlist!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add to wishlist"));
    } finally { setIsAddingToWishlist(false); }
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    if (!user) { toast.error("Please login to submit a review"); router.push("/auth/login"); return; }
    const trimmedComment = reviewComment.trim();
    if (!trimmedComment) { toast.error("Please write your review comment"); return; }
    try {
      setIsSubmittingReview(true);
      const productId = product._id || product.id;
      if (!productId) throw new Error("Product ID not found");
      const payload = { productId, rating: Math.max(1, Math.min(5, Math.round(reviewRating))), comment: trimmedComment };
      const response = await reviewsAPI.create(payload);
      const created = (response.data || {}) as ProductReview;
      setReviews((prev) => [{
        ...created,
        rating: created.rating ?? payload.rating,
        comment: created.comment ?? payload.comment,
        approved: created.approved ?? false,
        user: created.user || { firstName: user.firstName, lastName: user.lastName },
      }, ...prev]);
      setReviewComment("");
      setReviewRating(5);
      toast.success("Review submitted. It will appear publicly after approval.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to submit review"));
    } finally { setIsSubmittingReview(false); }
  };

  const discountPercentage = (() => {
    if (!product) return 0;
    if (typeof product.discountPercentage === "number" && product.discountPercentage > 0) return product.discountPercentage;
    if (typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price && product.compareAtPrice > 0)
      return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
    return 0;
  })();

  const discountedPrice = (() => {
    if (!product) return 0;
    if (typeof product.discountPercentage === "number" && product.discountPercentage > 0)
      return product.price - (product.price * product.discountPercentage) / 100;
    return product.price;
  })();

  const deliveryEstimate = (() => {
    const n = deliveryDistrict.toLowerCase();
    if (["kathmandu", "lalitpur", "bhaktapur"].includes(n)) return { eta: "Same or next day", cost: 99 };
    if (["pokhara", "chitwan", "butwal", "dharan"].includes(n)) return { eta: "1–2 business days", cost: 149 };
    return { eta: "2–4 business days", cost: 199 };
  })();

  const productTags = inferSmartTags(product);
  const skinTypes = Array.isArray(product?.suitableFor) && product.suitableFor.length > 0
    ? product.suitableFor.map((s: string) => s.replace("_", " "))
    : ["Oily", "Dry", "Combination", "Sensitive", "Normal"];

  const productFaqs = [
    { q: `Is ${product?.name} authentic?`, a: "Yes. Glovia verifies sourcing and quality before every dispatch." },
    { q: "How long does delivery take in Nepal?", a: `${deliveryEstimate.eta} depending on district and current order volume.` },
    { q: "Can I return this product?", a: "Yes, eligible products support return/exchange per our 7-day policy." },
  ];

  const avgRating = Number(product?.averageRating || 0);
  const reviewCount = product?.reviewCount || reviews.length || 0;

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="mb-8 h-4 w-64 rounded-lg bg-gray-200 animate-pulse" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square rounded-3xl bg-gray-200 animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 w-32 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-4 w-48 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-16 w-full rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-12 w-full rounded-xl bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const productImages = product.images?.length
    ? product.images
    : [{ url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800" }];

  const handleViewerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - bounds.left) / bounds.width) * 100;
    const relY = ((e.clientY - bounds.top) / bounds.height) * 100;
    setZoomOrigin({ x: Math.min(100, Math.max(0, relX)), y: Math.min(100, Math.max(0, relY)) });
    if (!dragStartRef.current) {
      const cx = bounds.left + bounds.width / 2, cy = bounds.top + bounds.height / 2;
      setViewerRotation({ x: -((e.clientY - cy) / bounds.height) * 10, y: ((e.clientX - cx) / bounds.width) * 16 });
      return;
    }
    const dx = e.clientX - dragStartRef.current.x, dy = e.clientY - dragStartRef.current.y;
    setViewerRotation((prev) => ({
      x: Math.max(-18, Math.min(18, prev.x - dy * 0.14)),
      y: Math.max(-28, Math.min(28, prev.y + dx * 0.22)),
    }));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const tabHasContent = (tab: DetailTab): boolean => {
    if (!product) return false;
    if (tab === "Description") return true;
    if (tab === "Ingredients") return !!product.ingredients;
    if (tab === "Benefits") return !!product.benefits;
    if (tab === "How to Use") return !!product.howToUse;
    if (tab === "Reviews") return true;
    if (tab === "FAQ") return true;
    return false;
  };

  const visibleTabs = DETAIL_TABS.filter(tabHasContent);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28 md:pb-12">

      {/* ─── Breadcrumb bar ─── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href="/" className="hover:text-gray-600 transition-colors shrink-0">Home</Link>
            <BreadcrumbSep className="h-3 w-3 shrink-0" />
            <Link href="/products" className="hover:text-gray-600 transition-colors shrink-0">Products</Link>
            {product.category && (
              <>
                <BreadcrumbSep className="h-3 w-3 shrink-0" />
                <Link href={`/products?category=${product.category.slug}`} className="hover:text-gray-600 transition-colors shrink-0 capitalize">
                  {product.category.name}
                </Link>
              </>
            )}
            <BreadcrumbSep className="h-3 w-3 shrink-0" />
            <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Back link */}
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>

        {/* ─── Main grid ─── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_520px] lg:gap-12 xl:gap-16">

          {/* ── Left: Image Gallery ── */}
          <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            {/* Main image */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-square overflow-hidden rounded-3xl border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm [perspective:1300px] group"
            >
              <motion.div
                className="relative h-full w-full [transform-style:preserve-3d]"
                animate={{ rotateX: viewerRotation.x, rotateY: viewerRotation.y }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
                onMouseMove={handleViewerMouseMove}
                onMouseDown={(e) => { dragStartRef.current = { x: e.clientX, y: e.clientY }; }}
                onMouseUp={() => { dragStartRef.current = null; }}
                onMouseLeave={() => { dragStartRef.current = null; if (!isZooming) setViewerRotation({ x: -7, y: 0 }); }}
                onClick={() => setIsZooming((prev) => !prev)}
              >
                <Image
                  src={normalizeImageUrl(productImages[selectedImage].url)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 50vw"
                  className={`object-contain p-6 transition-transform duration-300 ${isZooming ? "scale-[1.55] cursor-zoom-out" : "cursor-zoom-in"}`}
                  style={{ transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
                  priority
                />
              </motion.div>

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-4 z-20">
                <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
                  Drag · Rotate · Tap to zoom
                </span>
              </div>

              <div className="absolute right-3 top-3 z-20 flex gap-1.5">
                {[
                  { onClick: () => setSelectedImage((p) => (p - 1 + productImages.length) % productImages.length), icon: <ChevronLeft className="h-4 w-4" />, label: "Prev" },
                  { onClick: () => setSelectedImage((p) => (p + 1) % productImages.length), icon: <ChevronRight className="h-4 w-4" />, label: "Next" },
                  { onClick: () => { setViewerRotation({ x: -7, y: 0 }); setIsZooming(false); setZoomOrigin({ x: 50, y: 50 }); }, icon: <RotateCcw className="h-4 w-4" />, label: "Reset" },
                ].map(({ onClick, icon, label }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white"
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Badges */}
              {discountPercentage > 0 && (
                <div className="absolute left-4 top-4 z-20 rounded-full bg-red-500 px-3 py-1 text-sm font-black text-white shadow">
                  {discountPercentage}% OFF
                </div>
              )}
              {product.isNewProduct && (
                <div className="absolute left-4 top-4 z-20 rounded-full bg-emerald-500 px-3 py-1 text-sm font-black text-white shadow">
                  NEW
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {productImages.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all ${
                      selectedImage === i ? "border-primary-500 shadow-md" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image src={normalizeImageUrl(img.url)} alt={`${product.name} ${i + 1}`} fill sizes="64px" className="object-contain p-1.5" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Brand + share */}
            <div className="flex items-center justify-between">
              {product.brand ? (
                <Link href={`/brands/${product.brand.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {product.brand.name}
                </Link>
              ) : <div />}
              <button
                onClick={() => { if (navigator.share) navigator.share({ title: product.name, url: window.location.href }); else { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); } }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Name + tags + rating */}
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white leading-tight sm:text-3xl">
                {product.name}
              </h1>

              {/* Smart tags */}
              {productTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {productTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-primary-100 bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating row */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-gray-800 dark:text-gray-200">{avgRating.toFixed(1)}</span>
                </div>
                <button
                  onClick={() => setActiveTab("Reviews")}
                  className="text-sm text-gray-500 hover:text-primary-600 underline underline-offset-2 transition-colors"
                >
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </button>
                {product.isBestSeller && (
                  <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                    🏆 Best Seller
                  </span>
                )}
              </div>
            </div>

            {/* Price block */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                  NPR {discountedPrice.toLocaleString()}
                </span>
                {discountPercentage > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      NPR {product.price.toLocaleString()}
                    </span>
                    <span className="rounded-lg bg-red-100 px-2.5 py-1 text-sm font-black text-red-600">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>
              {discountPercentage > 0 && (
                <p className="mt-1.5 text-xs text-emerald-600 font-semibold">
                  You save NPR {(product.price - discountedPrice).toLocaleString()}
                </p>
              )}
            </div>

            {/* Short description */}
            {product.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Delivery estimator */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20">
                  <MapPin className="h-3.5 w-3.5 text-primary-600" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Delivery Estimate</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  value={deliveryDistrict}
                  onChange={(e) => setDeliveryDistrict(e.target.value)}
                >
                  {["Kathmandu","Lalitpur","Bhaktapur","Pokhara","Chitwan","Butwal","Dharan","Biratnagar","Nepalgunj"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="rounded-xl border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3.5 py-2.5 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="font-bold text-emerald-800 dark:text-emerald-400">{deliveryEstimate.eta}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-500">
                    Shipping: NPR {deliveryEstimate.cost}
                  </p>
                </div>
              </div>
            </div>

            {/* Skin type */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Suitable for</p>
              <div className="flex flex-wrap gap-2">
                {skinTypes.map((s: string) => (
                  <span key={s} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.stockQuantity > 0 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    In Stock <span className="text-gray-400 font-normal">({product.stockQuantity} available)</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity + actions */}
            {product.stockQuantity > 0 && (
              <div className="space-y-4">
                {/* Qty selector */}
                <div className="flex items-center gap-1">
                  <span className="mr-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Qty:</span>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2.5">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:from-primary-700 hover:to-primary-600 hover:shadow-primary-500/25 hover:shadow-lg disabled:opacity-60"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isAddingToCart ? "Adding…" : "Add to Cart"}
                  </motion.button>

                  <motion.button
                    onClick={handleBuyNow}
                    disabled={isAddingToCart}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary-600 px-4 py-3 text-sm font-bold text-primary-700 dark:text-primary-400 transition hover:bg-primary-50 dark:hover:bg-primary-900/20 disabled:opacity-60"
                  >
                    <Zap className="h-4 w-4" />
                    Buy Now
                  </motion.button>

                  <button
                    onClick={handleAddToWishlist}
                    disabled={isAddingToWishlist}
                    className={`flex h-full w-12 items-center justify-center rounded-xl border-2 transition-all ${
                      isWishlisted
                        ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    }`}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`h-5 w-5 transition-transform ${isWishlisted ? "fill-red-500 stroke-red-500 scale-110" : "stroke-gray-500 dark:stroke-gray-400"}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: Truck, label: "Free delivery", sub: "Above NPR 2,999" },
                { icon: Shield, label: "100% Authentic", sub: "Verified products" },
                { icon: Package, label: "Easy Returns", sub: "7-day policy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-center shadow-sm">
                  <Icon className="h-4 w-4 text-primary-600" />
                  <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 leading-tight">{label}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{sub}</p>
                </div>
              ))}
            </div>

            {/* AI shortcuts */}
            <div className="rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4">
              <p className="mb-3 text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-widest">✨ AI Beauty Assistant</p>
              <div className="flex flex-wrap gap-2">
                {GLOVIA_AI_SHORTCUTS.map((prompt) => (
                  <Link
                    key={prompt}
                    href={`/ai?prompt=${encodeURIComponent(`${prompt} for ${product.name}`)}`}
                    className="rounded-full border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-indigo-900/30 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-100 dark:hover:bg-indigo-800/40"
                  >
                    {prompt}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Detail Tabs ─── */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          {/* Tab bar */}
          <div className="overflow-x-auto scrollbar-none border-b border-gray-100 dark:border-gray-800">
            <div className="flex min-w-max px-2">
              {visibleTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "text-primary-700 dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab}
                  {tab === "Reviews" && reviewCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                      {reviewCount}
                    </span>
                  )}
                  {activeTab === tab && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="p-6 sm:p-8"
            >
              {activeTab === "Description" && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.description || "No detailed description provided yet."}
                  </p>
                  {product.sku && (
                    <p className="mt-4 text-xs text-gray-400">SKU: <span className="font-mono font-semibold">{product.sku}</span></p>
                  )}
                </div>
              )}

              {activeTab === "Ingredients" && product.ingredients && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{product.ingredients}</p>
              )}

              {activeTab === "Benefits" && product.benefits && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{product.benefits}</p>
              )}

              {activeTab === "How to Use" && product.howToUse && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{product.howToUse}</p>
              )}

              {activeTab === "FAQ" && (
                <div className="space-y-3">
                  {productFaqs.map((faq, i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{faq.q}</p>
                      <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "Reviews" && (
                <div className="space-y-8">
                  {/* Rating summary */}
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="text-center">
                      <p className="font-serif text-6xl font-black text-gray-900 dark:text-white leading-none">{avgRating.toFixed(1)}</p>
                      <div className="mt-2 flex justify-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <p className="mt-1.5 text-xs text-gray-400">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</p>
                    </div>

                    {/* Rating bars */}
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter(r => Math.round(Number(r.rating || 0)) === star).length;
                        const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-500 w-10 shrink-0">
                              {star}<Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-6 shrink-0 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review list */}
                  {reviews.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No reviews yet. Be the first!</p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.slice(0, 6).map((review) => (
                        <article key={review.id || review._id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 text-sm font-black text-primary-700 dark:text-primary-400">
                                {(review.user?.firstName || "C").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                  {review.user?.firstName || "Customer"} {review.user?.lastName || ""}
                                </p>
                                {review.createdAt && (
                                  <p className="text-[11px] text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {!review.approved && (
                                <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                  Pending
                                </span>
                              )}
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(Number(review.rating || 0)) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {review.title && <p className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">{review.title}</p>}
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {review.comment || "Great product quality."}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Write review */}
                  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-5">
                    <p className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">Write a Review</p>
                    {!user ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please{" "}
                        <Link href="/auth/login" className="font-bold text-primary-600 hover:underline">login</Link>
                        {" "}to submit your review.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Your Rating</p>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, idx) => {
                              const val = idx + 1;
                              return (
                                <button
                                  key={val} type="button" onClick={() => setReviewRating(val)}
                                  className="rounded-lg p-1 transition-transform hover:scale-110"
                                  aria-label={`Rate ${val} stars`}
                                >
                                  <Star className={`h-6 w-6 ${val <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Your Review</p>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="Share your honest experience with this product…"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview}
                          className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-primary-700 hover:to-primary-600 disabled:opacity-60"
                        >
                          {isSubmittingReview ? "Submitting…" : "Submit Review"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── Related Products ─── */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-1">From the Same Collection</p>
                <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">You May Also Like</h2>
              </div>
              <Link href="/products" className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {relatedProducts.map((rp) => {
                const relDiscount = typeof rp.discountPercentage === "number" && rp.discountPercentage > 0
                  ? rp.discountPercentage
                  : rp.compareAtPrice && rp.compareAtPrice > rp.price
                  ? Math.round(((rp.compareAtPrice - rp.price) / rp.compareAtPrice) * 100)
                  : 0;
                return (
                  <Link
                    key={rp._id}
                    href={`/products/${rp.slug}`}
                    className="group overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <Image
                        src={normalizeImageUrl(rp.images?.[0]?.url)}
                        alt={rp.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                      />
                      {relDiscount > 0 && (
                        <span className="absolute left-2 top-2 rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                          -{relDiscount}%
                        </span>
                      )}
                    </div>
                    <div className="p-3.5">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        {rp.name}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm font-bold text-primary-700 dark:text-primary-400">
                          NPR {rp.price.toLocaleString()}
                        </span>
                        {relDiscount > 0 && rp.compareAtPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            NPR {rp.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="mt-12">
          <Recommendations userId={user?.id} productId={product?._id} />
        </div>
      </div>

      {/* ─── Mobile sticky CTA ─── */}
      {product.stockQuantity > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+3.5rem)] z-50 md:hidden">
          <div className="mx-3 overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-2xl backdrop-blur-lg">
            <div className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] text-gray-500">{product.name}</p>
                <p className="text-base font-black text-primary-700">NPR {discountedPrice.toLocaleString()}</p>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="shrink-0 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-bold text-white transition hover:from-primary-700 hover:to-primary-600 disabled:opacity-60 min-w-[80px]"
              >
                {isAddingToCart ? "…" : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                className="shrink-0 rounded-xl border-2 border-primary-600 px-4 py-2.5 text-sm font-bold text-primary-700 transition hover:bg-primary-50 disabled:opacity-60 min-w-[80px]"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
