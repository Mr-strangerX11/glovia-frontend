"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Search, ShoppingCart, Heart, User, Menu, X, Moon, Sun,
  Store, Home, ChevronDown, Sparkles, Package,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/hooks/useData';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const MAIN_CATEGORIES = [
  {
    slug: 'beauty',
    label: 'Beauty',
    emoji: '💄',
    query: 'skincare',
    subcategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrance', 'Body Care'],
    color: 'from-rose-400 to-pink-500',
  },
  {
    slug: 'pharmacy',
    label: 'Pharmacy',
    emoji: '💊',
    query: 'pharmacy',
    subcategories: ['Medications', 'Supplements', 'Vitamins', 'Wellness', 'First Aid'],
    color: 'from-emerald-400 to-teal-500',
  },
  {
    slug: 'groceries',
    label: 'Groceries',
    emoji: '🛒',
    query: 'groceries',
    subcategories: ['Food & Beverages', 'Pantry', 'Dairy & Eggs', 'Fresh Produce', 'Snacks'],
    color: 'from-amber-400 to-orange-500',
  },
  {
    slug: 'clothes-shoes',
    label: 'Clothes & Shoes',
    emoji: '👕',
    query: 'clothing',
    subcategories: ["Men's Fashion", "Women's Fashion", "Kids' Clothing", 'Footwear', 'Accessories'],
    color: 'from-violet-400 to-purple-500',
  },
  {
    slug: 'essentials',
    label: 'Essentials',
    emoji: '🏠',
    query: 'essentials',
    subcategories: ['Home & Kitchen', 'Personal Care', 'Tools & Accessories', 'Daily Needs', 'Office Supplies'],
    color: 'from-indigo-400 to-blue-500',
  },
] as const;

