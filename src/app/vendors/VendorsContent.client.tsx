"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, Award, Store, ArrowRight, Star, Package, Users } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Medicine', value: 'medicine' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Essentials', value: 'essentials' },
];

const CATEGORY_COLORS: Record<string, { dot: string; badge: string; bg: string }> = {
  beauty: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', bg: 'hover:bg-rose-50' },
  medicine: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', bg: 'hover:bg-emerald-50' },
  clothing: { dot: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700', bg: 'hover:bg-violet-50' },
  essentials: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', bg: 'hover:bg-amber-50' },
};

export default function VendorsContent({ vendors: initialVendors }: { vendors: any[] | null }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [vendors, setVendors] = useState<any[]>(initialVendors || []);
  const [isLoading, setIsLoading] = useState(!initialVendors);
  const prefersReducedMotion = useReducedMotion();

  // Fetch vendors client-side if not provided
  useEffect(() => {
    if (initialVendors) return;

    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        // Try to fetch from the vendors endpoint
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://backend-glovia.vercel.app';
        const response = await fetch(`${apiBase}/admin/vendors`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies for auth
        });

        if (response.ok) {
          const data = await response.json();
          const vendorList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          setVendors(vendorList);
        } else {
          console.warn(`[VendorsContent] Fetch failed with status ${response.status}`);
          setVendors([]);
        }
      } catch (error) {
        console.error('[VendorsContent] Failed to fetch vendors:', error);
        setVendors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, [initialVendors]);

  const filtered = useMemo(() => {
    let list = vendors;

    // Backend already returns only VENDOR role, so just show all returned vendors
    list = list.filter((v) => v && (v._id || v.id));
    
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          (v.firstName || '').toLowerCase().includes(q) ||
          (v.lastName || '').toLowerCase().includes(q) ||
          (v.email || '').toLowerCase().includes(q) ||
          (v.vendorDescription || '').toLowerCase().includes(q) ||
          (`${v.firstName || ''} ${v.lastName || ''}`).toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      list = list.filter((v) => v.vendorCategory?.toLowerCase().includes(activeCategory));
    }
    
    return list;
  }, [vendors, search, activeCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 pb-14 pt-12">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="container relative z-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/70 backdrop-blur-md mb-4">
              <Store className="h-3.5 w-3.5 text-primary-400" /> Verified Sellers
            </span>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">All Vendors</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/65 leading-relaxed">
              Browse {vendors.length > 0 ? vendors.length : 'our'} trusted vendors across Beauty, Medicine, Clothing &amp; Essentials.
            </p>

            {/* Search */}
            <div className="mx-auto mt-7 flex max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-1.5 backdrop-blur-xl shadow-lg">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendors…"
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none"
              />
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-500">
                <Search className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container relative z-10 -mt-6 pb-16">

        {/* ─── CATEGORY FILTERS ─── */}
        <motion.div
          className="mb-8 flex flex-wrap gap-2 rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-soft dark:border dark:border-gray-800"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat.value
                  ? 'border-primary-600 bg-primary-100 text-primary-700 shadow-sm dark:bg-primary-900/30 dark:text-primary-400'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
              {i === 0 && filtered.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {filtered.length}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* ─── VENDOR GRID ─── */}
        {isLoading ? (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 dark:bg-gray-900 dark:border-gray-800">
                <div className="h-24 bg-gray-100 rounded-xl dark:bg-gray-800 mb-4" />
                <div className="h-4 bg-gray-100 rounded dark:bg-gray-800 mb-2 w-3/4" />
                <div className="h-3 bg-gray-100 rounded dark:bg-gray-800 mb-4" />
                <div className="h-8 bg-gray-100 rounded-lg dark:bg-gray-800" />
              </div>
            ))}
          </motion.div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((vendor, index) => {
              const vendorName = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email || 'Vendor';
              const vendorLogo = vendor.vendorLogo;
              const vendorDescription = vendor.vendorDescription;
              const category = vendor.vendorCategory || 'essentials';
              const categoryColor = CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS['essentials'];
              const rating = vendor.rating;
              const reviewCount = vendor.reviewCount;
              const productCount = vendor.productCount;
              const hasStats = rating !== undefined || reviewCount !== undefined || productCount !== undefined;
              const vendorSlug = vendor.email?.toLowerCase().replace(/[^a-z0-9]/g, '-') || vendor.slug || vendor._id;

              return (
                <motion.div key={vendor._id || vendor.id || index} variants={itemVariants}>
                  <Link
                    href={`/vendors/${vendorSlug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft transition-all duration-300 hover:shadow-elevation-3 hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-900"
                  >
                    {/* Header with stripe */}
                    <div className="relative h-24 overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20">
                      {/* Decorative blobs */}
                      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-200/30 blur-2xl dark:bg-primary-800/20" />
                      <div className="pointer-events-none absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-secondary-200/30 blur-2xl dark:bg-secondary-800/20" />

                      {/* Category indicator */}
                      {category && (
                        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 backdrop-blur-sm dark:bg-gray-800/90">
                          <div className={`h-2 w-2 rounded-full ${categoryColor.dot}`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                            {category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Logo — pulled up */}
                    <div className="relative -mt-8 flex justify-center px-4">
                      <div className="relative z-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-elevation-3 dark:border-gray-900 dark:bg-gray-800">
                        {vendorLogo ? (
                          <Image
                            src={vendorLogo}
                            alt={vendorName}
                            fill
                            sizes="80px"
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 text-2xl font-bold text-primary-700 dark:from-primary-900/40 dark:to-secondary-900/40 dark:text-primary-400">
                            {(vendor.firstName?.[0] || vendor.email?.[0] || 'V').toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 px-4 py-4 text-center">
                      {/* Name */}
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 line-clamp-1 transition-colors group-hover:text-primary-700 dark:group-hover:text-primary-400">
                        {vendorName}
                      </h3>

                      {/* Description */}
                      {vendorDescription && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {vendorDescription}
                        </p>
                      )}

                      {/* Stats — only show if data exists */}
                      {hasStats && (
                        <div className="my-3 flex items-center justify-center gap-4 px-2">
                          {rating !== undefined && (
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{rating}</span>
                              </div>
                              {reviewCount !== undefined && (
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">{reviewCount} reviews</p>
                              )}
                            </div>
                          )}
                          {(rating !== undefined && productCount !== undefined) && (
                            <div className="border-l border-gray-200 dark:border-gray-700" />
                          )}
                          {productCount !== undefined && (
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1">
                                <Package className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{productCount}</span>
                              </div>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">products</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Verified badge */}
                      <div className="mb-3 flex items-center justify-center gap-1">
                        <Award className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                          Verified Seller
                        </span>
                      </div>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* CTA */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/vendors/${vendorSlug}`;
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-100 to-secondary-100 px-4 py-2.5 text-sm font-bold text-primary-700 transition-all group-hover:from-primary-600 group-hover:to-primary-500 group-hover:text-white dark:from-primary-900/30 dark:to-secondary-900/30 dark:text-primary-400 dark:group-hover:from-primary-600 dark:group-hover:to-primary-500 dark:group-hover:text-white"
                      >
                        Visit Store <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center py-24 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
              <Store className="h-8 w-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {search ? 'No vendors match your search' : 'No approved vendors available'}
            </h2>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
              {search ? 'Try adjusting your search terms' : 'Check back soon for verified vendors'}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 dark:border-primary-900/30 dark:bg-primary-900/10 dark:text-primary-400"
              >
                Clear search
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
