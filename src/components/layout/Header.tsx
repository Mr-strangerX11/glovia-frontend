'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/hooks/useData';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <p className="truncate">✨ Free Delivery on orders above NPR 2,999</p>
            <div className="hidden md:flex items-center gap-4">
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
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
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
                Login
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
        {searchOpen && (
          <div className="mt-4 animate-slide-down">
            <form className="relative" onSubmit={(e) => {
              e.preventDefault();
              const query = (e.target as any).search.value;
              router.push(`/products?search=${query}`);
              setSearchOpen(false);
            }}>
              <input
                type="text"
                name="search"
                placeholder="Search for products..."
                className="input pr-10"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </button>
            </form>
          </div>
        )}
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
          </nav>
        </div>
      )}
    </header>
  );
}
