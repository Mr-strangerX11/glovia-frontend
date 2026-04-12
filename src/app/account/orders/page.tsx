'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useOrders } from '@/hooks/useData';
import { Package, Loader2, ChevronRight, ShoppingBag, ArrowLeft, Clock, CheckCircle2, Truck, Home, AlertCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { orders, isLoading } = useOrders();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/account/orders');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading orders…</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      PENDING: Clock,
      CONFIRMED: CheckCircle2,
      PROCESSING: Loader2,
      SHIPPED: Truck,
      DELIVERED: Home,
      CANCELLED: AlertCircle,
      RETURNED: Package,
    };
    return icons[status] || Package;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: 'text-yellow-500' },
      CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
      PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: 'text-purple-500' },
      SHIPPED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'text-indigo-500' },
      DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-500' },
      CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
      RETURNED: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: 'text-gray-500' },
    };
    return colors[status] || colors.PENDING;
  };

  const filteredOrders = (orders || []).filter((order: any) => {
    const matchStatus = filter === 'all' || order.status === filter;
    const matchSearch = order.orderNumber?.toString().includes(searchQuery) || 
                       order.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 pt-12 pb-24">
        <div className="container max-w-6xl">
          <div className="flex items-end justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white"
            >
              <p className="text-rose-200 text-sm font-bold uppercase tracking-widest mb-2">My Account</p>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">My Orders</h1>
              <p className="text-pink-100 text-lg">
                {orders?.length
                  ? `${orders.length} order${orders.length > 1 ? 's' : ''} placed`
                  : 'No orders yet'}
              </p>
            </motion.div>
            <Link
              href="/account"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-white/30 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Account
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl -mt-16 pb-20 relative z-10">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mx-auto" />
              <p className="text-gray-400">Loading your orders…</p>
            </div>
          </div>
        ) : !orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-20 px-8"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-rose-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Start shopping to place your first order. Browse our collection of premium beauty and wellness products.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold px-8 py-4 rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Search by order number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap items-center">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Orders</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-12 px-8">
                  <p className="text-gray-500">No orders found matching your filters.</p>
                </div>
              ) : (
                filteredOrders.map((order: any, idx: number) => {
                  const StatusIcon = getStatusIcon(order.status);
                  const statusColor = getStatusColor(order.status);
                  return (
                    <motion.div
                      key={order.id || order.orderNumber}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-rose-200 transition-all duration-300"
                    >
                      {/* Order header */}
                      <div className={`px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b ${statusColor.border}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2.5 rounded-xl ${statusColor.bg} border ${statusColor.border}`}>
                              <StatusIcon className={`w-5 h-5 ${statusColor.icon}`} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">Order #{order.orderNumber}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border ${statusColor.text} ${statusColor.bg} ${statusColor.border}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="px-6 py-4 space-y-3 border-b border-gray-50">
                        {order.items?.slice(0, 2).map((item: any) => (
                          <div key={item.id || item.product?.sku} className="flex gap-4 items-start">
                            {item.product?.images?.[0] ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 line-clamp-2">{item.product?.name}</p>
                              <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-sm text-gray-900 flex-shrink-0">NPR {Number(item.total).toLocaleString()}</p>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-gray-400 font-medium pl-4">+{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}</p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-transparent">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                          <p className="text-xl font-bold text-rose-600 mt-0.5">NPR {Number(order.total).toLocaleString()}</p>
                        </div>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-5 py-3 rounded-xl transition-all group-hover:gap-3"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

