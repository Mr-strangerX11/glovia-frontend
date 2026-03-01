"use client";

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ArrowRight,
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Smartphone,
  Download,
} from 'lucide-react';
import { useMemo, useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Product, Banner } from '@/types';

const HeroThreeScene = dynamic(() => import('@/components/premium/HeroThreeScene'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] sm:h-[360px] lg:h-[430px] w-full rounded-2xl bg-gradient-to-br from-primary-100/60 to-secondary-100/60 animate-pulse" />
  ),
});

const Recommendations = dynamic(() => import('@/components/Recommendations'), {
  ssr: false,
  loading: () => null,
});

type HomeContentProps = {
  featuredProducts: Product[] | { data?: Product[] } | null;
  banners: Banner[] | { data?: Banner[] } | null;
};

function normalizeList<T>(payload: T[] | { data?: T[] } | null | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
}

export default function HomeContent({ featuredProducts, banners }: HomeContentProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const products = useMemo(() => normalizeList<Product>(featuredProducts), [featuredProducts]);
  const heroBanners = useMemo(() => normalizeList<Banner>(banners), [banners]);

  const trendingProducts = products.slice(0, 4);
  const newArrivals = products.slice(2, 6);
  const bestSellers = products.slice(4, 8);

  const categoryHighlights = [
    { name: 'Electronics', href: '/products?category=electronics', emoji: '📱' },
    { name: 'Fashion', href: '/products?category=fashion', emoji: '🧥' },
    { name: 'Health & Beauty', href: '/products?category=beauty', emoji: '💄' },
    { name: 'Groceries', href: '/products?category=groceries', emoji: '🛒' },
    { name: 'Home & Kitchen', href: '/products?category=home', emoji: '🏡' },
    { name: 'Kids & Toys', href: '/products?category=kids', emoji: '🧸' },
    { name: 'Sports', href: '/products?category=sports', emoji: '🏀' },
    { name: 'Digital Services', href: '/products?category=digital', emoji: '💻' },
  ];

  const trustItems = [
    {
      title: 'Fast Delivery Nepal',
      description: 'Reliable delivery across major cities and districts.',
      icon: Truck,
    },
    {
      title: 'Return & Exchange',
      description: 'Transparent policy with hassle-free replacement support.',
      icon: RefreshCcw,
    },
    {
      title: 'Secure Payments',
      description: 'eSewa, Khalti, IME Pay and COD with verification flow.',
      icon: ShieldCheck,
    },
  ];

  const testimonials = [
    { name: 'Sushmita R.', quote: 'Golvia feels premium. Delivery was fast and packaging was excellent.', rating: 5 },
    { name: 'Rabin K.', quote: 'The product recommendations are very accurate and useful for gifting.', rating: 5 },
    { name: 'Aakriti M.', quote: 'Smooth checkout and trusted payment options made me buy instantly.', rating: 5 },
  ];

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = 'Newsletter Subscription Request';
    const body = `\nNew newsletter subscription request:\n\nEmail: ${newsletterEmail}\n\nPlease add this email to the newsletter mailing list.`.trim();
    const mailtoLink = `mailto:glovianepal@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setNewsletterEmail('');
  };

  const renderProductCard = (product: Product, index: number) => (
    <motion.div
      key={product.id || `${product.name}-${index}`}
      className="group card overflow-hidden border border-white/30 bg-white/70 backdrop-blur-xl"
      whileHover={{ y: -8, rotateX: 6, rotateY: index % 2 === 0 ? -5 : 5 }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={product.images?.[0]?.url || '/og-image.jpg'}
          alt={product.images?.[0]?.altText || product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700">
          {product.isBestSeller ? 'Best Seller' : product.isNew ? 'New' : 'Trending'}
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="line-clamp-1 text-base font-semibold text-secondary-900">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-secondary-600">{product.description || 'Premium quality product from Golvia Nepal.'}</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary-700">NPR {Number(product.price || 0).toLocaleString()}</p>
            {product.compareAtPrice ? (
              <p className="text-xs text-gray-500 line-through">NPR {Number(product.compareAtPrice).toLocaleString()}</p>
            ) : null}
          </div>
          <button className="rounded-xl bg-secondary-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-secondary-800">
            Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary-50/30 to-secondary-50/40">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(204,68,96,0.14),transparent_42%),radial-gradient(circle_at_80%_30%,rgba(88,123,161,0.18),transparent_48%)]" />
        <div className="container grid gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:gap-10 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="space-y-5"
          >
            <span className="inline-flex items-center rounded-full border border-white/40 bg-white/75 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 backdrop-blur-md">
              Golvia Nepal Marketplace
            </span>
            <h1 className="text-3xl font-bold leading-tight text-secondary-950 sm:text-4xl lg:text-5xl">
              Premium 3D Shopping Experience for Nepal
            </h1>
            <p className="max-w-xl text-sm text-secondary-700 sm:text-base">
              Discover trending products, trusted sellers, and faster checkout with a modern marketplace built for conversion, trust, and speed.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/products" className="btn-primary rounded-2xl px-5 py-3">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/vendor" className="btn-outline rounded-2xl px-5 py-3">
                Become a Seller
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
              {trustItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/30 bg-white/70 p-3 backdrop-blur-lg">
                  <item.icon className="h-4 w-4 text-primary-600" />
                  <p className="mt-1 text-xs font-semibold text-secondary-900">{item.title}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65 }}
            className="rounded-3xl border border-white/40 bg-white/50 p-2 shadow-soft backdrop-blur-xl"
          >
            <HeroThreeScene />
          </motion.div>
        </div>
      </section>

      <section className="container py-3 sm:py-5">
        <div className="grid gap-3 rounded-3xl border border-white/40 bg-white/80 p-4 shadow-soft backdrop-blur-xl md:grid-cols-3">
          {[
            {
              title: 'Faster storefront performance',
              description: 'Optimized media loading, premium visuals, and conversion-first interactions.',
            },
            {
              title: 'AI + trusted checkout',
              description: 'Recommendations with secure eSewa, Khalti, IME Pay, and COD verification.',
            },
            {
              title: 'Premium Nepal marketplace UX',
              description: '3D storytelling, mobile-first flow, and seller-grade analytics in one platform.',
            },
          ].map((item) => (
            <motion.article
              key={item.title}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/50 bg-white/90 p-4"
            >
              <h3 className="text-sm font-semibold text-secondary-950">{item.title}</h3>
              <p className="mt-1 text-xs text-secondary-700 sm:text-sm">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="container py-6 sm:py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categoryHighlights.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                href={category.href}
                className="group block rounded-2xl border border-white/40 bg-white/75 p-4 text-center shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-2xl">{category.emoji}</p>
                <p className="mt-2 text-sm font-semibold text-secondary-900">{category.name}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-secondary-950">Trending Products</h2>
          <Link href="/products" className="text-sm font-semibold text-primary-700 hover:underline">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trendingProducts.map(renderProductCard)}
        </div>
      </section>

      <section className="container py-4 sm:py-6">
        <div className="grid gap-6 rounded-3xl border border-white/40 bg-gradient-to-r from-secondary-900 via-secondary-800 to-primary-900 p-6 text-white sm:p-8 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold">Seasonal Offers & Promo Banners</h3>
            <p className="mt-2 text-sm text-white/85">Rotate targeted campaigns with conversion-first visuals and first-buyer discount popups.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(heroBanners.length ? heroBanners.slice(0, 2) : [{ id: 'sale', title: 'Mega Sale', image: '/og-image.jpg' }, { id: 'new', title: 'New Collection', image: '/og-image.jpg' }]).map((banner, i) => (
              <div key={banner.id || i} className="relative h-32 overflow-hidden rounded-2xl border border-white/20">
                <Image src={banner.image || '/og-image.jpg'} alt={banner.title || 'Banner'} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/35 p-3">
                  <p className="text-xs font-semibold uppercase">Campaign</p>
                  <p className="mt-1 text-sm font-bold">{banner.title || 'Special Offer'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        <h2 className="mb-4 text-2xl font-bold text-secondary-950">New Arrivals</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {newArrivals.map(renderProductCard)}
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        <h2 className="mb-4 text-2xl font-bold text-secondary-950">Best Sellers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map(renderProductCard)}
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        <h2 className="mb-4 text-2xl font-bold text-secondary-950">What customers say</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <motion.article
              key={item.name}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-white/40 bg-white/75 p-5 shadow-soft backdrop-blur-lg"
            >
              <div className="mb-2 flex items-center gap-1 text-yellow-500">
                {Array.from({ length: item.rating }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-secondary-700">“{item.quote}”</p>
              <p className="mt-3 text-sm font-semibold text-secondary-900">{item.name}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="container py-8 sm:py-10">
        <Recommendations />
      </section>

      <section className="container pb-24 pt-6 sm:pb-12">
        <div className="grid gap-6 rounded-3xl border border-white/40 bg-white/75 p-6 shadow-soft backdrop-blur-xl lg:grid-cols-2 lg:p-8">
          <div>
            <div className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
              <Smartphone className="mr-1 h-3.5 w-3.5" /> Golvia App
            </div>
            <h3 className="mt-3 text-2xl font-bold text-secondary-950">Shop faster with the Golvia app</h3>
            <p className="mt-2 text-sm text-secondary-700">Get order tracking, flash sale alerts, and one-tap checkout optimized for Nepali customers.</p>
            <button className="btn-primary mt-4 rounded-2xl px-5 py-3">
              <Download className="mr-2 h-4 w-4" /> Download App
            </button>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-secondary-950">Newsletter & rewards</h4>
            <p className="mt-1 text-sm text-secondary-700">Get first-time buyer offers, loyalty points updates, and referral bonus campaigns.</p>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                className="input rounded-2xl"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button className="btn-primary rounded-2xl px-5 py-3" type="submit">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Link
        href="/cart"
        className="fixed bottom-20 right-4 z-50 inline-flex items-center rounded-full bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-700 md:bottom-6"
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Cart
      </Link>

      <Link
        href="/wishlist"
        className="fixed bottom-20 left-4 z-50 inline-flex items-center rounded-full border border-white/30 bg-white/90 px-4 py-3 text-sm font-semibold text-secondary-900 shadow-lg backdrop-blur md:bottom-6"
      >
        <Heart className="mr-2 h-4 w-4 text-primary-600" />
        Wishlist
      </Link>
    </div>
  );
}