type MainCategorySlug = typeof MAIN_CATEGORIES[number]['slug'];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [desktopCatalogOpen, setDesktopCatalogOpen] = useState(false);
  const [activeDesktopCategory, setActiveDesktopCategory] = useState<MainCategorySlug>('beauty');
  const [activeMobileCategory, setActiveMobileCategory] = useState<MainCategorySlug | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const labels = useMemo(() => ({
    topBarPromo:      'Free delivery over NPR 2,999 · Nepal\'s Premium Marketplace',
    sellerDashboard:  'Seller Dashboard',
    trackOrder:       'Track Order',
    about:            'About',
    signIn:           'Sign In',
    dashboard:        'Dashboard',
    myAccount:        'My Account',
    orders:           'Orders',
    addresses:        'Addresses',
    logout:           'Logout',
    home:             'Home',
    vendors:          'Vendors',
    cart:             'Cart',
    account:          'Account',
    searchPlaceholder: 'Search for products...',
  }), []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);



  const toggleDark = () => {
    if (typeof window === 'undefined') return;
    const html = document.documentElement;
    const next = !html.classList.contains('dark');
    html.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      const dark = theme === 'dark';
      document.documentElement.classList.toggle('dark', dark);
      setIsDark(dark);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchSuggestions([]); return; }
    const q = searchQuery.toLowerCase();
    const suggestions: string[] = [];
    MAIN_CATEGORIES.forEach((cat) => {
      if (cat.label.toLowerCase().includes(q)) suggestions.push(cat.label);
      cat.subcategories.forEach((sub) => {
        if (sub.toLowerCase().includes(q)) suggestions.push(sub);
      });
    });
    setSearchSuggestions([...new Set(suggestions)].slice(0, 6));
  }, [searchQuery]);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname || '/';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/products?search=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const isRouteActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const activeCategory = MAIN_CATEGORIES.find((c) => c.slug === activeDesktopCategory)!;

  return (
    <header className={`sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/80 transition-shadow duration-300 ${scrolled ? 'shadow-elevation-2' : ''}`}>

      {/* ─── Top Bar ─── */}
      <div className="bg-gradient-to-r from-secondary-950 via-secondary-900 to-secondary-950 py-2">
        <div className="container">
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
            <p className="truncate text-white/80">{labels.topBarPromo}</p>
            <div className="hidden items-center gap-3 md:flex">
              <Link href="/dashboard/vendor" className="inline-flex items-center gap-1.5 text-white/70 transition hover:text-white">
                <Store className="h-3.5 w-3.5" /> {labels.sellerDashboard}
              </Link>
              <Link href="/track-order" className="text-white/70 transition hover:text-white">{labels.trackOrder}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Header ─── */}
      <div className="container py-3">
        <div className="flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-xl font-black tracking-tight text-transparent transition-opacity group-hover:opacity-80 sm:text-2xl">
              Glovia
            </span>
            <span className="ml-1 hidden text-xs font-semibold text-gray-400 dark:text-gray-600 sm:inline">Marketplace</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {MAIN_CATEGORIES.map((category) => (
              <button
                key={category.slug}
                type="button"
                onMouseEnter={() => { setActiveDesktopCategory(category.slug); setDesktopCatalogOpen(true); }}
                onClick={() => {
                  if (activeDesktopCategory === category.slug) {
                    setDesktopCatalogOpen((prev) => !prev);
                  } else {
                    setActiveDesktopCategory(category.slug);
                    setDesktopCatalogOpen(true);
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150 ${
                  desktopCatalogOpen && activeDesktopCategory === category.slug
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                <span className="text-base">{category.emoji}</span>
                {category.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${desktopCatalogOpen && activeDesktopCategory === category.slug ? 'rotate-180' : ''}`} />
              </button>
            ))}
            <Link
              href="/vendors"
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150 ${
                isRouteActive('/vendors')
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
            >
              <Store className="h-4 w-4" />
              {labels.vendors}
            </Link>
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="btn-icon h-9 w-9 text-gray-500 dark:text-gray-400"
              aria-label="Toggle dark mode"
            >
              {isDark
                ? <Sun className="h-5 w-5" />
                : <Moon className="h-5 w-5" />
              }
            </button>

            {/* Search */}
            <button
              onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100); }}
              className="btn-icon h-9 w-9 text-gray-500 dark:text-gray-400"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist — desktop */}
            <Link
              href="/wishlist"
              className="btn-icon hidden h-9 w-9 text-gray-500 dark:text-gray-400 sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="btn-icon relative h-9 w-9 text-gray-500 dark:text-gray-400"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white shadow ring-2 ring-white dark:ring-gray-950">
                  {cart.itemCount > 9 ? '9+' : cart.itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative group">
                <button
                  className="btn-icon h-9 w-9 text-gray-500 dark:text-gray-400"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </button>
                <div className="invisible absolute right-0 top-full mt-2 w-52 rounded-2xl border border-gray-100 bg-white py-2 opacity-0 shadow-float transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-900">
                  {/* User info */}
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  {[
                    { href: '/dashboard',         label: labels.dashboard },
                    { href: '/account',           label: labels.myAccount },
                    { href: '/account/orders',    label: labels.orders },
                    { href: '/account/addresses', label: labels.addresses },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {labels.logout}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-1 hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-primary-700 hover:to-primary-600 hover:shadow sm:block"
              >
                {labels.signIn}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-icon h-9 w-9 text-gray-500 dark:text-gray-400 lg:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ─── Search Bar ─── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <form className="relative mt-3" onSubmit={handleSearch}>
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  name="search"
                  placeholder={labels.searchPlaceholder}
                  className="input pl-10 pr-24"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-primary-700 shadow-sm"
                >
                  Search
                </button>
              </form>

              {searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-float dark:border-gray-800 dark:bg-gray-900"
                >
                  <p className="border-b border-gray-100 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-gray-800">
                    Suggestions
                  </p>
                  {searchSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-primary-50 dark:text-gray-200 dark:hover:bg-gray-800"
                      onClick={() => { router.push(`/products?search=${encodeURIComponent(s)}`); setSearchOpen(false); setSearchQuery(''); }}
                    >
                      <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" /> {s}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-600 transition hover:bg-primary-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      onClick={() => { router.push('/vendors'); setSearchOpen(false); setSearchQuery(''); }}
                    >
                      <Store className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                      Browse all vendors for &ldquo;{searchQuery}&rdquo;
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Desktop Category Megamenu ─── */}
      <AnimatePresence>
        {desktopCatalogOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseLeave={() => setDesktopCatalogOpen(false)}
            className="hidden border-t border-gray-100/80 bg-white/98 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/98 lg:block"
          >
            <div className="container py-5">
              {/* Category tabs */}
              <div className="mb-5 flex gap-2">
                {MAIN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onMouseEnter={() => setActiveDesktopCategory(cat.slug)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                      activeDesktopCategory === cat.slug
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-sm'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>

              {/* Subcategory pills + CTA */}
              <div className="flex items-start justify-between gap-8">
                <div className="flex flex-wrap gap-2">
                  {activeCategory.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      href={`/products?category=${activeCategory.query}&search=${encodeURIComponent(sub)}`}
                      onClick={() => setDesktopCatalogOpen(false)}
                      className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
                <div className="flex-shrink-0 space-y-2 text-right">
                  <Link
                    href={`/products?category=${activeCategory.query}`}
                    onClick={() => setDesktopCatalogOpen(false)}
                    className="block text-sm font-bold text-primary-700 hover:text-primary-800 dark:text-primary-400"
                  >
                    View all {activeCategory.label} →
                  </Link>
                  <Link
                    href="/vendors"
                    onClick={() => setDesktopCatalogOpen(false)}
                    className="block text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400"
                  >
                    Browse vendors
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile Sidebar ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed left-0 top-0 z-[60] h-[100dvh] w-[88%] max-w-sm overflow-y-auto border-r border-gray-200 bg-white pb-28 dark:border-gray-800 dark:bg-gray-950 shadow-float"
            >
              {/* Sidebar header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-950">
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-xl font-black text-transparent">
                  Glovia
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-icon h-8 w-8 text-gray-500"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-2 p-4">
                {MAIN_CATEGORIES.map((cat) => {
                  const isOpen = activeMobileCategory === cat.slug;
                  return (
                    <div key={cat.slug} className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
                      <button
                        type="button"
                        onClick={() => setActiveMobileCategory((prev) => (prev === cat.slug ? null : cat.slug))}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-800 transition hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-lg">{cat.emoji}</span> {cat.label}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-gray-100 bg-gray-50/60 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/60"
                          >
                            <Link
                              href={`/products?category=${cat.query}`}
                              className="mb-2.5 block rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-3 py-2 text-xs font-bold text-white shadow-sm"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              View all {cat.label} →
                            </Link>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.subcategories.map((sub) => (
                                <Link
                                  key={sub}
                                  href={`/products?category=${cat.query}&search=${encodeURIComponent(sub)}`}
                                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {sub}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <Link
                  href="/vendors"
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Store className="h-4 w-4 text-primary-600" /> {labels.vendors}
                </Link>

                <Link
                  href="/about"
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="h-4 w-4 text-primary-600" /> About
                </Link>



                <Link
                  href="/dashboard/vendor"
                  className="flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 dark:border-primary-900/40 dark:bg-primary-900/20 dark:text-primary-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-4 w-4" /> {labels.sellerDashboard}
                </Link>

                {!isAuthenticated && (
                  <Link
                    href="/auth/login"
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 text-sm font-bold text-white shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" /> {labels.signIn}
                  </Link>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200/60 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden dark:bg-gray-950/95 dark:border-gray-800/80">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-1.5">
          {[
            { href: '/',           icon: Home,         label: labels.home },
            { href: '/vendors',    icon: Store,        label: labels.vendors },
            { href: '/cart',       icon: ShoppingCart, label: labels.cart },
            { href: isAuthenticated ? '/account' : '/auth/login', icon: User, label: labels.account },
          ].map(({ href, icon: Icon, label }) => {
            const active = isRouteActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-all ${
                  active
                    ? 'text-primary-700 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-500'
                }`}
              >
                {active && (
                  <span className="absolute top-1 h-1 w-6 rounded-full bg-primary-500" />
                )}
                <Icon className={`h-[22px] w-[22px] ${active ? 'stroke-[2.5px]' : ''}`} />
                {label}
                {href === '/cart' && cart && cart.itemCount > 0 && (
                  <span className="absolute right-3 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-bold text-white ring-1 ring-white dark:ring-gray-950">
                    {cart.itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
