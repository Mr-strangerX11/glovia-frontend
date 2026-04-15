'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useOrders } from '@/hooks/useData';
import {
  Package, Loader2, ChevronRight, ShoppingBag, ArrowLeft,
  Clock, CheckCircle2, Truck, Home, AlertCircle, Search, X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: any; label: string }> = {
  PENDING:    { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  icon: Clock,        label: 'Pending' },
  CONFIRMED:  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   icon: CheckCircle2, label: 'Confirmed' },
  PROCESSING: { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200', icon: Loader2,      label: 'Processing' },
  SHIPPED:    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200', icon: Truck,        label: 'Shipped' },
  DELIVERED:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',icon: Home,         label: 'Delivered' },
  CANCELLED:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    icon: AlertCircle,  label: 'Cancelled' },
  RETURNED:   { bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200',   icon: Package,      label: 'Returned' },
};

const FILTERS = [
  { value: 'all',        label: 'All' },
  { value: 'PENDING',    label: 'Pending' },
  { value: 'CONFIRMED',  label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED',    label: 'Shipped' },
  { value: 'DELIVERED',  label: 'Delivered' },
  { value: 'CANCELLED',  label: 'Cancelled' },
];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { orders, isLoading } = useOrders();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/login?redirect=/account/orders');
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Loading orders…</p>
        </div>
      </div>
    );
  }

  const filteredOrders = (orders || []).filter((order: any) => {
    const matchStatus = filter === 'all' || order.status === filter;
    const matchSearch = !searchQuery ||
      order.orderNumber?.toString().includes(searchQuery) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = (orders || []).reduce((acc: any, o: any) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 pt-12 pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-36 -mt-36 blur-3xl pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-end justify-between gap-4 mb-2">
            <div className="text-white">
              <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mb-2">My Account</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                <ShoppingBag className="w-8 h-8" /> My Orders
              </h1>
              <p className="text-pink-100 mt-2 text-sm">
                {orders?.length ? `${orders.length} order${orders.length > 1 ? 's' : ''} placed` : 'No orders yet'}
              </p>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-white/30 backdrop-blur-sm flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Account
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl -mt-16 pb-20 space-y-5">

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Fetching your orders…</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-8">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8">
              Start shopping to see your orders here.
            </p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition shadow-lg">
              <ShoppingBag className="w-4 h-4" /> Browse Products
            </Link>
          </div>
        )}

        {!isLoading && orders && orders.length > 0 && (
          <>
            {/* Filter bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text" placeholder="Search by order number…"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Status pills */}
              <div className="flex gap-2 flex-wrap">
                {FILTERS.map((f) => {
                  const count = f.value === 'all' ? (orders?.length || 0) : (counts[f.value] || 0);
                  const active = filter === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        active
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {f.label}
                      {count > 0 && (
                        <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-black ${active ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-12 px-8">
                <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">No orders match your filter</p>
                <button onClick={() => { setFilter('all'); setSearchQuery(''); }} className="mt-3 text-xs text-rose-500 font-bold hover:text-rose-600">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={order.id || order.orderNumber}
                      className={`group bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${cfg.border}`}
                    >
                      {/* Top bar */}
                      <div className={`px-5 py-3 flex items-center justify-between gap-3 ${cfg.bg} border-b ${cfg.border}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white border ${cfg.border}`}>
                            <StatusIcon className={`w-4 h-4 ${cfg.text}`} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-800">Order #{order.orderNumber}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${cfg.text} bg-white ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="px-5 py-4 space-y-3">
                        {order.items?.slice(0, 2).map((item: any) => (
                          <div key={item.id || item.product?.sku} className="flex gap-3 items-center">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                              {item.product?.images?.[0] ? (
                                <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.product?.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-black text-gray-900 flex-shrink-0">NPR {Number(item.total).toLocaleString()}</p>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <p className="text-xs text-gray-400 font-medium">
                            +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3.5 flex items-center justify-between border-t border-gray-50 bg-gray-50/50">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total</p>
                          <p className="text-lg font-black text-rose-600">NPR {Number(order.total).toLocaleString()}</p>
                        </div>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${cfg.text} ${cfg.bg} border ${cfg.border} group-hover:gap-3`}
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
