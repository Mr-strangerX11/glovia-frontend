"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useData";
import { cartAPI } from "@/lib/api";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles, Package,
  Truck, Shield, Tag, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const Recommendations = dynamic(() => import("@/components/Recommendations"), { ssr: false, loading: () => null });
const WalletInfo  = dynamic(() => import("@/components/WalletInfo"),  { ssr: false, loading: () => null });
const LoyaltyInfo = dynamic(() => import("@/components/LoyaltyInfo"), { ssr: false, loading: () => null });

function CartSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 animate-pulse">
      <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-8 bg-gray-100 rounded-lg w-28 mt-2" />
      </div>
      <div className="w-20 space-y-2">
        <div className="h-5 bg-gray-100 rounded" />
        <div className="h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function CartPage() {
  const { cart, isLoading, mutate } = useCart();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const total   = cart?.total ?? 0;
  const items   = cart?.items ?? [];
  const savings = items.reduce((acc: number, item: any) => {
    const original = item.product?.compareAtPrice || 0;
    const current  = item.product?.price || 0;
    return acc + Math.max(0, (original - current) * (item.quantity || 1));
  }, 0);

  const freeDeliveryThreshold = 2999;
  const remaining = Math.max(0, freeDeliveryThreshold - total);
  const freeDeliveryProgress = Math.min(100, (total / freeDeliveryThreshold) * 100);

  const handleUpdateQuantity = async (itemId: string, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    try {
      setUpdatingItemId(itemId);
      await cartAPI.update(itemId, nextQuantity);
      await mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItemId(itemId);
      await cartAPI.remove(itemId);
      await mutate();
      toast.success("Item removed");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 pt-10 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="container relative z-10">
          <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mb-2">Shopping</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" /> Your Bag
          </h1>
          <p className="text-pink-100 mt-1.5 text-sm">
            {isLoading ? "Loading…" : items.length > 0 ? `${items.length} item${items.length !== 1 ? "s" : ""} in your cart` : "Your cart is empty"}
          </p>
        </div>
      </div>

      <div className="container -mt-14 pb-24 md:pb-12">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <CartSkeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-20 px-8">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10 text-rose-300" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Your bag is empty</h2>
            <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8">Explore our collection and add your favorites.</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:opacity-90 transition">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Cart content */}
        {!isLoading && items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {/* Free delivery progress */}
              {remaining > 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs font-bold text-gray-700">
                      Add <span className="text-emerald-600">NPR {remaining.toLocaleString()}</span> more for <span className="text-emerald-600">free delivery!</span>
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${freeDeliveryProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3.5 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-700">You qualify for free delivery!</p>
                </div>
              )}

              {items.map((item: any) => {
                const isUpdating = updatingItemId === item.id;
                const lineTotal = (item.product?.price || 0) * (item.quantity || 1);
                return (
                  <div
                    key={item.id || item.product?.slug}
                    className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 transition-all ${isUpdating ? "opacity-60 scale-[0.99]" : "hover:shadow-md"}`}
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link href={`/products/${item.product?.slug}`} className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group">
                        <Image
                          src={item.product?.images?.[0]?.url || "/placeholder.jpg"}
                          alt={item.product?.name}
                          fill sizes="96px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product?.slug}`} className="hover:text-primary-600 transition-colors">
                          <h3 className="font-bold text-sm text-gray-800 line-clamp-2 leading-snug">{item.product?.name}</h3>
                        </Link>
                        {item.product?.category?.name && (
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">{item.product.category.name}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">NPR {Number(item.product?.price || 0).toLocaleString()} each</p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating}
                            className="ml-auto flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-black text-gray-900">NPR {lineTotal.toLocaleString()}</p>
                        {item.product?.compareAtPrice > item.product?.price && (
                          <p className="text-xs text-gray-400 line-through mt-0.5">
                            NPR {(item.product.compareAtPrice * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50">
                  <h3 className="text-sm font-bold text-gray-800">Order Summary</h3>
                </div>
                <div className="p-5 space-y-4">
                  {/* Free delivery badge */}
                  <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-xl px-3 py-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                    <p className="text-xs text-primary-700 font-semibold">Free delivery on orders above NPR 2,999</p>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal ({items.length} item{items.length > 1 ? "s" : ""})</span>
                      <span className="font-semibold text-gray-700">NPR {Number(total).toLocaleString()}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> You save</span>
                        <span className="font-bold">−NPR {savings.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery</span>
                      <span className={`font-semibold ${total >= freeDeliveryThreshold ? "text-emerald-600" : "text-gray-700"}`}>
                        {total >= freeDeliveryThreshold ? "Free" : "NPR 100"}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex justify-between">
                      <span className="text-base font-black text-gray-900">Total</span>
                      <span className="text-xl font-black text-rose-600">
                        NPR {(total >= freeDeliveryThreshold ? total : total + 100).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-700 transition shadow-lg hover:shadow-xl"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Trust badges */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { icon: Shield,   label: "Secure payment" },
                      { icon: Truck,    label: "Fast delivery" },
                      { icon: Package,  label: "Easy returns" },
                      { icon: Sparkles, label: "Quality assured" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                        <Icon className="w-3 h-3 text-gray-300 flex-shrink-0" /> {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href="/products"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-primary-200 hover:text-primary-500 hover:bg-primary-50 transition-all"
              >
                Continue Shopping <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <Recommendations />
      <WalletInfo userId="" />
      <LoyaltyInfo userId="" />

      {/* Mobile checkout bar */}
      {!isLoading && items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 border-t border-gray-100 px-4 py-3 backdrop-blur-md shadow-2xl md:hidden safe-area-pb">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">Total</p>
              <p className="text-lg font-black text-rose-600">NPR {Number(total).toLocaleString()}</p>
            </div>
            <Link
              href="/checkout"
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow"
            >
              Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
