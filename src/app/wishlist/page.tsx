"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Sparkles, ArrowRight, Package } from "lucide-react";
import { useWishlist } from "@/hooks/useData";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Recommendations from '@/components/Recommendations';

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse dark:bg-gray-900 dark:border-gray-800">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-5 w-20 rounded bg-gray-100 dark:bg-gray-800 mt-1" />
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { user, isChecking } = useAuthGuard();
  const { wishlist, isLoading } = useWishlist();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-primary-200 border-t-primary-600" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  const count = wishlist?.length ?? 0;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 pt-12 pb-20">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/8 blur-2xl" />
        <div className="container relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Your Collection
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl flex items-center gap-3">
                <Heart className="h-8 w-8 fill-white/80 text-white" />
                Wishlist
              </h1>
              <p className="mt-2 text-pink-100/80 text-sm">
                {isLoading
                  ? 'Loading your saved items…'
                  : count > 0
                    ? `${count} item${count !== 1 ? 's' : ''} saved for later`
                    : 'Start saving products you love'}
              </p>
            </div>
            {count > 0 && (
              <Link
                href="/products"
                className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Browse More <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── Content ─── */}
      <div className="container py-10">

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && count === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
              <Heart className="h-10 w-10 text-primary-300 dark:text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nothing saved yet</h2>
            <p className="mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-400">
              Tap the heart icon on any product to save it here for quick access later.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-bold text-white shadow transition hover:from-primary-700 hover:to-primary-600"
              >
                <Package className="h-4 w-4" /> Browse Products
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-soft transition hover:border-primary-200 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                Explore Brands
              </Link>
            </div>
          </div>
        )}

        {/* Product grid */}
        {!isLoading && count > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {wishlist!.map((item) => (
              <Link
                key={item.id || item.product?.slug}
                href={`/products/${item.product.slug}`}
                className="group rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-soft transition-all duration-300 hover:shadow-elevation-3 hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Heart badge */}
                  <div className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm dark:bg-gray-900/90">
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                  </div>
                </div>
                <div className="p-3.5 space-y-1">
                  {item.product.category?.name && (
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      {item.product.category.name}
                    </p>
                  )}
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug dark:text-gray-100">
                    {item.product.name}
                  </h3>
                  <div className="flex items-center justify-between pt-0.5">
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      NPR {item.product.price?.toLocaleString()}
                    </p>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600 opacity-0 transition-all duration-200 group-hover:opacity-100 dark:bg-primary-900/20 dark:text-primary-400">
                      <ShoppingCart className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ─── Recommendations ─── */}
      <Recommendations />
    </div>
  );
}
