"use client";

import Link from 'next/link';
import Image from 'next/image';
import { SafeImage } from '@/components/common/SafeImage';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Star,
  Award,
  ArrowLeft,
  SlidersHorizontal,
  ChevronDown,
  Store,
  Package,
} from 'lucide-react';
import { useCart } from '@/hooks/useData';
import { cartAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_LABELS: Record<SortOption, string> = {
  default: 'Default',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'name-asc': 'Name A–Z',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// Image error tracking component
function VendorLogoImage({ 
  src, 
  alt, 
  fallbackInitial 
}: { 
  src: string | null; 
  alt: string; 
  fallbackInitial: string;
}) {
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    console.debug(`[VendorLogoImage] Failed to load image: ${src}`);
    setHasError(true);
  };

  if (!src || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-200 to-secondary-200 text-4xl font-black text-primary-700">
        {fallbackInitial}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="128px"
      className="object-contain p-3"
      onError={() => setHasError(true)}
    />
  );
}

// Product image error tracking component
function ProductImage({
  src,
  alt,
  sizes,
  priority = false
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <SafeImage
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover transition-transform duration-500 group-hover:scale-110"
    />
  );
}

type Props = {
  vendor: any;
  products: Product[];
  allProducts?: Product[];
  slug: string;
};

export default function VendorStoreContent({ vendor, products, allProducts = [], slug }: Props) {
  const [sort, setSort] = useState<SortOption>('default');
  const [sortOpen, setSortOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const { mutate: mutateCart } = useCart();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const sorted = useMemo(() => {
    const displayProducts = showAllProducts && allProducts.length > 0 ? allProducts : products;
    const list = [...displayProducts];
    if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, allProducts, sort, showAllProducts]);

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    try {
      setAddingId(product.id);
      await cartAPI.add({ productId: product.id, quantity: 1 });
      await mutateCart();
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  const vendorName = (vendor?.firstName || vendor?.lastName)
    ? `${vendor?.firstName || ''} ${vendor?.lastName || ''}`.trim()
    : (vendor?.email || slug);
  const vendorDescription = vendor?.vendorDescription || vendor?.description || '';
  const vendorLogo = vendor?.vendorLogo || vendor?.logo || null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ─── VENDOR BANNER ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 pb-16 pt-10">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="container relative z-10">
          {/* Back link */}
          <Link
            href="/vendors"
            className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Vendors
          </Link>

          {/* Vendor info */}
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Logo */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white/10 shadow-elevation-4 backdrop-blur-sm sm:h-32 sm:w-32">
              <VendorLogoImage
                src={vendorLogo}
                alt={vendorName}
                fallbackInitial={(vendor?.firstName?.[0] || vendor?.email?.[0] || 'V').toUpperCase()}
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              {/* Name & badge */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white sm:text-4xl">{vendorName}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 text-xs font-bold text-emerald-100 backdrop-blur-sm">
                  <Award className="h-3.5 w-3.5" /> Verified Seller
                </span>
              </div>

              {/* Description */}
              {vendorDescription && (
                <p className="mt-2 max-w-2xl text-sm text-white/80 leading-relaxed">
                  {vendorDescription}
                </p>
              )}

              {/* Contact info */}
              {vendor?.email && (
                <p className="mt-3 text-xs text-white/60">
                  Contact: <span className="text-white/80 font-medium">{vendor.email}</span>
                </p>
              )}

              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{products.length}</p>
                    <p className="text-xs text-white/60">Products</p>
                  </div>
                </div>
                {vendor?.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                      <Star className="h-4 w-4 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{vendor.rating}</p>
                      <p className="text-xs text-white/60">Rating</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS ─── */}
      <div className="container py-12">
        {/* Toolbar */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {showAllProducts ? 'All Products' : `${vendorName}'s Products`}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {sorted.length} {sorted.length === 1 ? 'product' : 'products'} available
            </p>
          </div>

          <div className="flex items-center gap-3">
            {allProducts.length > 0 && (
              <button
                onClick={() => setShowAllProducts(!showAllProducts)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  showAllProducts
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {showAllProducts ? 'All Products' : 'Vendor Products'}
              </button>
            )}

            {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-soft transition hover:border-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {SORT_LABELS[sort]}
              <ChevronDown className={`h-4 w-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-elevation-3 dark:border-gray-700 dark:bg-gray-900">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { setSort(opt); setSortOpen(false); }}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition hover:bg-primary-50 dark:hover:bg-gray-800 ${
                      sort === opt
                        ? 'font-bold text-primary-700 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {SORT_LABELS[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

        {sorted.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {sorted.map((product, index) => (
              <motion.div key={product.id || index} variants={itemVariants}>
                <div className="group flex flex-col h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-3 dark:border-gray-800 dark:bg-gray-900">
                  {/* Image */}
                  <Link href={`/products/${product.slug}`} className="block flex-shrink-0">
                    <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <ProductImage
                        src={product.images?.[0]?.url || '/icon-512.svg'}
                        alt={product.images?.[0]?.altText || product.name}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {/* Badge */}
                      <div className="absolute left-2 top-2">
                        {product.isBestSeller ? (
                          <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">Best Seller</span>
                        ) : product.isNew ? (
                          <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">New</span>
                        ) : null}
                      </div>
                      {/* Wishlist */}
                      <button
                        type="button"
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-gray-500 opacity-0 shadow transition group-hover:opacity-100 hover:text-primary-600 backdrop-blur-sm dark:bg-gray-900/90"
                        aria-label="Wishlist"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col flex-1 p-3.5">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors hover:text-primary-700 dark:text-gray-100 dark:hover:text-primary-400">
                        {product.name}
                      </h3>
                    </Link>

                    {product.averageRating ? (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                          {Number(product.averageRating).toFixed(1)}
                          {product.reviewCount ? ` (${product.reviewCount})` : ''}
                        </span>
                      </div>
                    ) : null}

                    <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-primary-700 dark:text-primary-400 tabular-nums">
                          NPR {Number(product.price || 0).toLocaleString()}
                        </p>
                        {product.compareAtPrice ? (
                          <p className="text-[10px] text-gray-400 line-through dark:text-gray-500 tabular-nums">
                            NPR {Number(product.compareAtPrice).toLocaleString()}
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={addingId === product.id}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm transition hover:bg-primary-700 active:scale-95 disabled:opacity-60 dark:bg-primary-600 dark:hover:bg-primary-700"
                        aria-label="Add to cart"
                      >
                        {addingId === product.id ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          <ShoppingCart className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <Store className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">No products yet</h2>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">This vendor is currently setting up their store.</p>
            <Link href="/products" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-bold text-white shadow transition hover:from-primary-700 hover:to-primary-600">
              Browse All Products <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
