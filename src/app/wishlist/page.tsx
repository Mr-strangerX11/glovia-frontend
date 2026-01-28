"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/hooks/useData";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function WishlistPage() {
  const { user, isChecking } = useAuthGuard();
  const { wishlist, isLoading } = useWishlist();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Loading...</p>
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-10 space-y-6">
        <div>
          <p className="text-sm text-gray-500">Saved</p>
          <h1 className="text-3xl font-bold">Your Wishlist</h1>
        </div>

        {isLoading && <p className="text-gray-600">Loading wishlist...</p>}
        {!isLoading && (!wishlist || wishlist.length === 0) && (
          <p className="text-gray-600">No saved items yet.</p>
        )}

        {!isLoading && wishlist && wishlist.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <Link key={item.id} href={`/products/${item.product.slug}`} className="card group">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-xs text-gray-500">{item.product.category?.name}</p>
                  <h3 className="font-semibold line-clamp-2">{item.product.name}</h3>
                  <p className="text-primary-600 font-bold">NPR {item.product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
