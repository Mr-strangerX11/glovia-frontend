"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ShoppingBag, Home, ArrowRight } from 'lucide-react';

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950 pb-24 pt-16">
        <div className="container flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/30"
          >
            <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            Order Confirmed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mx-auto mt-3 max-w-md text-sm text-white/60"
          >
            Thank you for shopping with Glovia. Your order has been received and is being prepared.
          </motion.p>
        </div>
      </div>

      <div className="container -mt-10 max-w-2xl pb-16">
        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl"
        >
          {/* Steps */}
          <div className="bg-emerald-50 p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-700">Order Status</p>
            <div className="flex items-center gap-0">
              {[
                { label: 'Order Placed', done: true },
                { label: 'Processing', done: false },
                { label: 'Shipped', done: false },
                { label: 'Delivered', done: false },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                        step.done
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-gray-200 bg-white text-gray-400'
                      }`}
                    >
                      {step.done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                    </div>
                    <p className={`text-[10px] font-semibold text-center ${step.done ? 'text-emerald-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 rounded ${step.done ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info rows */}
          <div className="divide-y divide-gray-100 p-6">
            <div className="flex items-center gap-4 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary-900">We&apos;re preparing your order</p>
                <p className="text-xs text-secondary-500">You&apos;ll receive a notification once it&apos;s out for delivery.</p>
              </div>
            </div>

            <div className="py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">What&apos;s next?</p>
              <ul className="space-y-2 text-sm text-secondary-700">
                {[
                  'Our team will confirm your order within 24 hours.',
                  'You will receive an SMS/Email with tracking details.',
                  'Fast delivery across Nepal — most orders ship within 1–3 days.',
                  'Pay on delivery (COD) or digital payment as selected.',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 border-t border-gray-100 p-6 sm:flex-row">
            <Link
              href="/account/orders"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-700"
            >
              <Package className="h-4 w-4" /> View My Orders <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-secondary-700 transition hover:bg-gray-50"
            >
              <ShoppingBag className="h-4 w-4" /> Continue Shopping
            </Link>
          </div>
        </motion.div>

        {/* Back home */}
        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-primary-600">
            <Home className="h-4 w-4" /> Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
