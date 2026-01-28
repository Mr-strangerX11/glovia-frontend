"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useProducts } from "@/hooks/useData";
import Link from "next/link";
import Image from "next/image";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { products, isLoading } = useProducts({ search: query });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-10 space-y-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">Search</p>
          <h1 className="text-3xl font-bold">Find products</h1>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search for skincare, haircare, makeup..."
              className="input flex-1"
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>
        </div>

        {isLoading && <p className="text-gray-600">Searching...</p>}
        {!isLoading && (!products || products.length === 0) && (
          <p className="text-gray-600">No products found.</p>
        )}

        {!isLoading && products && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`} className="card group">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-xs text-gray-500">{product.category?.name}</p>
                  <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                  <p className="text-primary-600 font-bold">NPR {product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

  export default function SearchPage() {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <SearchContent />
      </Suspense>
    );
  }
