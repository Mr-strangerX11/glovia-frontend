'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { useFeaturedProducts, useBanners } from '@/hooks/useData';

export default function HomePage() {
  const { products: featuredProducts } = useFeaturedProducts(8);
  const { banners } = useBanners();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20 md:py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium">Made for Nepal</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight">
                Embrace Your
                <span className="block gradient-text">Natural Beauty</span>
              </h1>
              
              <p className="text-lg text-gray-600">
                Premium cosmetics and skincare products crafted for Nepali skin. 
                Experience the perfect blend of nature and science.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="btn-primary">
                  Shop Now <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link href="/about" className="btn-outline">
                  Our Story
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary-600">5000+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600">100%</div>
                  <div className="text-sm text-gray-600">Authentic Products</div>
                </div>
              </div>
            </div>

            <div className="relative h-[500px] animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200/50 to-accent-200/50 rounded-3xl blur-3xl"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="w-64 h-64 md:w-80 md:h-80 relative">
                  <Image
                    src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"
                    alt="Beauty Products"
                    fill
                    className="object-cover rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600">Discover products for every beauty need</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Skincare', icon: '✨', href: '/products?category=skincare' },
              { name: 'Haircare', icon: '💇', href: '/products?category=haircare' },
              { name: 'Makeup', icon: '💄', href: '/products?category=makeup' },
              { name: 'Organic', icon: '🌿', href: '/products?category=organic' },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="card group p-8 text-center hover:shadow-xl transition-all"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600">Handpicked favorites for you</p>
            </div>
            <Link href="/products" className="btn-outline hidden md:inline-flex">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <div key={product.id} className="card group">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.images[0]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.isNew && (
                    <span className="absolute top-2 left-2 bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                      NEW
                    </span>
                  )}
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">
                    {product.category.name}
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {product.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.reviewCount || 0})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-primary-600">
                        NPR {product.price}
                      </div>
                      {product.compareAtPrice && (
                        <div className="text-sm text-gray-400 line-through">
                          NPR {product.compareAtPrice}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/products" className="btn-primary w-full">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: '🚚', title: 'Free Delivery', desc: 'On orders above NPR 2,000' },
              { icon: '✅', title: '100% Authentic', desc: 'Original products only' },
              { icon: '↩️', title: 'Easy Returns', desc: '7-day return policy' },
              { icon: '🔒', title: 'Secure Payment', desc: 'Multiple payment options' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl">{item.icon}</div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Join Our Beauty Community
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Get exclusive offers, beauty tips, and product updates
          </p>
          
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button type="submit" className="btn bg-white text-primary-600 hover:bg-gray-100">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
