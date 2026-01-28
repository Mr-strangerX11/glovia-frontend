"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, Suspense } from "react";
import { useProducts, useCategories } from "@/hooks/useData";
import Image from "next/image";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || searchParams.get("q") || undefined;

  const { products, isLoading } = useProducts({ category, search });
  const { categories } = useCategories();

  const title = useMemo(() => {
    if (category) return `Products - ${category}`;
    if (search) return `Search: ${search}`;
    return "All Products";
  }, [category, search]);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-10 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Catalog</p>
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search products..."
              defaultValue={search || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch((e.target as HTMLInputElement).value);
              }}
              className="input w-64"
            />
            <div className="flex flex-wrap gap-2">
              <Link href="/products" className={`chip ${!category ? "chip-active" : ""}`}>
                All
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className={`chip ${category === cat.slug ? "chip-active" : ""}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {isLoading && <p className="text-gray-600">Loading products...</p>}
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

  export default function ProductsPage() {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <ProductsContent />
      </Suspense>
    );
  }
