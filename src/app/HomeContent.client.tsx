"use client";

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ArrowRight, Star, ShieldCheck, Truck, RefreshCcw,
  Search, Sparkles, Award, ChevronRight, Zap, Package,
  HeadphonesIcon, BadgeCheck, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useMemo, useState, FormEvent, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Brand, Banner } from '@/types';
import { newsletterAPI, adminAPI, flashDealsAPI, bannersAPI } from '@/lib/api';
import { normalizeList } from '@/lib/utils';
import { useHomePageRealtime } from '@/hooks/useHomePageRealtime';

// Vendor Image Component with Error Handling
function VendorImage({
  src,
  name,
  initial
}: {
  src: string | null;
  name: string;
  initial: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 text-xl font-black text-primary-700 dark:text-primary-400">
        {initial}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={64}
      height={64}
      unoptimized
      className="object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

const Recommendations = dynamic(() => import('@/components/Recommendations'), {
  ssr: false,
  loading: () => null,
});

const ActivityFeed = dynamic(() => import('@/components/ActivityFeed'), {
  ssr: false,
  loading: () => null,
});

type HomeContentProps = {
  brands: Brand[] | { data?: Brand[] } | null;
  banners: Banner[] | { data?: Banner[] } | null;
};

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const CATEGORIES = [
  {
    slug: 'beauty', label: 'Beauty', nepali: 'सौन्दर्य', emoji: '💄',
    description: 'Skincare · Makeup · Haircare',
    query: 'skincare',
    gradient: 'from-rose-500 to-pink-600',
    lightGradient: 'from-rose-50 to-pink-50',
    border: 'border-rose-100 hover:border-rose-300',
    tag: 'Top Seller',
    tagColor: 'bg-rose-100 text-rose-700',
  },
  {
    slug: 'pharmacy', label: 'Pharmacy', nepali: 'फार्मेसी', emoji: '💊',
    description: 'Medications · Supplements · Wellness',
    query: 'pharmacy',
    gradient: 'from-emerald-500 to-teal-600',
    lightGradient: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-100 hover:border-emerald-300',
    tag: 'Verified',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    slug: 'groceries', label: 'Groceries', nepali: 'किराना', emoji: '🛒',
    description: 'Food · Beverages · Pantry',
    query: 'groceries',
    gradient: 'from-amber-500 to-orange-600',
    lightGradient: 'from-amber-50 to-orange-50',
    border: 'border-amber-100 hover:border-amber-300',
    tag: 'Daily',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    slug: 'clothes-shoes', label: 'Fashion', nepali: 'लुगा र जुत्ता', emoji: '👕',
    description: 'Apparel · Footwear · Style',
    query: 'clothing',
    gradient: 'from-violet-500 to-purple-600',
    lightGradient: 'from-violet-50 to-purple-50',
    border: 'border-violet-100 hover:border-violet-300',
    tag: 'Trending',
    tagColor: 'bg-violet-100 text-violet-700',
  },
  {
    slug: 'essentials', label: 'Essentials', nepali: 'आवश्यक', emoji: '🏠',
    description: 'Home · Kitchen · Daily Needs',
    query: 'essentials',
    gradient: 'from-indigo-500 to-blue-600',
    lightGradient: 'from-indigo-50 to-blue-50',
    border: 'border-indigo-100 hover:border-indigo-300',
    tag: 'Must-Have',
    tagColor: 'bg-indigo-100 text-indigo-700',
  },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Authentic Products',    desc: '100% genuine brands',       color: 'text-emerald-600', bg: 'bg-emerald-50',  accent: 'border-emerald-100' },
  { icon: Truck,       label: 'Fast Delivery',         desc: 'Across Nepal in 2–3 days',  color: 'text-blue-600',    bg: 'bg-blue-50',      accent: 'border-blue-100' },
  { icon: RefreshCcw,  label: 'Easy Returns',          desc: '7-day hassle-free returns', color: 'text-violet-600',  bg: 'bg-violet-50',    accent: 'border-violet-100' },
  { icon: Star,        label: 'Top Rated',             desc: '4.8★ customer rating',      color: 'text-amber-600',   bg: 'bg-amber-50',     accent: 'border-amber-100' },
];

const POPULAR_SEARCHES = ['Sunscreen', 'Vitamin C Serum', 'Organic Tea', 'Running Shoes', 'Face Wash'];

const WHY_US = [
  { icon: BadgeCheck, title: '100% Authentic',     desc: 'Every product verified from authorized distributors.',         gradient: 'from-emerald-500 to-teal-500',    num: '01' },
  { icon: Zap,        title: 'Same-Day Dispatch',  desc: 'Orders before 2 PM shipped the same business day.',            gradient: 'from-amber-500 to-orange-500',    num: '02' },
  { icon: Package,    title: 'Premium Curation',   desc: 'Only the best beauty & wellness products on our shelves.',      gradient: 'from-violet-500 to-purple-500',   num: '03' },
  { icon: HeadphonesIcon, title: 'Dedicated Support', desc: '7-day support via phone, email, and live chat.',            gradient: 'from-blue-500 to-indigo-500',     num: '04' },
];

type NewsletterState = 'idle' | 'loading' | 'success' | 'already' | 'error';

export default function HomeContent({ brands, banners }: HomeContentProps) {
  const [newsletterEmail, setNewsletterEmail]   = useState('');
  const [newsletterState, setNewsletterState]   = useState<NewsletterState>('idle');
  const [newsletterMsg, setNewsletterMsg]       = useState('');
  const [searchQuery, setSearchQuery]           = useState('');
  const [featuredVendorsList, setFeaturedVendorsList] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 22 });
  const [flashDealsEnabled, setFlashDealsEnabled] = useState(true);
  const [flashDeals, setFlashDeals] = useState<any[]>([]);
  const [flashDealsTimeLeft, setFlashDealsTimeLeft] = useState<{ [key: string]: { hours: number; minutes: number; seconds: number } }>({});
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [offerBanners, setOfferBanners] = useState<any[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const { user } = useAuthStore();

  // Real-time updates hook
  const { latestUpdate } = useHomePageRealtime();

  // Refetch featured vendors on realtime update
  const refetchFeaturedVendors = useCallback(async () => {
    try {
      const res = await adminAPI.getFeaturedVendors();
      const vendors = res.data?.data || [];
      setFeaturedVendorsList(
        vendors.map((v: any) => ({
          id: v._id,
          name: `${v.firstName} ${v.lastName}`,
          slug: (v.email || '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          logo: v.vendorLogo,
          description: v.vendorDescription,
        })).slice(0, 8)
      );
    } catch {
      // keep existing list on error
    }
  }, []);

  // Refetch flash deals on realtime update
  const refetchFlashDeals = useCallback(async () => {
    try {
      const res = await flashDealsAPI.getActive();
      const deals = res.data?.data || [];
      setFlashDeals(deals);
      if (deals.length > 0) {
        const newTimeLeft: { [key: string]: { hours: number; minutes: number; seconds: number } } = {};
        deals.forEach((deal: any) => {
          const endTime = new Date(deal.endTime).getTime();
          const now = Date.now();
          const distance = endTime - now;
          if (distance > 0) {
            newTimeLeft[deal._id] = {
              hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
              minutes: Math.floor((distance / (1000 * 60)) % 60),
              seconds: Math.floor((distance / 1000) % 60),
            };
          }
        });
        setFlashDealsTimeLeft(newTimeLeft);
        setFlashDealsEnabled(deals.length > 0);
      }
    } catch {
      // keep existing deals on error
    }
  }, []);

  // Refetch offer banners on realtime update
  const refetchOfferBanners = useCallback(async () => {
    try {
      const res = await bannersAPI.getAll();
      const data = res.data?.data || res.data || [];
      setOfferBanners(data.filter((b: any) => b.image && b.isActive !== false).slice(0, 10));
    } catch {
      // keep existing banners on error
    }
  }, []);

  // Listen for realtime updates
  useEffect(() => {
    if (!latestUpdate) return;
    if (latestUpdate.type === 'featured-vendors' || latestUpdate.type === 'vendors') {
      refetchFeaturedVendors();
    } else if (latestUpdate.type === 'flash-deals') {
      refetchFlashDeals();
    } else if (latestUpdate.type === 'banners') {
      refetchOfferBanners();
    }
  }, [latestUpdate, refetchFeaturedVendors, refetchFlashDeals, refetchOfferBanners]);

  const vendorList  = useMemo(() => normalizeList<Brand>(brands), [brands]);
  const heroBanners = useMemo(() => normalizeList<Banner>(banners), [banners]);

  useEffect(() => {
    adminAPI.getFeaturedVendors().then((res) => {
      const vendors = res.data?.data || [];
      setFeaturedVendorsList(
        vendors.map((v: any) => ({
          id: v._id,
          name: `${v.firstName} ${v.lastName}`,
          slug: (v.email || '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          logo: v.vendorLogo,
          description: v.vendorDescription,
        })).slice(0, 8)
      );
    }).catch(() => setFeaturedVendorsList([]));
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)   return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const featuredVendors = featuredVendorsList.length > 0 ? featuredVendorsList : vendorList.slice(0, 6);
  const hasVendors = featuredVendors.length > 0;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newsletterState === 'loading') return;
    setNewsletterState('loading');
    try {
      const { data } = await newsletterAPI.subscribe(newsletterEmail, 'homepage');
      setNewsletterState(data.alreadySubscribed ? 'already' : 'success');
      setNewsletterMsg(data.message);
      setNewsletterEmail('');
    } catch (err: any) {
      setNewsletterState('error');
      setNewsletterMsg(err?.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        setLoadingDeals(true);
        const res = await flashDealsAPI.getActive();
        const deals = res.data?.data || [];
        setFlashDeals(deals);
        if (deals.length > 0) {
          const newTimeLeft: { [key: string]: { hours: number; minutes: number; seconds: number } } = {};
          deals.forEach((deal: any) => {
            const endTime = new Date(deal.endTime).getTime();
            const now = new Date().getTime();
            const distance = endTime - now;
            if (distance > 0) {
              newTimeLeft[deal._id] = {
                hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((distance / (1000 * 60)) % 60),
                seconds: Math.floor((distance / 1000) % 60),
              };
            }
          });
          setFlashDealsTimeLeft(newTimeLeft);
          setFlashDealsEnabled(deals.length > 0);
        }
      } catch {
        setFlashDeals([]);
        setFlashDealsEnabled(false);
      } finally {
        setLoadingDeals(false);
      }
    };
    fetchFlashDeals();
    const interval = setInterval(fetchFlashDeals, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (flashDeals.length === 0) return;
    const timer = setInterval(() => {
      setFlashDealsTimeLeft((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          const t = next[id];
          if (t.seconds > 0)      next[id] = { ...t, seconds: t.seconds - 1 };
          else if (t.minutes > 0) next[id] = { ...t, minutes: t.minutes - 1, seconds: 59 };
          else if (t.hours > 0)   next[id] = { ...t, hours: t.hours - 1, minutes: 59, seconds: 59 };
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [flashDeals]);

  useEffect(() => {
    const fetchOfferBanners = async () => {
      try {
        setLoadingOffers(true);
        const res = await bannersAPI.getAll();
        const banners = res.data?.data || res.data || [];
        setOfferBanners(banners.filter((b: any) => b.image && b.isActive !== false).slice(0, 10));
      } catch {
        setOfferBanners([]);
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchOfferBanners();
    const interval = setInterval(fetchOfferBanners, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ─── ANNOUNCEMENT BAR ─── */}
      <div className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 py-2.5 text-center">
        <p className="text-xs font-semibold text-white/95 tracking-wide">
          Free delivery on orders above{' '}
          <span className="font-black text-white">NPR 2,999</span>
          <span className="mx-2.5 text-white/30">|</span>
          Authentic products, guaranteed
          <span className="mx-2.5 text-white/30">|</span>
          <Link href="/products" className="underline underline-offset-2 hover:text-primary-200 transition-colors">
            Shop Now →
          </Link>
        </p>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-secondary-950">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
          <div className="absolute -right-24 top-1/2 h-80 w-80 rounded-full bg-secondary-600/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent-600/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
          />
        </div>

        <div className="container relative z-10 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* ── Left ── */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-7"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-400/25 bg-primary-500/10 px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary-300">
                  Nepal&apos;s Premium Marketplace
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-4xl font-bold text-white leading-[1.15] sm:text-5xl lg:text-6xl">
                Discover{' '}
                <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-accent-400 bg-clip-text text-transparent">
                  Premium
                </span>
                <br />
                Products,{' '}
                <span className="relative">
                  Curated
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-transparent opacity-60" />
                </span>
                <br />
                For You.
              </h1>

              <p className="text-base text-gray-300/80 max-w-md leading-relaxed sm:text-lg">
                Beauty, wellness &amp; lifestyle products from trusted brands —
                delivered fast across Nepal.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex max-w-lg gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search products, brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-4 py-3.5 text-sm text-white placeholder-white/35 backdrop-blur-sm transition focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-primary-700 hover:to-primary-600 hover:shadow-primary-500/25 hover:shadow-xl"
                >
                  Search
                </button>
              </form>

              {/* Popular searches */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-white/35">Popular:</span>
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => router.push(`/products?search=${encodeURIComponent(term)}`)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60 transition hover:border-white/20 hover:bg-white/10 hover:text-white/80"
                  >
                    {term}
                  </button>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link href="/products">
                  <Button variant="primary" size="lg" className="gap-2 shadow-colored-md">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/vendors">
                  <Button variant="white" size="lg">
                    Browse Vendors
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2">
                {[
                  { value: '1K+', label: 'Products' },
                  { value: '50+', label: 'Brands' },
                  { value: '1K+', label: 'Happy Customers' },
                ].map(({ value, label }, i) => (
                  <div key={label} className="flex items-center gap-3">
                    {i > 0 && <div className="h-6 w-px bg-white/10" />}
                    <div>
                      <p className="text-2xl font-black text-white leading-none">{value}</p>
                      <p className="text-[11px] font-medium text-white/40 mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Right — banner or category showcase ── */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[500px] rounded-3xl overflow-hidden border border-white/8 shadow-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center">
                {/* Logo */}
                <div className="mb-6 relative w-32 h-32">
                  <Image 
                    src="/logo.png" 
                    alt="Glovia Logo" 
                    fill 
                    sizes="128px"
                    className="object-contain"
                  />
                </div>
                
                {/* Branding */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent mb-1">GLOVIA</h3>
                  <p className="text-sm font-semibold text-amber-900/70 tracking-widest uppercase mb-4">Market place</p>
                  
                  {/* Promotional badge */}
                  <div className="inline-block rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2 mb-6 shadow-lg">
                    <p className="text-xs font-bold text-primary-100 uppercase tracking-widest">Free Delivery</p>
                    <p className="text-lg font-black text-white">On Orders of Rs. 2,999+</p>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-amber-800 max-w-56 leading-relaxed mb-6">
                    Best-Selling Market Place which delivered Every Product to Your Doorstep
                  </p>
                  
                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-3 text-[10px] text-amber-700 font-semibold">
                    <span>✓ Free Delivery</span>
                    <span className="text-amber-400">•</span>
                    <span>Trusted Brands</span>
                    <span className="text-amber-400">•</span>
                    <span>100% Authentic</span>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Link href="/products">
                  <button className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl">
                    Shop Now →
                  </button>
                </Link>

                {/* Free delivery badge */}
                <div className="absolute -right-3 top-8 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-3 shadow-xl shadow-primary-900/40 border border-primary-500/30">
                  <p className="text-[10px] font-bold text-primary-200/80 uppercase tracking-widest">Free Delivery</p>
                  <p className="text-sm font-black text-white">Above NPR 2,999</p>
                </div>

                {/* Rating badge */}
                <div className="absolute -left-3 bottom-12 rounded-2xl bg-white/10 backdrop-blur-md px-4 py-3 border border-white/15 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                    </div>
                    <span className="text-xs font-bold text-white">4.8 / 5</span>
                  </div>
                  <p className="text-[10px] text-white/50 mt-0.5">Based on 50K+ reviews</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BADGES ─── */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 dark:divide-gray-800">
            {TRUST_BADGES.map(({ icon: Icon, label, desc, color, bg, accent }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg} border ${accent}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="container py-16 sm:py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
                Shop by Category
              </p>
              <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                Browse Categories
              </h2>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Everything you need, all in one place
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Category Grid — 2 cols on mobile, 3 on sm, 5 on lg */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.slug} variants={fadeUp}>
                <Link
                  href={`/products?category=${cat.query}`}
                  className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-gray-900"
                >
                  {/* Gradient header */}
                  <div className={`w-full bg-gradient-to-br ${cat.lightGradient} dark:from-gray-800 dark:to-gray-800 pt-7 pb-5 flex flex-col items-center`}>
                    <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-3xl shadow-lg`}>
                      {cat.emoji}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${cat.tagColor}`}>
                      {cat.tag}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="px-4 py-4 w-full">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                      {cat.label}
                    </h3>
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className={`mt-3 flex items-center justify-center gap-1 text-xs font-bold bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent`}>
                      Shop now <ArrowRight className="h-3 w-3 text-current opacity-70" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeIn} className="mt-5 flex justify-center sm:hidden">
            <Link
              href="/products"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400"
            >
              View All Categories <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FLASH DEALS ─── */}
      {flashDealsEnabled && flashDeals.length > 0 && (
        <section className="bg-gradient-to-br from-red-950 via-orange-950 to-red-950 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-16 sm:py-20">
          <div className="container">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between flex-wrap gap-5">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-500/15 border border-red-400/20 px-3.5 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">Live Deals</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                  Flash Deals &amp; Best Offers
                </h2>
                <p className="mt-1.5 text-sm text-white/50">Today&apos;s hottest prices — ending soon</p>
              </div>

              {flashDeals.length > 0 && flashDealsTimeLeft[flashDeals[0]._id] && (
                <div className="flex items-center gap-1.5">
                  {[
                    { val: flashDealsTimeLeft[flashDeals[0]._id].hours,   label: 'HRS' },
                    { val: flashDealsTimeLeft[flashDeals[0]._id].minutes, label: 'MIN' },
                    { val: flashDealsTimeLeft[flashDeals[0]._id].seconds, label: 'SEC' },
                  ].map(({ val, label }, i) => (
                    <div key={label} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-red-500/60 font-bold text-xl mb-3">:</span>}
                      <div className="flex flex-col items-center rounded-xl bg-red-600 px-3.5 py-2.5 min-w-[52px] shadow-lg shadow-red-900/50">
                        <span className="text-2xl font-black text-white leading-none tabular-nums">{pad(val)}</span>
                        <span className="text-[9px] font-bold text-red-200/70 mt-1 tracking-widest">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deal cards */}
            {loadingDeals ? (
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-52 flex-shrink-0 h-72 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto pb-3 -mx-4 px-4">
                <div className="flex gap-4" style={{ width: 'max-content' }}>
                  {flashDeals.flatMap((deal: any) =>
                    deal.products.map((product: any, idx: number) => (
                      <div
                        key={`${deal._id}-${idx}`}
                        className="w-52 flex-shrink-0 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/8 overflow-hidden group hover:bg-white/8 transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* Image */}
                        <div className="relative h-36 overflow-hidden bg-white/5">
                          {product.images?.[0]?.url || product.productImage ? (
                            <img
                              src={product.images?.[0]?.url || product.productImage}
                              alt={product.productName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                          )}
                          {product.discountPercentage && (
                            <div className="absolute top-2.5 left-2.5 rounded-lg bg-red-500 px-2 py-1">
                              <span className="text-xs font-black text-white">-{product.discountPercentage}%</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/80 mb-1">Flash Deal</p>
                          <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                            {product.productName}
                          </h4>

                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-lg font-black text-white">
                              ₹{product.salePrice?.toLocaleString()}
                            </span>
                            <span className="text-xs text-white/35 line-through">
                              ₹{product.originalPrice?.toLocaleString()}
                            </span>
                          </div>

                          {/* Mini timer */}
                          {flashDealsTimeLeft[deal._id] && (
                            <div className="mt-2 flex items-center gap-1 text-xs font-bold text-orange-400">
                              <Zap className="h-3 w-3" />
                              {pad(flashDealsTimeLeft[deal._id].hours)}:
                              {pad(flashDealsTimeLeft[deal._id].minutes)}:
                              {pad(flashDealsTimeLeft[deal._id].seconds)}
                            </div>
                          )}

                          <Link href="/products" className="block mt-3">
                            <button className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 py-2 text-xs font-bold text-white transition-all shadow-sm hover:shadow-red-500/30 hover:shadow-lg">
                              Buy Now
                            </button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <Link href="/products?flash-deals=true">
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 backdrop-blur-sm px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/12 hover:border-white/25">
                  View All Flash Deals <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── AI RECOMMENDATIONS ─── */}
      <section className="container py-16 sm:py-20">
        <Recommendations />
      </section>

      {/* ─── PROMOTIONAL BANNERS ─── */}
      {offerBanners.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800 py-14 sm:py-16">
          <div className="container">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
                  Limited Time
                </p>
                <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                  Special Offers
                </h2>
              </div>
              {offerBanners.length > 1 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                  {offerBanners.length} live offers
                </span>
              )}
            </div>

            {loadingOffers ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-52 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto pb-3 -mx-4 px-4">
                <div className="flex gap-4" style={{ width: 'max-content' }}>
                  {offerBanners.map((banner: any, idx: number) => (
                    <motion.div
                      key={banner._id || idx}
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                      viewport={{ once: true }}
                      className="w-80 flex-shrink-0"
                    >
                      <div className="group relative h-52 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 cursor-pointer bg-gray-100 dark:bg-gray-800">
                        {banner.image && (
                          <img
                            src={banner.image}
                            alt={banner.title || 'Special Offer'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                        <div className="absolute top-3 right-3 rounded-full bg-primary-600 px-3 py-1 text-[10px] font-black text-white uppercase tracking-wide shadow">
                          Offer
                        </div>
                        {banner.title && (
                          <div className="absolute inset-x-0 bottom-0 p-4">
                            <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                              {banner.title}
                            </h3>
                            {banner.description && (
                              <p className="text-xs text-white/65 mt-1 line-clamp-1">
                                {banner.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── FEATURED VENDORS ─── */}
      <section className="container py-16 sm:py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          <motion.div variants={fadeUp} className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
                Handpicked for Quality
              </p>
              <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                Featured Vendors
              </h2>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Trusted sellers, verified by our team
              </p>
            </div>
            <Link
              href="/vendors"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
            >
              All Vendors <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {hasVendors ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {featuredVendors.slice(0, 6).map((vendor, idx) => (
                <motion.div key={vendor.id || idx} variants={fadeUp}>
                  <Link
                    href={`/vendors/${vendor.slug}`}
                    className="group flex flex-col items-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg"
                  >
                    <div className="relative mb-3.5 h-16 w-16 overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                      {vendor.logo ? (
                        <VendorImage 
                          src={vendor.logo} 
                          name={vendor.name} 
                          initial={vendor.name.charAt(0).toUpperCase()}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/40 dark:to-secondary-900/40 text-xl font-black text-primary-700 dark:text-primary-400">
                          {vendor.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-sm">
                        <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                      {vendor.name}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 px-2.5 py-0.5">
                      <Award className="h-3 w-3 text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Verified</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 animate-pulse">
                  <div className="mb-3.5 h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800" />
                  <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="mt-2 h-2.5 w-14 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ─── WHY GLOVIA ─── */}
      <section className="bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-gray-800 py-16 sm:py-20">
        <div className="container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <motion.div variants={fadeUp} className="mb-12 text-center max-w-xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">
                Why Choose Us
              </p>
              <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                The Glovia Difference
              </h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                We hold ourselves to the highest standards so you get the best shopping experience in Nepal.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {WHY_US.map(({ icon: Icon, title, desc, gradient, num }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="group relative rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl overflow-hidden"
                >
                  {/* Background number */}
                  <span className="pointer-events-none absolute -right-2 -top-3 font-black text-7xl text-gray-50 dark:text-gray-800 select-none leading-none">
                    {num}
                  </span>

                  <div className={`relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="relative text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {title}
                  </h3>
                  <p className="relative text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TRACK YOUR ORDER ─── */}
      <section className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-y border-blue-100 dark:border-blue-900/40 py-12 sm:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left - Info */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                    Track Your Order
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Real-time updates on your purchase
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-md">
                Enter your order ID to track your shipment status, estimated delivery date, and package location. Updates sent via email and SMS.
              </p>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Live Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>SMS Alerts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Instant Support</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-gray-900 shadow-sm p-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Order ID
                </label>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const orderId = (e.currentTarget.elements.namedItem('orderId') as HTMLInputElement)?.value;
                  if (orderId) {
                    router.push(`/track-order?id=${encodeURIComponent(orderId)}`);
                  }
                }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="orderId"
                      placeholder="e.g., ORD-2024-001234"
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
                    >
                      Track
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    You can find your Order ID in your confirmation email or account orders page
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="container py-16 sm:py-20">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 p-8 sm:p-12 shadow-2xl"
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-500/12 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-secondary-500/12 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 bottom-0 h-40 w-40 rounded-full bg-accent-500/8 blur-2xl" />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Left copy */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/10 px-3.5 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                <span className="text-xs font-bold text-white/70">Glovia Rewards</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-white leading-tight sm:text-3xl">
                Get exclusive deals &amp;<br />first-buyer offers
              </h3>
              <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-sm">
                Subscribe for loyalty point updates, referral bonuses, and flash sale alerts delivered straight to your inbox.
              </p>

              {/* Benefits */}
              <div className="mt-6 flex flex-wrap gap-4">
                {['No spam, ever', 'Unsubscribe anytime', 'Weekly deals'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-xs text-white/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                    {item}
                  </span>
                ))}
              </div>

              {/* Social proof */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['👩', '👨', '🧑', '👩'].map((emoji, i) => (
                    <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-secondary-900 bg-gradient-to-br from-primary-100 to-secondary-100 text-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-white/80">12,0+ subscribers</p>
                  <p className="text-[10px] text-white/35">Already getting deals</p>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div>
              {newsletterState === 'success' || newsletterState === 'already' ? (
                <div className={`rounded-2xl border px-6 py-6 ${
                  newsletterState === 'already'
                    ? 'border-amber-400/30 bg-amber-400/10'
                    : 'border-emerald-400/30 bg-emerald-400/10'
                }`}>
                  <div className={`mb-2 text-2xl ${newsletterState === 'already' ? '' : ''}`}>
                    {newsletterState === 'already' ? '👋' : '🎉'}
                  </div>
                  <p className={`text-sm font-bold ${newsletterState === 'already' ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {newsletterMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setNewsletterState('idle'); setNewsletterMsg(''); }}
                    className="mt-3 text-xs text-white/40 underline underline-offset-2 hover:text-white/70 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-1.5">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        disabled={newsletterState === 'loading'}
                        required
                        className="flex-1 rounded-xl bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={newsletterState === 'loading'}
                        className="shrink-0 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:from-primary-700 hover:to-primary-600 disabled:opacity-60 hover:shadow-primary-500/30"
                      >
                        {newsletterState === 'loading' ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white inline-block" />
                        ) : (
                          'Subscribe'
                        )}
                      </button>
                    </div>
                  </div>
                  {newsletterState === 'error' && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      {newsletterMsg}
                    </p>
                  )}
                  <p className="text-[11px] text-white/30 leading-relaxed">
                    By subscribing you agree to receive marketing emails from Glovia. You can unsubscribe at any time.
                  </p>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
