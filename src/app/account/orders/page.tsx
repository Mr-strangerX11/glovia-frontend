'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useOrders } from '@/hooks/useData';
import {
  Package, Loader2, ChevronRight, ShoppingBag, ArrowLeft,
  Clock, CheckCircle2, Truck, Home, AlertCircle, Search, X,
  Filter, TrendingUp, Calendar, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SafeImage } from '@/components/common/SafeImage';

const STATUS_CONFIG: Record<string, { gradient: string; text: string; border: string; bg: string; icon: any; label: string; dot: string }> = {
  PENDING:    { gradient: 'from-amber-400 to-orange-400',   text: 'text-amber-700',   border: 'border-amber-200',  bg: 'bg-amber-50',   icon: Clock,        label: 'Pending',    dot: 'bg-amber-400' },
  CONFIRMED:  { gradient: 'from-blue-400 to-cyan-400',      text: 'text-blue-700',    border: 'border-blue-200',   bg: 'bg-blue-50',    icon: CheckCircle2, label: 'Confirmed',  dot: 'bg-blue-400' },
  PROCESSING: { gradient: 'from-violet-400 to-purple-400',  text: 'text-violet-700',  border: 'border-violet-200', bg: 'bg-violet-50',  icon: Loader2,      label: 'Processing', dot: 'bg-violet-400' },
  SHIPPED:    { gradient: 'from-indigo-400 to-blue-500',    text: 'text-indigo-700',  border: 'border-indigo-200', bg: 'bg-indigo-50',  icon: Truck,        label: 'Shipped',    dot: 'bg-indigo-400' },
  DELIVERED:  { gradient: 'from-emerald-400 to-teal-400',   text: 'text-emerald-700', border: 'border-emerald-200',bg: 'bg-emerald-50', icon: Home,         label: 'Delivered',  dot: 'bg-emerald-400' },
  CANCELLED:  { gradient: 'from-red-400 to-rose-400',       text: 'text-red-700',     border: 'border-red-200',    bg: 'bg-red-50',     icon: AlertCircle,  label: 'Cancelled',  dot: 'bg-red-400' },
  RETURNED:   { gradient: 'from-gray-400 to-slate-400',     text: 'text-gray-600',    border: 'border-gray-200',   bg: 'bg-gray-50',    icon: Package,      label: 'Returned',   dot: 'bg-gray-400' },
};

