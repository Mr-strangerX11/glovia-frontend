'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useData';
import { Button, Card, CardContent, Input, Badge } from '@/components/ui';
import { PageLayout, PageSection, PageGrid } from '@/components/ui';
import {
  Search,
  Filter,
  ChevronDown,
  Heart,
  ShoppingCart,
  Star,
  Zap,
  TrendingUp,
} from 'lucide-react';

export default function ImprovedProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);

  const { products, isLoading } = useProducts({
    search: searchQuery,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
  });

  const categories = [
    { id: 'all', name: 'All Products', icon: '📦' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
    { id: 'groceries', name: 'Groceries', icon: '🛒' },
    { id: 'clothes-shoes', name: 'Clothes & Shoes', icon: '👕' },
    { id: 'essentials', name: 'Essentials', icon: '🏠' },
  ];

  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const filteredProducts = useMemo(() => {
    let items = [...(products || [])];

    // Filter by price
    items = items.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        items.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return items;
  }, [products, sortBy, priceRange]);

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    router.push(`/products?search=${encodeURIComponent(val)}`);
  };

  return (
    <PageLayout
      title="Shop Our Collection"
      subtitle="Discover premium products from trusted vendors"
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      }
    >
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Navigation */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap font-medium transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <div className="w-64 flex-shrink-0">
            <Card shadow="sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full"
                  />
                  <div className="mt-3 flex justify-between text-sm text-gray-600">
                    <span>NPR {priceRange[0].toLocaleString()}</span>
                    <span>NPR {priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:outline-none"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button variant="ghost" fullWidth>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredProducts.length}</span> products
            </p>
            {!showFilters && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <div className="aspect-square bg-gray-100 animate-pulse rounded-t-lg" />
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-600 mb-4">No products found</p>
              <Button variant="primary" onClick={() => handleSearch('')}>
                Browse All Products
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.slug || product._id}`}>
      <Card hover shadow="md" className="overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images?.[0] && (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover hover:scale-110 transition-transform duration-300"
            />
          )}
          {product.discount && (
            <div className="absolute top-3 right-3">
              <Badge variant="danger" size="sm">
                -{product.discount}%
              </Badge>
            </div>
          )}
          {product.isNew && (
            <div className="absolute top-3 left-3">
              <Badge variant="primary" size="sm">
                New
              </Badge>
            </div>
          )}

          {/* Heart Icon */}
          <button
            onClick={(e) => {
              e.preventDefault();
              // Handle wishlist
            }}
            className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          {product.rating && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-700">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">({product.reviews || 0})</span>
            </div>
          )}

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              NPR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                NPR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {product.stock === 0 && (
            <Badge variant="danger" className="w-full justify-center">
              Out of Stock
            </Badge>
          )}

          {product.stock && product.stock < 5 && (
            <Badge variant="warning" size="sm" className="w-full justify-center">
              Only {product.stock} left
            </Badge>
          )}
        </CardContent>

        {/* Action */}
        {product.stock > 0 && (
          <div className="border-t border-gray-100 p-4">
            <Button
              variant="primary"
              size="md"
              fullWidth
              className="gap-2"
              onClick={(e) => {
                e.preventDefault();
                // Handle add to cart
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        )}
      </Card>
    </Link>
  );
}
