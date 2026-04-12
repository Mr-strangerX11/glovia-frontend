import Link from 'next/link';
import {
  ShieldCheck, Truck, Star, Users, Award, Heart,
  MapPin, Phone, Mail, ArrowRight, Sparkles, Package,
  TrendingUp, Globe,
} from 'lucide-react';

const STATS = [
  { value: '10,000+', label: 'Products', icon: Package },
  { value: '500+',    label: 'Brands',   icon: Award },
  { value: '50,000+', label: 'Customers', icon: Users },
  { value: '4.8★',   label: 'Avg Rating', icon: Star },
];

const VALUES = [
  {
    icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50',
    title: 'Authenticity',
    desc: 'Every product on Glovia is sourced from authorized distributors. We guarantee 100% genuine items — no fakes, no compromises.',
  },
  {
    icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50',
    title: 'Fast Delivery',
    desc: 'Orders placed before 2 PM are dispatched same day. We deliver across Nepal within 2–5 business days.',
  },
  {
    icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50',
    title: 'Made for Nepal',
    desc: 'Our curated selection is tailored to Nepali skin types, climate, and preferences — beauty that truly fits.',
  },
  {
    icon: Globe, color: 'text-violet-600', bg: 'bg-violet-50',
    title: 'Community First',
    desc: 'We empower local vendors and support Nepali entrepreneurs by giving them a platform to grow.',
  },
];

const TEAM = [
  { name: 'Aarav Sharma',   role: 'Co-Founder & CEO',      avatar: 'A' },
  { name: 'Priya Thapa',    role: 'Head of Curation',       avatar: 'P' },
  { name: 'Rajan Karki',    role: 'Technology Lead',        avatar: 'R' },
  { name: 'Sita Adhikari',  role: 'Customer Experience',    avatar: 'S' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 pt-16 pb-24">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/8 blur-2xl" />
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Our Story
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight sm:text-5xl">
              Nepal&apos;s Premier<br />Beauty Marketplace
            </h1>
            <p className="mt-4 text-lg text-pink-100/90 leading-relaxed max-w-xl">
              Born in Kathmandu, Glovia is on a mission to make premium beauty and wellness products accessible to every Nepali — authentic, affordable, and delivered fast.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-rose-600 shadow-lg transition hover:bg-rose-50">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="container -mt-10 pb-0 relative z-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-elevation-2 dark:bg-gray-900 dark:border-gray-800">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
                <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{value}</p>
              <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Mission ─── */}
      <section className="container py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">Our Mission</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Bringing the best of beauty to every corner of Nepal
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              We started Glovia with a simple belief: every person in Nepal deserves access to authentic, high-quality beauty and wellness products without the fear of counterfeits or inflated prices.
            </p>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              From Kathmandu to Pokhara, Biratnagar to Butwal — we&apos;re building Nepal&apos;s most trusted marketplace, one delivery at a time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Certified Authentic', 'Nepal-wide Delivery', 'Customer-first'].map((tag) => (
                <span key={tag} className="rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-700 dark:border-primary-800/50 dark:bg-primary-900/20 dark:text-primary-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {VALUES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft dark:bg-gray-900 dark:border-gray-800">
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${bg} dark:bg-opacity-10`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Team ─── */}
      <section className="bg-gray-50/80 dark:bg-gray-900/40 py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-2">The People</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Meet the Team</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              A passionate group of Nepalis building the future of beauty commerce.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {TEAM.map(({ name, role, avatar }) => (
              <div key={name} className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-soft dark:bg-gray-900 dark:border-gray-800">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 text-2xl font-black text-primary-700 dark:from-primary-900/30 dark:to-secondary-900/30 dark:text-primary-400">
                  {avatar}
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{name}</h3>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Journey timeline ─── */}
      <section className="container py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-2">Our Journey</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Milestones</h2>
        </div>
        <div className="relative mx-auto max-w-2xl">
          {/* Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary-300 via-primary-200 to-transparent dark:from-primary-700 dark:via-primary-800" />
          <div className="space-y-8 pl-12">
            {[
              { year: '2023', title: 'Founded',       desc: 'Glovia launched in Kathmandu with 50 products.' },
              { year: '2024', title: 'Rapid Growth',  desc: 'Expanded to 500+ brands, serving 10,000+ customers.' },
              { year: '2025', title: 'Nationwide',    desc: 'Delivery coverage across all 77 districts of Nepal.' },
              { year: 'Now',  title: 'The Future',    desc: 'Building the most trusted beauty platform in Nepal.' },
            ].map(({ year, title, desc }) => (
              <div key={year} className="relative">
                <div className="absolute -left-[2.65rem] flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-primary-600 to-primary-500 shadow dark:border-gray-950">
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">{year}</p>
                <h3 className="mt-0.5 text-base font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="container pb-16">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 p-10 text-center shadow-elevation-4">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Ready to explore?</h2>
          <p className="mt-2 text-white/60 text-sm">Thousands of authentic products waiting for you.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-7 py-3 text-sm font-bold text-white shadow transition hover:from-primary-700 hover:to-primary-600">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
