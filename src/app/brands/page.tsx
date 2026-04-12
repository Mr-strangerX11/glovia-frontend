'use client';

import { useBrands } from '@/hooks/useData';
import Link from 'next/link';
import { Loader2, Package } from 'lucide-react';

export default function BrandsPage() {
  const { brands, isLoading, isError } = useBrands();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load brands</p>
          <Link href="/" className="text-primary-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Our Brands</h1>
          <p className="text-gray-600">Explore all our available brands and their products</p>
        </div>

        {/* Brands Grid */}
        {brands && brands.length > 0 ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand: any) => (
              <Link
                key={brand.id || brand.slug}
                href={`/brands/${brand.slug}`}
                className="group"
              >
                <div className="card h-full overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-primary-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg group-hover:text-primary-600 transition-colors">
                      {brand.name}
                    </h3>
                    {brand.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                        {brand.description}
                      </p>
                    )}
                    <div className="mt-4">
                      <span className="text-xs text-primary-600 font-medium hover:underline">
                        View Products →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No brands available at the moment</p>
            <Link href="/" className="text-primary-600 hover:underline">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
