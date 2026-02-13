"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Heart, ShoppingCart, Star, Check, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { productsAPI, cartAPI, wishlistAPI, reviewsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await productsAPI.getBySlug(params.slug as string);
      setProduct(data);

      // Fetch reviews
      if (data._id) {
        try {
          const reviewsRes = await reviewsAPI.getByProduct(data._id);
          setReviews(reviewsRes.data || []);
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      }

      // Fetch related products
      if (data.categoryId) {
        try {
          const relatedRes = await productsAPI.getAll({
            categoryId: typeof data.categoryId === 'object' ? data.categoryId._id : data.categoryId,
            limit: 4,
          });
          setRelatedProducts(
            relatedRes.data.data.filter((p: any) => p._id !== data._id).slice(0, 4)
          );
        } catch (error) {
          console.error("Error fetching related products:", error);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Product not found");
      router.push("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      router.push("/auth/login");
      return;
    }

    try {
      setAdding(true);
      await cartAPI.add({ productId: product._id, quantity });
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      router.push("/auth/login");
      return;
    }

    try {
      await wishlistAPI.add(product._id);
      toast.success("Added to wishlist!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const finalPrice = product.discountPercentage
    ? product.price - (product.price * product.discountPercentage) / 100
    : product.price;

  const images = product.images && product.images.length > 0
    ? product.images.map((img: any) => typeof img === 'string' ? img : img.url)
    : ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-sm p-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? "border-primary-600" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.category && (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-sm text-primary-600 hover:underline"
                >
                  {product.category.name}
                </Link>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.averageRating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">₨{finalPrice.toFixed(2)}</span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₨{product.price}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                      {product.discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stockQuantity > 0 ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">In Stock ({product.stockQuantity} available)</span>
                </>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Quantity & Actions */}
            {product.stockQuantity > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {adding ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className="btn-outline px-4"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            {product.ingredients && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Ingredients</h2>
                <p className="text-gray-600">{product.ingredients}</p>
              </div>
            )}

            {product.benefits && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Benefits</h2>
                <p className="text-gray-600">{product.benefits}</p>
              </div>
            )}

            {product.howToUse && (
              <div>
                <h2 className="text-lg font-semibold mb-2">How to Use</h2>
                <p className="text-gray-600">{product.howToUse}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const pImages = p.images && p.images.length > 0
                  ? p.images.map((img: any) => typeof img === 'string' ? img : img.url)
                  : ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"];
                const pFinalPrice = p.discountPercentage
                  ? p.price - (p.price * p.discountPercentage) / 100
                  : p.price;

                return (
                  <Link
                    key={p._id}
                    href={`/products/${p.slug}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={pImages[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{p.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold">₨{pFinalPrice.toFixed(2)}</span>
                        {p.discountPercentage > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ₨{p.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
