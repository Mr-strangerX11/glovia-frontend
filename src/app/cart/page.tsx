"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useData";
import { cartAPI } from "@/lib/api";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, isLoading, mutate } = useCart();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-white">
      <div className="container py-10 space-y-6">
        <div>
          <p className="text-sm text-gray-500">Cart</p>
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        {isLoading && <p className="text-gray-600">Loading cart...</p>}
        {!isLoading && items.length === 0 && <p className="text-gray-600">Your cart is empty.</p>}

        {!isLoading && items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id || item.product?.slug} className="card p-4 flex gap-4 items-center">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
                        disabled={updatingItemId === item.id || item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm text-gray-700">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
                        disabled={updatingItemId === item.id}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold">NPR {item.product.price}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      disabled={updatingItemId === item.id}
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-6 space-y-3">
              <h3 className="text-lg font-semibold">Summary</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>NPR {total}</span>
              </div>
              <Link href="/checkout" className="btn-primary w-full text-center">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
