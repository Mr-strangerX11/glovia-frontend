'use client';

import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

// TikTok icon component since it's not in lucide-react
const TikTokIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold mb-3 sm:mb-4">Glovia Nepal</h3>
            <p className="text-sm sm:text-base text-gray-300 mb-4">
              Premium beauty and cosmetic products crafted for Nepali skin. 
              Embrace your natural beauty with Glovia.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61584687494150"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/glovia_nepal/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@glovianepal?_r=1&_t=ZS-93dQ96nYLDR"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Beauty Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm sm:text-base">
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-primary-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  Kumarigal, Chabahil, Kathmandu, Nepal
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+9779700003327" className="text-gray-300 hover:text-primary-400">
                  +977-9700003327
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:info@glovia.com.np" className="text-gray-300 hover:text-primary-400">
                glovianepal@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
            <p className="text-center md:text-left">© {currentYear} Glovia Nepal. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <span className="whitespace-nowrap">Made for Nepal🇳🇵</span>
              <span className="whitespace-nowrap">Mr kashi chaudhary</span>
              <span className="whitespace-nowrap">With Love ❤️</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