const FILTERS = [
  { value: 'all',        label: 'All Orders', icon: ShoppingBag },
  { value: 'PENDING',    label: 'Pending',    icon: Clock },
  { value: 'CONFIRMED',  label: 'Confirmed',  icon: CheckCircle2 },
  { value: 'PROCESSING', label: 'Processing', icon: Loader2 },
  { value: 'SHIPPED',    label: 'Shipped',    icon: Truck },
  { value: 'DELIVERED',  label: 'Delivered',  icon: Home },
  { value: 'CANCELLED',  label: 'Cancelled',  icon: AlertCircle },
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-[3px] border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 font-medium">Loading your orders…</p>
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

  const totalSpend = (orders || []).reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
  const deliveredCount = counts['DELIVERED'] || 0;

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 py-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="text-white">
              <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-200 inline-block" />
                My Account
              </p>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                My Orders
              </h1>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-3 py-2 rounded-lg transition-all border border-white/20 backdrop-blur-sm flex-shrink-0 text-xs"
            >
              <ArrowLeft className="w-3 h-3" /> <span className="hidden sm:inline">Account</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl pt-5 pb-24 space-y-5">

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-center py-24">
            <div className="text-center space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="w-12 h-12 border-[3px] border-rose-100 border-t-rose-500 rounded-full animate-spin" />
                <ShoppingBag className="w-4 h-4 text-rose-400 absolute inset-0 m-auto" />
              </div>
              <p className="text-sm text-gray-400 font-medium">Fetching your orders…</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-24 px-8">
            <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShoppingBag className="w-12 h-12 text-rose-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No orders yet</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8 leading-relaxed">
              When you place an order it will appear here. Start exploring our products!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold px-8 py-3.5 rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-200"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Products
            </Link>
          </div>
        )}

        {!isLoading && orders && orders.length > 0 && (
          <>
            {/* Filter + Search */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Search by order number…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition bg-gray-50/50 placeholder-gray-300"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 p-3 overflow-x-auto scrollbar-none">
                {FILTERS.map((f) => {
                  const count = f.value === 'all' ? (orders?.length || 0) : (counts[f.value] || 0);
                  const active = filter === f.value;
                  const cfg = STATUS_CONFIG[f.value];
                  return (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                        active
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                      }`}
                    >
                      {f.value !== 'all' && cfg && (
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-white/70' : cfg.dot}`} />
                      )}
                      {f.label}
                      {count > 0 && (
                        <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-black ml-0.5 ${
                          active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* No match */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16 px-8">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-7 h-7 text-gray-200" />
                </div>
                <p className="text-sm font-bold text-gray-600 mb-1">No orders match</p>
                <p className="text-xs text-gray-400 mb-4">Try a different filter or clear your search</p>
                <button
                  onClick={() => { setFilter('all'); setSearchQuery(''); }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 px-4 py-2 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order: any) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = cfg.icon;
                  const itemImages = order.items?.slice(0, 4).filter((i: any) => i.product?.images?.[0]?.url) || [];

                  return (
                    <Link
                      href={`/account/orders/${order.id}`}
                      key={order.id || order.orderNumber}
                      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-200 hover:bg-gradient-to-br hover:from-white hover:to-primary-50/20 transition-all duration-300 overflow-hidden overflow-y-hidden block"
                    >
                      {/* Status stripe - animated on hover */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.gradient} transition-all group-hover:h-2`} />

                      <div className="p-6">
                        {/* Header row - Enhanced layout */}
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Status Icon with enhanced styling */}
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                              <StatusIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-1">
                                <p className="text-lg font-black text-gray-900">Order #{order.orderNumber}</p>
                                <span className="text-xs text-gray-400">ID: {order.id?.slice(0, 8)}</span>
                              </div>
                              <p className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          {/* Enhanced status badge */}
                          <div className={`text-xs font-black px-4 py-2 rounded-full border-2 ${cfg.text} ${cfg.bg} ${cfg.border} flex-shrink-0 group-hover:scale-105 transition-transform duration-300 text-center min-w-max`}>
                            {cfg.label}
                          </div>
                        </div>

                        {/* Product showcase - Improved with better visual hierarchy */}
                        {itemImages.length > 0 && (
                          <div className="mb-5 pb-5 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</p>
                            <div className="flex gap-3">
                              {itemImages.map((item: any, idx: number) => (
                                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border-2 border-gray-100 flex-shrink-0 group-hover:border-primary-200 transition-colors shadow-sm">
                                  <SafeImage
                                    src={item.product.images[0].url}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                  {item.quantity > 1 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white shadow-md">
                                      {item.quantity}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {order.items?.length > 4 && (
                                <div className="w-16 h-16 rounded-xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:border-primary-200 transition-colors shadow-sm">
                                  <span className="text-xs font-bold text-gray-500">+{order.items.length - 4}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Items text summary - Enhanced typography */}
                        <div className="space-y-2 mb-5">
                          {order.items?.slice(0, 2).map((item: any) => (
                            <div key={item.id || item.product?.sku} className="flex items-center justify-between gap-3 group/item">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 font-semibold line-clamp-1 group-hover/item:text-primary-600 transition-colors">
                                  {item.product?.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900 flex-shrink-0">NPR {Number(item.total).toLocaleString()}</p>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-xs text-gray-400 font-medium pt-1 flex items-center gap-1">
                              <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
                              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        {/* Footer - Enhanced with better spacing and CTA */}
                        <div className="flex items-center justify-between gap-4 pt-5 border-t border-gray-100">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Amount</p>
                            <p className="text-xl font-black text-gray-900 mt-0.5">NPR {Number(order.total).toLocaleString()}</p>
                          </div>
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="flex items-center gap-2.5 text-sm font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-rose-500 hover:from-primary-600 hover:to-rose-600 text-white border border-transparent hover:border-primary-300/30 shadow-md hover:shadow-lg transition-all group-hover:translate-x-0.5 duration-300 flex-shrink-0 whitespace-nowrap"
                          >
                            View Details 
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </Link>
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
