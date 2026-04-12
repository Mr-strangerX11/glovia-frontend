"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { flashDealsAPI } from '@/lib/api';

type FlashDealProduct = {
  productId: string;
  productName: string;
  productImage?: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage?: number;
};

type FlashDeal = {
  _id: string;
  title: string;
  description?: string;
  products: FlashDealProduct[];
  adImage: string;
  endTime: string;
};

export default function FlashDealsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deals, setDeals] = useState<FlashDeal[]>([]);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch flash deals
  useEffect(() => {
    const hasSeenFlashDeals = localStorage.getItem('flashDealsModalSeen');
    
    flashDealsAPI.getActive()
      .then(res => {
        const activeDeals = res.data?.data || [];
        if (activeDeals.length > 0) {
          setDeals(activeDeals);
          // Show modal if user hasn't seen it in this session or deals are newly refreshed
          if (!hasSeenFlashDeals) {
            setIsOpen(true);
            localStorage.setItem('flashDealsModalSeen', 'true');
          }
        }
      })
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));
  }, []);

  // Calculate countdown
  useEffect(() => {
    if (!isOpen || deals.length === 0) return;

    const currentDeal = deals[currentDealIndex];
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(currentDeal.endTime).getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / (1000 * 60)) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, deals, currentDealIndex]);

  // Record view
  useEffect(() => {
    if (isOpen && deals.length > 0) {
      flashDealsAPI.recordView(deals[currentDealIndex]._id).catch(() => {});
    }
  }, [isOpen, currentDealIndex, deals]);

  const handleDealClick = () => {
    if (deals.length > 0) {
      flashDealsAPI.recordClick(deals[currentDealIndex]._id).catch(() => {});
    }
  };

  const handlePreviousDeal = () => {
    setCurrentDealIndex((prev) =>
      prev === 0 ? deals.length - 1 : prev - 1
    );
    setCurrentProductIndex(0);
  };

  const handleNextDeal = () => {
    setCurrentDealIndex((prev) =>
      prev === deals.length - 1 ? 0 : prev + 1
    );
    setCurrentProductIndex(0);
  };

  const handlePreviousProduct = () => {
    const currentDeal = deals[currentDealIndex];
    setCurrentProductIndex((prev) =>
      prev === 0 ? currentDeal.products.length - 1 : prev - 1
    );
  };

  const handleNextProduct = () => {
    const currentDeal = deals[currentDealIndex];
    setCurrentProductIndex((prev) =>
      prev === currentDeal.products.length - 1 ? 0 : prev + 1
    );
  };

  if (!isOpen || deals.length === 0) return null;

  const currentDeal = deals[currentDealIndex];
  const currentProduct = currentDeal.products[currentProductIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: Ad Image */}
              <div className="relative aspect-square md:aspect-auto md:min-h-[500px] bg-gray-200 dark:bg-gray-800">
                {currentDeal.adImage && (
                  <Image
                    src={currentDeal.adImage}
                    alt={currentDeal.title}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                {!currentDeal.adImage && (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {/* Right: Deal Info */}
              <div className="p-6 md:p-8 flex flex-col justify-between">
                {/* Countdown */}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">🔥 Limited Time</p>
                  <div className="flex gap-3 justify-center md:justify-start">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-center">
                      <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                      <div className="text-xs font-semibold">HRS</div>
                    </div>
                    <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-center">
                      <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                      <div className="text-xs font-semibold">MIN</div>
                    </div>
                    <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-center">
                      <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                      <div className="text-xs font-semibold">SEC</div>
                    </div>
                  </div>
                </div>

                {/* Deal Title */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentDeal.title}
                  </h2>
                  {currentDeal.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{currentDeal.description}</p>
                  )}
                </div>

                {/* Product Info */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {currentProduct.productName}
                      </h3>
                      <div className="flex items-end gap-4">
                        <div>
                          <p className="text-sm text-gray-500 line-through">₹{currentProduct.originalPrice.toLocaleString()}</p>
                          <p className="text-3xl font-bold text-red-600">₹{currentProduct.salePrice.toLocaleString()}</p>
                        </div>
                        {currentProduct.discountPercentage && (
                          <span className="px-3 py-1 bg-red-100 text-red-600 font-bold rounded-lg">
                            -{currentProduct.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Navigation (if multiple products) */}
                  {currentDeal.products.length > 1 && (
                    <div className="pt-3 flex items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handlePreviousProduct}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex-1 text-center">
                        Product {currentProductIndex + 1} of {currentDeal.products.length}
                      </div>
                      <button
                        onClick={handleNextProduct}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Link href="/products" onClick={handleDealClick} className="block">
                    <Button variant="primary" fullWidth size="lg" className="text-lg">
                      Shop Now
                    </Button>
                  </Link>

                  {/* Deal Navigation */}
                  {deals.length > 1 && (
                    <>
                      <div className="text-center text-sm text-gray-500 py-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                        Deal {currentDealIndex + 1} of {deals.length}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handlePreviousDeal}
                          fullWidth
                        >
                          ← Previous Deal
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleNextDeal}
                          fullWidth
                        >
                          Next Deal →
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {/* Dot Indicators */}
                {deals.length > 1 && (
                  <div className="flex gap-2 justify-center mt-4">
                    {deals.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentDealIndex(idx);
                          setCurrentProductIndex(0);
                        }}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentDealIndex ? 'bg-red-600 w-8' : 'bg-gray-300 w-2'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
