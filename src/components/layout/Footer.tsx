'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight, Heart } from 'lucide-react';

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/profile.php?id=61584687494150',
    label: 'Facebook',
    icon: <FacebookIcon />,
  },
  {
    href: 'https://www.instagram.com/glovia_nepal?igsh=OTZtdHpmZXMyOWlk',
    label: 'Instagram',
    icon: <InstagramIcon />,
  },
  {
    href: 'https://www.tiktok.com/@glovianepal?_r=1&_t=ZS-93dQ96nYLDR',
    label: 'TikTok',
    icon: <TikTokIcon />,
  },
] as const;

const QUICK_LINKS = [
  { href: '/products',  label: 'Shop All Products' },
  { href: '/brands',   label: 'Brands' },
  { href: '/vendors',  label: 'Vendors' },
  { href: '/about',    label: 'About' },
  { href: '/blog',     label: 'Beauty Blog' },
  { href: '/contact',  label: 'Contact Us' },
] as const;

const CUSTOMER_LINKS = [
  { href: '/shipping', label: 'Shipping Policy' },
  { href: '/returns',  label: 'Returns & Refunds' },
  { href: '/privacy',  label: 'Privacy Policy' },
  { href: '/terms',    label: 'Terms & Conditions' },
  { href: '/track-order', label: 'Track Order' },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-secondary-950 via-secondary-900 to-secondary-950 text-white">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

      {/* Main grid */}
      <div className="container pt-12 pb-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-2xl font-black tracking-tight text-transparent">
                Glovia
              </span>
              <span className="ml-1.5 text-xs font-semibold text-white/40">Marketplace</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/60 mb-5 max-w-xs">
              Premium beauty, skincare &amp; wellness products curated for Nepal. Authentic brands, fast delivery.
            </p>

            {/* Social icons */}
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-white/70 transition-all duration-200 hover:bg-primary-600 hover:text-white hover:scale-105"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/40">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/40">
              Customer Service
            </h4>
            <ul className="space-y-2.5">
              {CUSTOMER_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
                  >
                    <ArrowRight className="h-3 w-3 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/40">
              Get in Touch
            </h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8">
                  <MapPin className="h-3.5 w-3.5 text-primary-400" />
                </div>
                <span className="text-sm text-white/65 leading-relaxed">
                  Kumarigal, Chabahil,<br />Kathmandu, Nepal
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8">
                  <Phone className="h-3.5 w-3.5 text-primary-400" />
                </div>
                <a href="tel:+9779700003327" className="text-sm text-white/65 transition-colors hover:text-white">
                  {'+977 9700003327'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/8">
                  <Mail className="h-3.5 w-3.5 text-primary-400" />
                </div>
                <a href="mailto:glovianepal@gmail.com" className="text-sm text-white/65 transition-colors hover:text-white">
                  {'glovianepal@gmail.com'}
                </a>
              </li>
            </ul>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['Secure Payments', '100% Authentic', 'Fast Delivery'].map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/50">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/8 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-white/35 sm:flex-row">
            <p>
              &copy; {year} Glovia Marketplace. All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-primary-500 fill-primary-500" />
              <span>for Nepal</span>
              <span className="ml-2">🇳🇵</span>
            </div>
            <a
              href="https://masa-coders.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white/70"
            >
              {'Powered by Masa Coders'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
