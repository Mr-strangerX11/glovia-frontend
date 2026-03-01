"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingCart, Heart, User, Menu, X, Moon, Sun, Store, Globe, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/hooks/useData';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'EN' | 'NP'>('EN');
  const [dark, setDark] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const categories = [
    { name: 'Skincare', href: '/products?category=skincare' },
    { name: 'Haircare', href: '/products?category=haircare' },
    { name: 'Makeup', href: '/products?category=makeup' },
    { name: 'Organic', href: '/products?category=organic' },
    { name: 'Electronics', href: '/products?category=electronics' },
    { name: 'Groceries', href: '/products?category=groceries' },
  ];

  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return categories
      .filter((item) => item.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [categories, searchQuery]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/75 shadow-sm backdrop-blur-xl dark:bg-gray-950/70">
      {/* Top Bar */}
      <div className="bg-secondary-900 text-white py-2">
        <div className="container">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <p className="truncate">✨ Free delivery over NPR 2,999 • Premium Marketplace for Nepal</p>
            <div className="hidden md:flex items-center gap-4 text-white/95">
              <button
                className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1 text-xs"
                onClick={() => setLanguage((prev) => (prev === 'EN' ? 'NP' : 'EN'))}
                type="button"
              >
                <Globe className="h-3.5 w-3.5" /> {language === 'EN' ? 'English 🇺🇸' : 'नेपाली 🇳🇵'}
              </button>
              <Link href="/vendor" className="inline-flex items-center gap-1 hover:underline whitespace-nowrap">
                <Store className="h-3.5 w-3.5" /> Seller Dashboard
              </Link>
              <Link href="/track-order" className="hover:underline whitespace-nowrap">
                Track Order
              </Link>
              <Link href="/blog" className="hover:underline whitespace-nowrap">
                Beauty Tips
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
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors dark:text-gray-100"
              >
                {category.name}
              </Link>
            ))}
            <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              About
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
                    Dashboard
                  </Link>
                  <Link href="/account" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                    My Account
                  </Link>
                  <Link href="/account/orders" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                    Orders
                  </Link>
                  <Link href="/account/addresses" className="block px-4 py-2 hover:bg-gray-100 text-sm">
                    Addresses
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3">
                Sign In
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
                placeholder="Search for products..."
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t animate-slide-down">
          <nav className="container py-4 flex flex-col gap-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/about"
              className="px-4 py-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/vendor"
              className="px-4 py-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Seller Dashboard
            </Link>
          </nav>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/20 bg-white/90 backdrop-blur-xl md:hidden dark:bg-gray-950/90">
        <div className="mx-auto grid max-w-md grid-cols-4 px-3 py-2">
          <Link href="/" className="flex flex-col items-center gap-1 py-1 text-xs font-medium text-secondary-900 dark:text-gray-100">
            <Home className="h-4 w-4" /> Home
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex flex-col items-center gap-1 py-1 text-xs font-medium text-secondary-900 dark:text-gray-100"
          >
            <Menu className="h-4 w-4" /> Categories
          </button>
          <Link href="/cart" className="relative flex flex-col items-center gap-1 py-1 text-xs font-medium text-secondary-900 dark:text-gray-100">
            <ShoppingCart className="h-4 w-4" /> Cart
            {cart && cart.itemCount > 0 ? (
              <span className="absolute right-5 top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] text-white">
                {cart.itemCount}
              </span>
            ) : null}
          </Link>
          <Link href={isAuthenticated ? '/account' : '/auth/login'} className="flex flex-col items-center gap-1 py-1 text-xs font-medium text-secondary-900 dark:text-gray-100">
            <User className="h-4 w-4" /> Account
          </Link>
        </div>
      </div>
    </header>
  );
}
