"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Sparkles, ArrowRight, Package, Star } from "lucide-react";
import { useWishlist } from "@/hooks/useData";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import Recommendations from "@/components/Recommendations";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 w-14 rounded bg-gray-100" />
        <div className="h-4 w-full rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
        <div className="h-5 w-20 rounded bg-gray-100 mt-1" />
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { user, isChecking } = useAuthGuard();
  const { wishlist, isLoading } = useWishlist();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-100 border-t-primary-500" />
          <p className="text-sm text-gray-400 font-medium">Loading your wishlist…</p>
        </div>
      </div>
    );
  }

  const count = wishlist?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 py-5">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="container relative z-10">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Heart className="h-5 w-5 fill-white/80 text-white" /> Wishlist
          </h1>
        </div>
      </section>

      {/* Content */}
      <div className="container pt-5 pb-16">

        {/* Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && count === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 px-8 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
              <Heart className="h-10 w-10 text-rose-300" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Nothing saved yet</h2>
            <p className="mt-1 max-w-xs text-sm text-gray-400 leading-relaxed">
              Tap the heart icon on any product to save it here for quick access later.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-90 transition"
              >
                <Package className="h-4 w-4" /> Browse Products
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-100 bg-white px-7 py-3.5 text-sm font-bold text-gray-700 shadow-sm hover:border-primary-200 hover:text-primary-600 transition"
              >
                Explore Brands
              </Link>
            </div>
          </div>
        )}

        {/* Product grid */}
        {!isLoading && count > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {wishlist!.map((item) => {
              const product = item.product;
              const hasDiscount = !!(product?.compareAtPrice && product?.price && product.compareAtPrice > product.price);
              const discount = hasDiscount && product?.compareAtPrice && product?.price
                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                : 0;
              return (
                <Link
                  key={item.id || product?.slug}
                  href={`/products/${product.slug}`}
                  className="group rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <Image
                      src={product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      {hasDiscount && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      {product?.isNew && (
                        <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    {/* Heart */}
                    <div className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                    </div>
                    {/* Quick action overlay */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-3 px-3">
                      <div className="flex items-center gap-1 justify-center text-white text-xs font-bold">
                        <ShoppingCart className="h-3.5 w-3.5" /> View Product
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    {product.category?.name && (
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {product.category.name}
                      </p>
                    )}
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 pt-0.5">
                      <p className="text-sm font-black text-primary-600">
                        NPR {product.price?.toLocaleString()}
                      </p>
                      {hasDiscount && (
                        <p className="text-xs text-gray-400 line-through">
                          NPR {product.compareAtPrice?.toLocaleString()}
                        </p>
                      )}
                    </div>
                    {product.isBestSeller && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Best Seller
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Recommendations />
    </div>
  );
}
