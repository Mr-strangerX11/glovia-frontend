'use client';

import { useBrand } from '@/hooks/useData';
import Link from 'next/link';
import { Loader2, Package, ArrowLeft, Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { cartAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
}

function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await cartAPI.add({ productId: product.id, quantity: 1 });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="card h-full overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="h-48 bg-gray-100 overflow-hidden">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto pt-4 flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary-600">
              Rs. {product.price?.toLocaleString()}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="text-xs text-gray-500 line-through">
                Rs. {product.discountPrice?.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stockQuantity === 0}
            className="w-full mt-3 flex items-center justify-center gap-2 btn btn-sm btn-primary disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function BrandDetailPage({ params }: { params: { slug: string } }) {
  const { brand, isLoading, isError } = useBrand(params.slug);
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  const filteredProducts = (brand as any)?.products
    ?.filter((product: any) => {
      const price = product.price || 0;
      return price >= minPrice && price <= maxPrice;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isError || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Brand not found</p>
          <Link href="/brands" className="text-primary-600 hover:underline">
            Back to Brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <Link href="/brands" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Brands
          </Link>

          <div className="flex items-start gap-6">
            {brand.logo && (
              <div className="h-24 w-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">{brand.name}</h1>
              {brand.description && (
                <p className="text-gray-600">{brand.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4 space-y-4">
              <h3 className="font-semibold">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input input-sm"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <h3 className="font-semibold mt-6">Price Range</h3>
              <div className="space-y-2">
                <label className="text-sm">
                  Min: Rs. {minPrice.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(parseInt(e.target.value))}
                  className="w-full"
                />

                <label className="text-sm mt-3 block">
                  Max: Rs. {maxPrice.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No products found in this price range</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
