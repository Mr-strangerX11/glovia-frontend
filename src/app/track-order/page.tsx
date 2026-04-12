'use client';

import { useState } from 'react';
import { ordersAPI } from '@/lib/api';
import { Package, Search, Truck, CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight, Home, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';

type TrackingOrder = {
  orderNumber: string;
  status: string;
  createdAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  trackingNumber?: string;
  deliveryPartner?: string;
  total?: number;
  paymentMethod?: string;
  address?: {
    district?: string;
    area?: string;
  };
  items?: Array<{ id: string; product?: { name: string; images?: Array<{ url: string }> } }>;
  timeline?: Array<{ key: string; label: string; at?: string | null }>;
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<TrackingOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !identifier.trim()) {
      toast.error('Please enter order number and email/phone');
      return;
    }

    setLoading(true);
    setTrackedOrder(null);
    setHasSearched(true);

    try {
      const { data } = await ordersAPI.track(orderNumber.trim().toUpperCase(), identifier.trim());
      setTrackedOrder(data);
    } catch (error: any) {
      setTrackedOrder(null);
      const message = error?.response?.data?.message || 'Unable to track order';
      toast.error(typeof message === 'string' ? message : 'Unable to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      PENDING: Clock,
      CONFIRMED: CheckCircle2,
      PROCESSING: Zap,
      SHIPPED: Truck,
      DELIVERED: Home,
      CANCELLED: XCircle,
      RETURNED: Package,
    };
    return icons[status] || Package;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string; border: string }> = {
      PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500', border: 'border-yellow-200' },
      CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500', border: 'border-blue-200' },
      PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500', border: 'border-purple-200' },
      SHIPPED: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-500', border: 'border-indigo-200' },
      DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500', border: 'border-green-200' },
      CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500', border: 'border-red-200' },
      RETURNED: { bg: 'bg-gray-50', text: 'text-gray-600', icon: 'text-gray-500', border: 'border-gray-200' },
    };
    return colors[status] || colors.PENDING;
  };

  const statusColors = getStatusColor(trackedOrder?.status || 'PENDING');
  const StatusIcon = getStatusIcon(trackedOrder?.status || 'PENDING');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 pt-12 pb-16">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white space-y-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 mb-4">
              <Truck className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold">Track Your Order</h1>
            <p className="text-pink-100 text-lg max-w-2xl mx-auto">
              Get real-time updates on your delivery and know exactly when your order arrives
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-6xl -mt-12 pb-20 relative z-10">
        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
        >
          <form onSubmit={handleTrack} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Order Number */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Order Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g., ORD-2024-12345"
                    className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                  />
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Found in your confirmation email</p>
              </div>

              {/* Email or Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email or Phone</label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="your@email.com or 98XXXXXXXX"
                    className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Used for order verification</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-60 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Tracking your order…
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  Track Now
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        {hasSearched && !loading && !trackedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find an order with the details you provided. Please check and try again.
            </p>
            <button
              onClick={() => {
                setOrderNumber('');
                setIdentifier('');
                setHasSearched(false);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Tracked Order Details */}
        {trackedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-6"
          >
            {/* Status Header */}
            <div className={`rounded-2xl shadow-lg border ${statusColors.border} ${statusColors.bg} p-8`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${statusColors.bg}`}>
                    <StatusIcon className={`w-7 h-7 ${statusColors.icon}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Order #{trackedOrder.orderNumber}</p>
                    <h2 className={`text-2xl font-bold ${statusColors.text}`}>{trackedOrder.status}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-rose-600">NPR {Number(trackedOrder.total || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Delivery Timeline</h3>
              <div className="space-y-4">
                {(trackedOrder.timeline || []).map((step, idx) => {
                  const reached = Boolean(step.at);
                  const stepIcon = step.key === 'DELIVERED' ? Home : step.key === 'CANCELLED' ? XCircle : step.key === 'SHIPPED' ? Truck : Clock;
                  const StepIcon = stepIcon;

                  return (
                    <div key={step.key} className="relative">
                      {/* Connector line */}
                      {idx < (trackedOrder.timeline?.length || 1) - 1 && (
                        <div className={`absolute left-6 top-12 w-0.5 h-12 ${reached ? 'bg-rose-300' : 'bg-gray-200'}`} />
                      )}

                      {/* Step */}
                      <div className="flex gap-4 items-start">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          reached
                            ? 'bg-rose-100 border-rose-300 text-rose-600'
                            : 'bg-gray-100 border-gray-200 text-gray-400'
                        }`}>
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p className={`font-bold ${reached ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                          <p className={`text-sm ${reached ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.at ? new Date(step.at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid sm:grid-cols-3 gap-6">
              {/* Tracking Number */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-sm text-gray-600 font-medium mb-2">Tracking Number</p>
                <p className="text-lg font-bold text-gray-900">{trackedOrder.trackingNumber || 'Not assigned'}</p>
              </div>

              {/* Delivery Partner */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-sm text-gray-600 font-medium mb-2">Delivery Partner</p>
                <p className="text-lg font-bold text-gray-900">{trackedOrder.deliveryPartner || 'Being assigned'}</p>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-sm text-gray-600 font-medium mb-2">Payment Method</p>
                <p className="text-lg font-bold text-gray-900">{trackedOrder.paymentMethod || 'N/A'}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-4">
                <Home className="w-5 h-5 text-rose-500" />
                <h3 className="text-xl font-bold text-gray-900">Delivery Address</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-900 font-semibold">
                  {trackedOrder.address?.district || 'Address not available'}
                </p>
                {trackedOrder.address?.area && (
                  <p className="text-gray-600 text-sm mt-1">{trackedOrder.address.area}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/account/orders"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors"
              >
                View All Orders
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg"
              >
                Need Help?
              </Link>
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        {!trackedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">How to Track Your Order</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Package,
                  title: 'Order Number',
                  description: 'Find it in your confirmation email or account dashboard',
                },
                {
                  icon: Search,
                  title: 'Verify Identity',
                  description: 'Use your registered email or phone number for verification',
                },
                {
                  icon: Truck,
                  title: 'Get Updates',
                  description: 'Real-time tracking from dispatch to delivery',
                },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="text-center">
                  <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-rose-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Can't find your order?{' '}
            <Link href="/contact" className="text-rose-600 hover:text-rose-700 font-bold">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
