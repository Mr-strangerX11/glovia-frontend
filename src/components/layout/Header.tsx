"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingCart, Heart, User, Menu, X, Moon, Sun, Store, Globe, Home, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/hooks/useData';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GLOVIA_MAIN_CATEGORIES,
  GLOVIA_SUBCATEGORY_GROUPS,
  type MainCategorySlug,
} from '@/data/beautyCatalog';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'EN' | 'NP'>('EN');
  const [dark, setDark] = useState(false);
  const [desktopCatalogOpen, setDesktopCatalogOpen] = useState(false);
  const [activeDesktopCategory, setActiveDesktopCategory] = useState<MainCategorySlug>('skincare');
  const [activeMobileCategory, setActiveMobileCategory] = useState<MainCategorySlug | null>(null);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'EN' ? 'NP' : 'EN';
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', next);
        document.documentElement.lang = next === 'NP' ? 'ne' : 'en';
        window.dispatchEvent(new Event('app-language-change'));
      }
      return next;
    });
  };

  const labels = useMemo(
    () =>
      language === 'EN'
        ? {
            topBarPromo: '✨ Free delivery over NPR 2,999 • Premium Marketplace for Nepal',
            sellerDashboard: 'Seller Dashboard',
            trackOrder: 'Track Order',
            beautyTips: 'Beauty Tips',
            about: 'About',
            signIn: 'Sign In',
            dashboard: 'Dashboard',
            myAccount: 'My Account',
            orders: 'Orders',
            addresses: 'Addresses',
            logout: 'Logout',
            browseCategories: 'Browse Categories',
            viewAll: 'View all',
            home: 'Home',
            categories: 'Categories',
            cart: 'Cart',
            account: 'Account',
            searchPlaceholder: 'Search for products...',
          }
        : {
            topBarPromo: '✨ NPR 2,999 भन्दा माथि निःशुल्क डेलिभरी • नेपालका लागि प्रिमियम मार्केटप्लेस',
            sellerDashboard: 'बिक्रेता ड्यासबोर्ड',
            trackOrder: 'अर्डर ट्र्याक गर्नुहोस्',
            beautyTips: 'सौन्दर्य सुझाव',
            about: 'हाम्रो बारेमा',
            signIn: 'साइन इन',
            dashboard: 'ड्यासबोर्ड',
            myAccount: 'मेरो खाता',
            orders: 'अर्डरहरू',
            addresses: 'ठेगानाहरू',
            logout: 'लगआउट',
            browseCategories: 'कोटीहरू ब्राउज गर्नुहोस्',
            viewAll: 'सबै हेर्नुहोस्',
            home: 'होम',
            categories: 'कोटीहरू',
            cart: 'कार्ट',
            account: 'खाता',
            searchPlaceholder: 'उत्पादन खोज्नुहोस्...',
          },
    [language]
  );

  const toggleDark = () => {
    if (typeof window === 'undefined') return;
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      setDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage === 'EN' || savedLanguage === 'NP') {
        setLanguage(savedLanguage);
        document.documentElement.lang = savedLanguage === 'NP' ? 'ne' : 'en';
        window.dispatchEvent(new Event('app-language-change'));
      }
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        setDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        setDark(false);
      }
    }
  }, []);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname || '/';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const categories = useMemo(
    () => [
      { name: 'Skincare', href: '/products?category=skincare' },
      { name: 'Haircare', href: '/products?category=haircare' },
      { name: 'Makeup', href: '/products?category=makeup' },
      { name: 'Organic', href: '/products?category=organic-natural' },
    ],
    []
  );

  const desktopNavCategories: Array<{ label: string; slug: MainCategorySlug }> = useMemo(
    () => [
      { label: 'Skincare', slug: 'skincare' },
      { label: 'Haircare', slug: 'haircare' },
      { label: 'Makeup', slug: 'makeup' },
      { label: 'Organic', slug: 'organic-natural' },
    ],
    []
  );

  const getMainCategoryHref = (slug: MainCategorySlug) => `/products?category=${slug}`;
  const getSubcategoryHref = (slug: MainCategorySlug, item: string) =>
    `/products?category=${slug}&search=${encodeURIComponent(item)}`;

  const isRouteActive = (href: string) => {
    if (href.startsWith('/products?category=')) {
      return currentPath === '/products';
    }
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return categories
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [categories, searchQuery]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 shadow-sm backdrop-blur-xl dark:bg-gray-950/75">
      {/* Top Bar */}
      <div className="bg-secondary-900 text-white py-2">
        <div className="container">
          <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
            <p className="truncate">{labels.topBarPromo}</p>
            <div className="hidden md:flex items-center gap-4 text-white/95">
              <button
                className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1 text-xs"
                onClick={toggleLanguage}
                type="button"
              >
                <Globe className="h-3.5 w-3.5" /> {language === 'EN' ? 'English 🇺🇸' : 'नेपाली 🇳🇵'}
              </button>
              <Link href="/vendor" className="inline-flex items-center gap-1 hover:underline whitespace-nowrap">
                <Store className="h-3.5 w-3.5" /> {labels.sellerDashboard}
              </Link>
              <Link href="/track-order" className="hover:underline whitespace-nowrap">
                {labels.trackOrder}
              </Link>
              <Link href="/blog" className="hover:underline whitespace-nowrap">
                {labels.beautyTips}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold gradient-text">
              Glovia Nepal
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {desktopNavCategories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => {
                  if (activeDesktopCategory === category.slug) {
                    setDesktopCatalogOpen((prev) => !prev);
                  } else {
                    setActiveDesktopCategory(category.slug);
                    setDesktopCatalogOpen(true);
                  }
                }}
                className={`font-medium transition-colors dark:text-gray-100 ${
                  isRouteActive(getMainCategoryHref(category.slug))
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {category.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${desktopCatalogOpen && activeDesktopCategory === category.slug ? 'rotate-180' : ''}`} />
                </span>
              </button>
            ))}
            <Link
              href="/about"
              className={`font-medium transition-colors ${
                isRouteActive('/about')
                  ? 'text-primary-600'
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              {labels.about}
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cart && cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full text-[10px] sm:text-xs">
                  {cart.itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                    {labels.dashboard}
                  </Link>
                  <Link href="/account" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                    {labels.myAccount}
                  </Link>
                  <Link href="/account/orders" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                    {labels.orders}
                  </Link>
                  <Link href="/account/addresses" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                    {labels.addresses}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 text-sm"
                  >
                    {labels.logout}
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 rounded-xl">
                {labels.signIn}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4"
          >
            <form className="relative" onSubmit={(e) => {
              e.preventDefault();
              const query = searchQuery.trim();
              if (!query) return;
              router.push(`/products?search=${query}`);
              setSearchOpen(false);
              setSearchQuery('');
            }}>
              <input
                type="text"
                name="search"
                placeholder={labels.searchPlaceholder}
                className="input pr-10"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </button>
            </form>
            {searchSuggestions.length > 0 && (
              <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {searchSuggestions.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block rounded-xl px-3 py-2 text-sm text-secondary-800 transition hover:bg-primary-50 dark:text-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {desktopCatalogOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="hidden border-t border-gray-200/70 bg-white/95 backdrop-blur-xl lg:block dark:border-gray-800 dark:bg-gray-950/95"
          >
            <div className="container py-5">
              <div className="mb-4 flex flex-wrap gap-2">
                {GLOVIA_MAIN_CATEGORIES.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => setActiveDesktopCategory(category.slug)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      activeDesktopCategory === category.slug
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {GLOVIA_SUBCATEGORY_GROUPS[activeDesktopCategory].map((group) => (
                  <div key={group.group} className="rounded-2xl border border-gray-200/80 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-900/60">
                    <h4 className="mb-2 text-sm font-semibold text-secondary-900 dark:text-gray-100">{group.group}</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <Link
                          key={item}
                          href={getSubcategoryHref(activeDesktopCategory, item)}
                          onClick={() => setDesktopCatalogOpen(false)}
                          className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              className="fixed inset-0 z-50 bg-black/55 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed left-0 top-0 z-[60] h-[100dvh] w-[90%] max-w-sm overflow-y-auto border-r border-gray-200 bg-white p-4 pb-24 shadow-2xl lg:hidden dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between border-b border-gray-200 bg-white px-4 pb-3 pt-1 dark:border-gray-800 dark:bg-gray-950">
                <h3 className="text-base font-semibold text-secondary-900 dark:text-gray-100">{labels.browseCategories}</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-gray-200 p-2 dark:border-gray-700"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {desktopNavCategories.map((category) => {
                  const isOpen = activeMobileCategory === category.slug;
                  return (
                    <div key={category.slug} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      <button
                        type="button"
                        onClick={() => setActiveMobileCategory((prev) => (prev === category.slug ? null : category.slug))}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-medium text-secondary-800 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                      >
                        <span>{category.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 overflow-hidden border-t border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-900"
                          >
                            <Link
                              href={getMainCategoryHref(category.slug)}
                              className="block rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {labels.viewAll} {category.label}
                            </Link>
                            {GLOVIA_SUBCATEGORY_GROUPS[category.slug].map((group) => (
                              <div key={group.group}>
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{group.group}</p>
                                <div className="flex flex-wrap gap-2">
                                  {group.items.map((item) => (
                                    <Link
                                      key={item}
                                      href={getSubcategoryHref(category.slug, item)}
                                      className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {item}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                <Link
                  href="/about"
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    isRouteActive('/about')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {labels.about}
                </Link>
                <Link
                  href="/vendor"
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-secondary-800 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {labels.sellerDashboard}
                </Link>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="rounded-xl px-4 py-2.5 text-left text-sm font-medium text-secondary-800 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="inline-flex items-center gap-2">
                    <Globe className="h-4 w-4" /> {language === 'EN' ? 'Switch to नेपाली' : 'Switch to English'}
                  </span>
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-white/90 pb-[calc(env(safe-area-inset-bottom)+0.2rem)] backdrop-blur-xl md:hidden dark:bg-gray-950/90">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 rounded-xl py-1 text-xs font-medium transition ${
              isRouteActive('/')
                ? 'bg-primary-50 text-primary-700'
                : 'text-secondary-900 dark:text-gray-100'
            }`}
          >
            <Home className="h-4 w-4" /> {labels.home}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex flex-col items-center gap-1 rounded-xl py-1 text-xs font-medium text-secondary-900 transition dark:text-gray-100"
          >
            <Menu className="h-4 w-4" /> {labels.categories}
          </button>
          <Link
            href="/cart"
            className={`relative flex flex-col items-center gap-1 rounded-xl py-1 text-xs font-medium transition ${
              isRouteActive('/cart')
                ? 'bg-primary-50 text-primary-700'
                : 'text-secondary-900 dark:text-gray-100'
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> {labels.cart}
            {cart && cart.itemCount > 0 ? (
              <span className="absolute right-5 top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] text-white">
                {cart.itemCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={isAuthenticated ? '/account' : '/auth/login'}
            className={`flex flex-col items-center gap-1 rounded-xl py-1 text-xs font-medium transition ${
              isRouteActive('/account') || isRouteActive('/auth')
                ? 'bg-primary-50 text-primary-700'
                : 'text-secondary-900 dark:text-gray-100'
            }`}
          >
            <User className="h-4 w-4" /> {labels.account}
          </Link>
        </div>
      </div>
    </header>
  );
}
