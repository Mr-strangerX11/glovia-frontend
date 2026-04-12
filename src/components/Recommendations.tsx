"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRecommendations } from '@/hooks/useRecommendations';

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse dark:bg-gray-900 dark:border-gray-800">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-16 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="h-5 w-14 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default function Recommendations({ userId, productId }: { userId?: string; productId?: string }) {
  const { recommendations, isLoading } = useRecommendations(userId, productId);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const prefersReducedMotion = useReducedMotion();

  const handleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isLoading && !recommendations.length) return null;

  const limitedRecommendations = recommendations.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
              <Sparkles className="h-3 w-3" /> Personalized For You
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Smart Picks</h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Similar picks with the best available prices</p>
        </div>
        {recommendations.length > 8 && (
          <Link href="/products" className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-gray-200 hover:border-primary-200 bg-white hover:bg-primary-50 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-primary-700 shadow-soft transition dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-primary-900/20">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Product grid */}
      {!isLoading && (
        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          {limitedRecommendations.map((product, idx) => {
            const productId = product._id || product.id;
            const productSlug = product.slug || productId;
            const basePrice = Number(product.price || 0);
            const fallbackCompareAt = Number(product.compareAtPrice || 0);
            const normalizedDiscount = Number(product.discountPercentage || 0);
            const computedDiscount =
              normalizedDiscount > 0
                ? normalizedDiscount
                : fallbackCompareAt > basePrice
                  ? Math.round(((fallbackCompareAt - basePrice) / fallbackCompareAt) * 100)
                  : 0;
            const discountedPrice =
              computedDiscount > 0 && normalizedDiscount > 0
                ? basePrice - (basePrice * computedDiscount) / 100
                : basePrice;
            const originalPrice = fallbackCompareAt > discountedPrice ? fallbackCompareAt : basePrice;
            const isWishlisted = wishlist.has(productId);
            const inStock = product.stock !== 0 && product.stock !== false;

            return (
              <motion.div
                key={productId}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/products/${productSlug}`}
                  className="group flex flex-col h-full rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-soft transition-all duration-300 hover:shadow-elevation-3 hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800"
                >
                  {/* Image container */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <Image
                      src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'}
                      alt={product.name || 'Recommended product'}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                      className="object-contain p-3 transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Discount badge */}
                    {computedDiscount > 0 && (
                      <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-red-500/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                        <span>-{computedDiscount}%</span>
                      </div>
                    )}

                    {/* Stock indicator */}
                    {!inStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-gray-900">Out of Stock</span>
                      </div>
                    )}

                    {/* Heart button */}
                    <button
                      onClick={(e) => handleWishlist(productId, e)}
                      className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
                        isWishlisted
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-white/80 text-gray-600 shadow-sm hover:bg-white hover:text-rose-500 dark:bg-gray-800/80'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-3.5">
                    {/* Category */}
                    {product.category?.name && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                        {product.category.name}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug dark:text-gray-100 mb-2">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2.5">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.round(product.rating || 4) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">({product.rating || 4}.0)</span>
                    </div>

                    {/* Price */}
                    <div className="space-y-0.5 mb-3">
                      <p className="text-sm font-black text-primary-600 dark:text-primary-400 tabular-nums">
                        ₨{Number(discountedPrice || 0).toLocaleString()}
                      </p>
                      {computedDiscount > 0 && (
                        <p className="text-xs text-gray-400 line-through dark:text-gray-500 tabular-nums">
                          ₨{Number(originalPrice || 0).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Add to cart button */}
                    <button
                      disabled={!inStock}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                        inStock
                          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                      }`}
                    >
                      <ShoppingCart className="h-3 w-3" />
                      {inStock ? 'Add' : 'Out'}
                    </button>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
