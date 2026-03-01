"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { productsAPI, cartAPI, wishlistAPI, reviewsAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
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
  RotateCcw,
  Zap,
  MapPin,
  Clock3,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWishlist } from "@/hooks/useData";
import { GLOVIA_AI_SHORTCUTS, inferSmartTags } from "@/data/beautyCatalog";

const Recommendations = dynamic(() => import('@/components/Recommendations'), {
  ssr: false,
  loading: () => null,
});

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";
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
  const [viewerRotation, setViewerRotation] = useState({ x: -7, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [deliveryDistrict, setDeliveryDistrict] = useState("Kathmandu");
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

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

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to continue checkout");
      router.push("/auth/login");
      return;
    }

    try {
      setIsAddingToCart(true);
      await cartAPI.add({
        productId: product._id,
        quantity,
      });
      toast.success("Redirecting to checkout...");
      router.push("/checkout");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to continue checkout");
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

  const deliveryEstimate = (() => {
    const normalized = deliveryDistrict.toLowerCase();
    if (["kathmandu", "lalitpur", "bhaktapur"].includes(normalized)) {
      return { eta: "Same day or next day", cost: 99 };
    }
    if (["pokhara", "chitwan", "butwal", "dharan"].includes(normalized)) {
      return { eta: "1-2 business days", cost: 149 };
    }
    return { eta: "2-4 business days", cost: 199 };
  })();

  const productTags = inferSmartTags(product);
  const skinTypeCompatibility = Array.isArray(product?.suitableFor) && product.suitableFor.length > 0
    ? product.suitableFor.map((item: string) => item.replace("_", " "))
    : ["Oily", "Dry", "Combination", "Sensitive", "Normal"];

  const productFaqs = [
    {
      q: `Is ${product?.name} authentic?`,
      a: "Yes. Glovia verifies sourcing and quality checks before dispatch.",
    },
    {
      q: "How long does delivery take in Nepal?",
      a: `${deliveryEstimate.eta} depending on district and current order volume.`,
    },
    {
      q: "Can I return this product if it does not suit my skin?",
      a: "Yes, eligible products support return/exchange according to our policy.",
    },
  ];

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

  const handleViewerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - bounds.left) / bounds.width) * 100;
    const relativeY = ((e.clientY - bounds.top) / bounds.height) * 100;
    setZoomOrigin({ x: Math.min(100, Math.max(0, relativeX)), y: Math.min(100, Math.max(0, relativeY)) });

    if (!dragStartRef.current) {
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const rotateY = ((e.clientX - centerX) / bounds.width) * 16;
      const rotateX = -((e.clientY - centerY) / bounds.height) * 10;
      setViewerRotation({ x: rotateX, y: rotateY });
      return;
    }

    const diffX = e.clientX - dragStartRef.current.x;
    const diffY = e.clientY - dragStartRef.current.y;

    setViewerRotation((prev) => ({
      x: Math.max(-18, Math.min(18, prev.x - diffY * 0.14)),
      y: Math.max(-28, Math.min(28, prev.y + diffX * 0.22)),
    }));

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleViewerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const resetViewer = () => {
    setViewerRotation({ x: -7, y: 0 });
    setIsZooming(false);
    setZoomOrigin({ x: 50, y: 50 });
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
  };

  const previousImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="aspect-square bg-gradient-to-br from-white to-slate-50 rounded-2xl overflow-hidden border border-gray-200 relative group [perspective:1300px]"
            >
              <motion.div
                className="relative h-full w-full [transform-style:preserve-3d]"
                animate={{
                  rotateX: viewerRotation.x,
                  rotateY: viewerRotation.y,
                }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
                onMouseMove={handleViewerMouseMove}
                onMouseDown={handleViewerMouseDown}
                onMouseUp={() => {
                  dragStartRef.current = null;
                }}
                onMouseLeave={() => {
                  dragStartRef.current = null;
                  if (!isZooming) {
                    setViewerRotation({ x: -7, y: 0 });
                  }
                }}
                onClick={() => setIsZooming((prev) => !prev)}
              >
                <Image
                  src={productImages[selectedImage].url}
                  alt={product.name}
                  fill
                  className={`object-contain p-4 transition-transform duration-300 ${isZooming ? "scale-[1.55] cursor-zoom-out" : "cursor-zoom-in"}`}
                  style={{ transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
                  priority
                />
              </motion.div>

              <div className="absolute bottom-3 left-3 z-20 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 backdrop-blur">
                Drag to rotate · Tap to zoom
              </div>

              <div className="absolute right-3 top-3 z-20 flex gap-2">
                <button
                  onClick={previousImage}
                  className="rounded-full border border-white/60 bg-white/90 p-2 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="rounded-full border border-white/60 bg-white/90 p-2 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={resetViewer}
                  className="rounded-full border border-white/60 bg-white/90 p-2 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white"
                  aria-label="Reset viewer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

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
            </motion.div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image: any, index: number) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-primary-600"
                        : "border-gray-200"
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </motion.button>
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

            {/* Price & Discount */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-primary-600">
                NPR {discountedPrice?.toLocaleString()}
              </span>
              {product.discountPercentage > 0 && (
                <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  {product.discountPercentage}% OFF
                </span>
              )}
              {product.compareAtPrice && product.compareAtPrice > discountedPrice && (
                <span className="text-gray-400 line-through text-base">
                  NPR {product.compareAtPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="mb-3 flex flex-wrap gap-2">
                {productTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
                    {tag}
                  </span>
                ))}
              </div>
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

            <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary-800">
                <MapPin className="h-4 w-4" />
                Delivery Estimator
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  className="input"
                  value={deliveryDistrict}
                  onChange={(e) => setDeliveryDistrict(e.target.value)}
                >
                  {[
                    "Kathmandu",
                    "Lalitpur",
                    "Bhaktapur",
                    "Pokhara",
                    "Chitwan",
                    "Butwal",
                    "Dharan",
                    "Biratnagar",
                    "Nepalgunj",
                  ].map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                <div className="rounded-xl border border-white/70 bg-white px-3 py-2 text-sm text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-primary-600" />
                    ETA: <span className="font-semibold">{deliveryEstimate.eta}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Shipping cost: NPR {deliveryEstimate.cost}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">Skin Type Compatibility</h3>
              <div className="flex flex-wrap gap-2">
                {skinTypeCompatibility.map((skinType: string) => (
                  <span key={skinType} className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {skinType}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
              <h3 className="mb-2 text-sm font-semibold text-indigo-900">AI Beauty Assistant</h3>
              <div className="flex flex-wrap gap-2">
                {GLOVIA_AI_SHORTCUTS.map((prompt) => (
                  <Link
                    key={prompt}
                    href={`/ai?prompt=${encodeURIComponent(`${prompt} for ${product.name}`)}`}
                    className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    {prompt}
                  </Link>
                ))}
              </div>
            </div>

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
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                  </motion.button>
                  <motion.button
                    onClick={handleBuyNow}
                    disabled={isAddingToCart}
                    className="btn-outline flex-1 flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Zap className="w-5 h-5" />
                    Buy Now
                  </motion.button>
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
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-800">
                High-conversion trust signals: verified payments, authentic inventory, and fast local fulfillment.
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
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700">{product.description || "No detailed description provided yet."}</p>
            </div>
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

            <div>
              <h3 className="font-semibold text-lg mb-2">Frequently Asked Questions</h3>
              <div className="space-y-2">
                {productFaqs.map((faq) => (
                  <div key={faq.q} className="rounded-lg border border-gray-200 p-3">
                    <p className="text-sm font-semibold text-gray-900">{faq.q}</p>
                    <p className="mt-1 text-sm text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
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

        {/* AI Recommendations Section */}
        <Recommendations userId={user?.id} productId={product?._id} />
      </div>

      {product.stockQuantity > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
          <div className="container flex items-center gap-3 px-0">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-gray-500">{product.name}</p>
              <p className="text-base font-bold text-primary-700">NPR {discountedPrice?.toLocaleString()}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isAddingToCart}
              className="rounded-xl border border-primary-600 px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
