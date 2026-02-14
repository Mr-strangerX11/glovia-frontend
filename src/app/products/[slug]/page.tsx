"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productsAPI, cartAPI, wishlistAPI, reviewsAPI } from "@/lib/api";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  ArrowLeft,
  Package,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWishlist } from "@/hooks/useData";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuthStore();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { wishlist, mutate: mutateWishlist } = useWishlist();

  useEffect(() => {
    fetchProductData();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const wishlistItems = wishlist || [];
    const productId = product.id || product._id;
    const alreadyWishlisted = wishlistItems.some((item: any) => {
      const itemProductId = item.product?.id || item.productId || item.product?._id;
      return itemProductId === productId;
    });
    setIsWishlisted(alreadyWishlisted);
  }, [product, wishlist]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const { data } = await productsAPI.getBySlug(slug);
      setProduct(data);

      // Fetch related products
      if (data.categoryId) {
        const relatedRes = await productsAPI.getAll({
          categoryId: data.categoryId,
          limit: 4,
        });
        setRelatedProducts(
          relatedRes.data.data.filter((p: any) => p._id !== data._id)
        );
      }

      // Fetch reviews
      try {
        const reviewsRes = await reviewsAPI.getByProduct(data._id);
        setReviews(reviewsRes.data);
      } catch (err) {
        // Reviews endpoint might not exist yet
        setReviews([]);
      }
    } catch (error: any) {
      toast.error("Product not found");
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
      setIsAddingToCart(true);
      await cartAPI.add({
        productId: product._id,
        quantity,
      });
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      router.push("/auth/login");
      return;
    }

    if (isWishlisted) {
      toast.success("Already in wishlist");
      return;
    }

    try {
      setIsAddingToWishlist(true);
      await wishlistAPI.add(product._id);
      await mutateWishlist();
      setIsWishlisted(true);
      toast.success("Added to wishlist!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const discountedPrice = product?.discountPercentage
    ? product.price - (product.price * product.discountPercentage) / 100
    : product?.price;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
          },
        ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              href="/products"
              className="text-gray-600 hover:text-gray-900"
            >
              Products
            </Link>
            {product.category && (
              <>
                <span className="text-gray-400">/</span>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 relative group">
              <Image
                src={productImages[selectedImage].url}
                alt={product.name}
                fill
                className="object-contain p-4"
                priority
              />
              {product.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {product.discountPercentage}% OFF
                </div>
              )}
              {product.isNewProduct && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  NEW
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-primary-600"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.brand && (
              <Link
                href={`/brands/${product.brand.slug}`}
                className="inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                {product.brand.name}
              </Link>
            )}

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.averageRating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.reviewCount || 0} reviews
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₨{discountedPrice?.toFixed(2)}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-xl text-gray-500 line-through">
                  ₨{product.price.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>

            {/* Stock Status */}
            <div>
              {product.stockQuantity > 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">
                    In Stock ({product.stockQuantity} available)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stockQuantity > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(
                            1,
                            Math.min(
                              product.stockQuantity,
                              parseInt(e.target.value) || 1
                            )
                          )
                        )
                      }
                      className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                    />
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.stockQuantity, quantity + 1)
                        )
                      }
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                      disabled={quantity >= product.stockQuantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    disabled={isAddingToWishlist}
                    className={`w-12 h-12 flex items-center justify-center border rounded-lg transition-colors ${
                      isWishlisted
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "text-red-500 fill-red-500" : "text-gray-700"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Truck className="w-5 h-5 text-primary-600" />
                <span>Free delivery on orders above NPR 2,999</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Shield className="w-5 h-5 text-primary-600" />
                <span>100% Authentic Products</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Package className="w-5 h-5 text-primary-600" />
                <span>Easy Returns & Exchanges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="container px-6 py-4">
              <h2 className="text-xl font-semibold">Product Details</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {product.ingredients && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Ingredients</h3>
                <p className="text-gray-700">{product.ingredients}</p>
              </div>
            )}
            {product.benefits && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Benefits</h3>
                <p className="text-gray-700">{product.benefits}</p>
              </div>
            )}
            {product.howToUse && (
              <div>
                <h3 className="font-semibold text-lg mb-2">How to Use</h3>
                <p className="text-gray-700">{product.howToUse}</p>
              </div>
            )}
            {product.sku && (
              <div>
                <h3 className="font-semibold text-lg mb-2">SKU</h3>
                <p className="text-gray-700">{product.sku}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/products/${relatedProduct.slug}`}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative">
                    <Image
                      src={
                        relatedProduct.images?.[0]?.url ||
                        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"
                      }
                      alt={relatedProduct.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-primary-600 font-bold">
                      ₨{relatedProduct.price}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
