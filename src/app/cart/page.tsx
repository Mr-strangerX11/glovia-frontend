"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useData";
import { cartAPI } from "@/lib/api";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Recommendations from '@/components/Recommendations';
import WalletInfo from '@/components/WalletInfo';
import LoyaltyInfo from '@/components/LoyaltyInfo';

export default function CartPage() {
  const { cart, isLoading, mutate } = useCart();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const userId = "user-123"; // logic to get user id from auth store or props

  const total = cart?.total ?? 0;
  const items = cart?.items ?? [];

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 pt-10 pb-20">
        <div className="container">
          <div className="text-white">
            <p className="text-rose-200 text-sm font-medium mb-1">Cart</p>
            <h1 className="text-3xl font-bold">Your Shopping Bag</h1>
            <p className="text-pink-100 mt-1 text-sm">{items.length} item{items.length !== 1 ? "s" : ""} ready for checkout</p>
          </div>
        </div>
      </div>

      <div className="container -mt-10 pb-12 space-y-6">
        {isLoading && (
          <div className="section-shell p-10 text-center">
            <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-3">Loading your cart...</p>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="section-shell py-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">Explore products and add your favorites to continue.</p>
            <Link href="/products" className="btn-primary rounded-xl px-6">
              Start Shopping
            </Link>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id || item.product?.slug} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 sm:p-5 flex gap-4 items-center hover:shadow-md transition-all">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    <Image
                      src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">{item.product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">NPR {Number(item.product.price || 0).toLocaleString()} each</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                        disabled={updatingItemId === item.id || item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold text-gray-700 min-w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                        disabled={updatingItemId === item.id}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-gray-900">NPR {Number((item.product.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                      disabled={updatingItemId === item.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4 h-fit sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              <div className="flex items-center gap-2 text-xs text-primary-700 bg-primary-50 border border-primary-100 rounded-lg px-3 py-2">
                <Sparkles className="w-3.5 h-3.5" />
                Free delivery above NPR 2,999
              </div>
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>NPR {Number(total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>NPR {Number(total || 0).toLocaleString()}</span>
                </div>
              </div>
              <Link href="/checkout" className="w-full btn-primary rounded-xl justify-center">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* AI Recommendations Section */}
      <Recommendations />
      <WalletInfo userId={userId} />
      <LoyaltyInfo userId={userId} />
    </div>
  );
}
