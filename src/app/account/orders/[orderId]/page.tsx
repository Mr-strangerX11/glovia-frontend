
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Clock, Truck, Home, AlertCircle, Phone, MessageSquare,
  MapPin, Calendar, Package, Copy, Download, RotateCcw, HeadphonesIcon
} from "lucide-react";

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
    } catch (error) {
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

  const getStatusTimeline = (status: string) => {
    const steps = [
      { id: 'PENDING', label: 'Order Placed', icon: Package },
      { id: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
      { id: 'PROCESSING', label: 'Processing', icon: Clock },
      { id: 'SHIPPED', label: 'Shipped', icon: Truck },
      { id: 'DELIVERED', label: 'Delivered', icon: Home },
    ];

    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statuses.indexOf(status);

    return steps.map((step, idx) => ({
      ...step,
      active: idx <= currentIndex,
      current: idx === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
            <p className="text-gray-500 mt-2">This order doesn't exist or has been removed.</p>
          </div>
          <Link href="/account/orders" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-bold">
            <ArrowLeft className="w-4 h-4" />
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const timeline = getStatusTimeline(order.status);
  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="container max-w-6xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/account/orders" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-rose-600" />
            <span className="font-bold text-rose-700">{order.status}</span>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <h2 className="font-bold text-lg text-gray-900 mb-8">Order Status</h2>
              <div className="flex justify-between items-center">
                {timeline.map((step, idx) => {
                  const Step = step.icon;
                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                      <div className="flex items-center w-full justify-center relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          step.active
                            ? step.current
                              ? 'bg-rose-500 border-rose-500 text-white scale-110'
                              : 'bg-rose-100 border-rose-300 text-rose-600'
                            : 'bg-gray-100 border-gray-200 text-gray-400'
                        }`}>
                          <Step className="w-5 h-5" />
                        </div>
                        {idx < timeline.length - 1 && (
                          <div className={`absolute left-1/2 top-1/2 w-full h-0.5 -translate-y-1/2 ml-6 ${
                            step.active ? 'bg-rose-300' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                      <p className="text-xs font-bold text-gray-600 mt-3 text-center">{step.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-bold">Estimated Delivery:</span> {estimatedDelivery.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </motion.div>

            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
            >
              <h2 className="font-bold text-lg text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any) => (
                    <div key={item.id || item._id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{item.product?.name || 'Product'}</h3>
                        <p className="text-sm text-gray-500 mt-1">SKU: {item.product?.sku}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-gray-600">Quantity: <span className="font-bold">{item.quantity}</span></span>
                          <span className="text-lg font-bold text-rose-600">NPR {Number(item.total).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No items in this order</p>
                )}
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-6 h-6 text-rose-500" />
                <h2 className="font-bold text-lg text-gray-900">Delivery Address</h2>
              </div>
              {order.address ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="font-semibold text-gray-900">{order.address.fullName}</p>
                  <p className="text-gray-600 mt-2">{order.address.area}</p>
                  <p className="text-gray-600">{order.address.district}</p>
                  {order.address.phone && <p className="text-gray-600 mt-2">Phone: {order.address.phone}</p>}
                </div>
              ) : (
                <p className="text-gray-500 py-4">Address not available</p>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20"
            >
              <h2 className="font-bold text-lg text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">NPR {Number(order.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-gray-900">NPR {Number(order.deliveryCharge || 0).toLocaleString()}</span>
                </div>
                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-NPR {Number(order.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-rose-600">NPR {Number(order.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3"
            >
              {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  <AlertCircle className="w-4 h-4" />
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
              {order.status === "DELIVERED" && (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                  Request Return
                </button>
              )}
              <Link href="/track-order" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors">
                <Truck className="w-4 h-4" />
                Track Shipment
              </Link>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 font-bold hover:bg-gray-50 transition-colors rounded-xl border border-gray-200">
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-200 p-6"
            >
              <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <Link href="/contact" className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                  <MessageSquare className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Live Chat Support</p>
                    <p className="text-gray-600 text-xs">Available 9am - 6pm</p>
                  </div>
                </Link>
                <Link href="tel:+9779700003327" className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                  <Phone className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Call Us</p>
                    <p className="text-gray-600 text-xs">+977 9700003327</p>
                  </div>
                </Link>
                <Link href="mailto:support@glovia.com" className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                  <HeadphonesIcon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Email Support</p>
                    <p className="text-gray-600 text-xs">glovianepal@gmailS.com</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
