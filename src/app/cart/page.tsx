"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useData";

export default function CartPage() {
  const { cart, isLoading } = useCart();

  const total = cart?.total ?? 0;
  const items = cart?.items ?? [];

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
                <div key={item.id} className="card p-4 flex gap-4 items-center">
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
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">NPR {item.product.price}</p>
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
