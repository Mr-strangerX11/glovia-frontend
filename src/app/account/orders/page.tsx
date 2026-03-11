'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useOrders } from '@/hooks/useData';
import { Package, Loader2, ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { orders, isLoading } = useOrders();

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-700 border border-blue-200',
      PROCESSING: 'bg-purple-100 text-purple-700 border border-purple-200',
      SHIPPED: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
      DELIVERED: 'bg-green-100 text-green-700 border border-green-200',
      CANCELLED: 'bg-red-100 text-red-700 border border-red-200',
      RETURNED: 'bg-gray-100 text-gray-600 border border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-600 border border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 pt-10 pb-20">
        <div className="container max-w-4xl">
          <div className="flex items-end justify-between">
            <div className="text-white">
              <p className="text-rose-200 text-sm font-medium mb-1">My Account</p>
              <h1 className="text-3xl font-bold">My Orders</h1>
              <p className="text-pink-100 mt-1 text-sm">
                {orders?.length
                  ? `${orders.length} order${orders.length > 1 ? 's' : ''} placed`
                  : 'No orders yet'}
              </p>
            </div>
            <Link
              href="/account"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors border border-white/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Account
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl -mt-10 pb-16">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-400">Loading your orders…</p>
            </div>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16 px-8">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-6">Start shopping to place your first order</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-sm"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id || order.orderNumber} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                {/* Order header */}
                <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-800">Order #{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="border-t border-gray-50 px-6 py-4 space-y-3">
                  {order.items?.slice(0, 2).map((item: any) => (
                    <div key={item.id || item.product?.sku} className="flex gap-3 items-center">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm text-gray-900 flex-shrink-0">NPR {Number(item.total).toLocaleString()}</p>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-xs text-gray-400 pl-1">+{order.items.length - 2} more items</p>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-50 px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Total Amount</p>
                    <p className="text-xl font-bold text-rose-600">NPR {Number(order.total).toLocaleString()}</p>
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-xl transition-colors"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

