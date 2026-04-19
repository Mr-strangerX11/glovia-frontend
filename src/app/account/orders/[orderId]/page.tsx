
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import { AddressDisplay } from "@/components/AddressDisplay";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, CheckCircle2, Clock, Truck, Home, AlertCircle, Phone, MessageSquare,
  MapPin, Package, Download, RotateCcw, HeadphonesIcon, Calendar, Hash,
  ShoppingBag,
} from "lucide-react";

const STATUS_STEPS = [
  { id: 'PENDING',    label: 'Order Placed', icon: Package },
  { id: 'CONFIRMED',  label: 'Confirmed',    icon: CheckCircle2 },
  { id: 'PROCESSING', label: 'Processing',   icon: Clock },
  { id: 'SHIPPED',    label: 'Shipped',      icon: Truck },
  { id: 'DELIVERED',  label: 'Delivered',    icon: Home },
];

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  PENDING:    { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  gradient: 'from-amber-400 to-orange-400' },
  CONFIRMED:  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   gradient: 'from-blue-400 to-cyan-400' },
  PROCESSING: { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200', gradient: 'from-violet-400 to-purple-400' },
  SHIPPED:    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200', gradient: 'from-indigo-400 to-blue-500' },
  DELIVERED:  { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',gradient: 'from-emerald-400 to-teal-400' },
  CANCELLED:  { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    gradient: 'from-red-400 to-rose-400' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (params && params.orderId) fetchOrder();
    // eslint-disable-next-line
  }, [params]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      if (!params || !params.orderId) return;
      const { data } = await ordersAPI.getById(params.orderId as string);
      setOrder(data);
    } catch {
      toast.error("Failed to load order details");
      router.push("/account/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await ordersAPI.cancel(order.id || order._id);
      toast.success("Order cancelled");
      fetchOrder();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center space-y-4">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 border-[3px] border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            <ShoppingBag className="w-5 h-5 text-rose-400 absolute inset-0 m-auto" />
          </div>
          <p className="text-gray-500 font-medium">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-gray-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
            <p className="text-gray-500 mt-2">This order doesn't exist or has been removed.</p>
          </div>
          <Link href="/account/orders" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 px-5 py-2.5 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentIndex = statuses.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const statusBadge = STATUS_BADGE[order.status] || STATUS_BADGE.PENDING;

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  return (
    <div className="min-h-screen bg-gray-50/80 pb-16">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="container max-w-6xl py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/account/orders"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="border-l border-gray-100 pl-3">
              <h1 className="text-base font-black text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="container max-w-6xl mt-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Status Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`h-1.5 w-full bg-gradient-to-r ${statusBadge.gradient}`} />
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bold text-base text-gray-900">Shipment Status</h2>
                  {!isCancelled && currentIndex >= 0 && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      Step {currentIndex + 1} of {STATUS_STEPS.length}
                    </span>
                  )}
                </div>

                {isCancelled ? (
                  <div className="flex items-center gap-4 p-5 bg-red-50 border border-red-100 rounded-xl">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-red-700">Order Cancelled</p>
                      <p className="text-sm text-red-500/80 mt-0.5">This order has been cancelled and will not be processed.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100">
                      <div
                        className={`h-full bg-gradient-to-r ${statusBadge.gradient} transition-all duration-500`}
                        style={{ width: `${currentIndex >= 0 ? (currentIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                      />
                    </div>

                    <div className="relative flex justify-between">
                      {STATUS_STEPS.map((step, idx) => {
                        const StepIcon = step.icon;
                        const isDone = idx < currentIndex;
                        const isCurrent = idx === currentIndex;
                        return (
                          <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                              isCurrent
                                ? `bg-gradient-to-br ${statusBadge.gradient} border-transparent text-white scale-110 shadow-lg`
                                : isDone
                                  ? 'bg-white border-gray-300 text-gray-500'
                                  : 'bg-white border-gray-200 text-gray-300'
                            }`}>
                              <StepIcon className="w-4 h-4" />
                            </div>
                            <p className={`text-[10px] font-bold mt-2.5 text-center leading-tight ${
                              isCurrent ? 'text-gray-900' : isDone ? 'text-gray-500' : 'text-gray-300'
                            }`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isCancelled && (
                  <div className="mt-6 p-3.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                    <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      <span className="font-bold">Estimated Delivery:</span>{' '}
                      {estimatedDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="font-bold text-base text-gray-900 mb-5 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-gray-400" />
                Order Items
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                  {order.items?.length || 0}
                </span>
              </h2>
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any) => (
                    <div key={item.id || item._id} className="flex gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">{item.product?.name || 'Product'}</h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {item.product?.sku}
                        </p>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">Qty: {item.quantity}</span>
                          <span className="text-base font-black text-rose-600">NPR {Number(item.total).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">No items in this order</p>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="font-bold text-base text-gray-900 mb-5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Delivery Address
              </h2>
              {order.address ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <AddressDisplay address={order.address} />
                </div>
              ) : (
                <p className="text-gray-400 text-sm py-4">Address not available</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <h2 className="font-bold text-base text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">NPR {Number(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-semibold text-gray-900">NPR {Number(order.deliveryCharge || 0).toLocaleString()}</span>
                </div>
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-medium">Discount</span>
                    <span className="font-semibold text-emerald-600">-NPR {Number(order.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-black text-rose-600">NPR {Number(order.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2.5">
              <h2 className="font-bold text-sm text-gray-700 mb-3">Order Actions</h2>

              {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {cancelling ? "Cancelling…" : "Cancel Order"}
                </button>
              )}
              {order.status === "DELIVERED" && (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors text-sm">
                  <RotateCcw className="w-4 h-4" />
                  Request Return
                </button>
              )}
              <Link
                href="/track-order"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-rose-600 font-bold rounded-xl hover:from-rose-100 hover:to-pink-100 transition-colors text-sm"
              >
                <Truck className="w-4 h-4" />
                Track Shipment
              </Link>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 transition-colors rounded-xl border border-gray-200 text-sm">
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold text-sm mb-4">Need Help?</h3>
              <div className="space-y-3">
                <Link href="/contact" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-colors">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Live Chat Support</p>
                    <p className="text-[10px] text-rose-100/80">Available 9am – 6pm</p>
                  </div>
                </Link>
                <Link href="tel:+9779700003327" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-colors">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Call Us</p>
                    <p className="text-[10px] text-rose-100/80">+977 9700003327</p>
                  </div>
                </Link>
                <Link href="mailto:support@glovia.com" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-colors">
                  <HeadphonesIcon className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Email Support</p>
                    <p className="text-[10px] text-rose-100/80">glovianepal@gmail.com</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
