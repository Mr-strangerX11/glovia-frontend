"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRecommendations } from '@/hooks/useRecommendations';

export default function Recommendations({ userId, productId }: { userId?: string; productId?: string }) {
  const { recommendations } = useRecommendations(userId, productId);
  if (!recommendations.length) return null;

  const limitedRecommendations = recommendations.slice(0, 8);

  return (
    <div className="mt-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-2xl font-bold">You May Also Like</h2>
        <p className="text-sm text-gray-500">Similar picks with the best available prices</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {limitedRecommendations.map((product) => {
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

          return (
            <Link key={productId} href={`/products/${productSlug}`} className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-white">
                <Image
                  src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'}
                  alt={product.name || 'Recommended product'}
                  fill
                  className="object-contain p-3"
                />
                {computedDiscount > 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
                    {computedDiscount}% OFF
                  </span>
                )}
              </div>
              <div className="space-y-1.5 p-3">
                <p className="line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-primary-700">₨{Number(discountedPrice || 0).toLocaleString()}</span>
                  {computedDiscount > 0 && (
                    <span className="text-xs text-gray-400 line-through">₨{Number(originalPrice || 0).toLocaleString()}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
