"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, TextArea } from '@/components/ui';
import toast from 'react-hot-toast';
import { flashDealsAPI, uploadAPI, productsAPI } from '@/lib/api';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EditFlashDealPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = (params?.id || '') as string;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    products: [] as any[],
    startTime: '',
    endTime: '',
    adImage: '',
    displayOrder: 0,
  });

  // Load existing flash deal data
  useEffect(() => {
    const loadDeal = async () => {
      if (!dealId) {
        router.push('/admin/flash-deals');
        return;
      }

      try {
        setInitialLoading(true);
        const res = await flashDealsAPI.getById(dealId);
        const deal = res.data?.data;
        
        if (deal) {
          setFormData({
            title: deal.title,
            description: deal.description || '',
            products: deal.products || [],
            startTime: deal.startTime,
            endTime: deal.endTime,
            adImage: deal.adImage || '',
            displayOrder: deal.displayOrder || 0,
          });
        }
      } catch (error) {
        toast.error('Failed to load flash deal');
        router.push('/admin/flash-deals');
      } finally {
        setInitialLoading(false);
      }
    };

    loadDeal();
  }, [dealId, router]);

  // Search products
  const handleSearchProducts = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setProducts([]);
      return;
    }

    try {
      setSearchingProducts(true);
      const res = await productsAPI.getAll({ search: query, limit: 10 });
      setProducts(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to search products');
    } finally {
      setSearchingProducts(false);
    }
  };

  const handleSelectProduct = (product: any) => {
    const isAlreadySelected = formData.products.some((p) => p.productId === (product._id || product.id));

    if (isAlreadySelected) {
      toast.error('Product already selected');
      return;
    }

    const newProduct = {
      productId: product._id || product.id,
      productName: product.name,
      productImage: product.images?.[0]?.url || '',
      originalPrice: product.price,
      salePrice: product.price * 0.8,
    };

    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));

    setSearchQuery('');
    setShowProductSearch(false);
    setProducts([]);
    toast.success(`${product.name} added to deal`);
  };

  const handleRemoveProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.productId !== productId),
    }));
  };

  const handleUpdateProductPrice = (productId: string, field: 'originalPrice' | 'salePrice', value: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.productId === productId ? { ...p, [field]: value } : p
      ),
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, etc)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const res = await uploadAPI.uploadImage(file);
      const imageUrl = res.data?.data?.url || res.data?.url;
      
      if (!imageUrl) {
        throw new Error('No image URL received from server');
      }

      setFormData((prev) => ({
        ...prev,
        adImage: imageUrl,
      }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to upload image';
      toast.error(errorMsg);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      formData.products.length === 0 ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.adImage
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    for (const product of formData.products) {
      if (!product.originalPrice || !product.salePrice) {
        toast.error(`Please set prices for ${product.productName}`);
        return;
      }
      if (product.salePrice >= product.originalPrice) {
        toast.error(`Sale price must be less than original price for ${product.productName}`);
        return;
      }
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error('Start time must be before end time');
      return;
    }

    try {
      setLoading(true);
      await flashDealsAPI.update(dealId, formData);
      toast.success('Flash deal updated successfully');
      router.push('/admin/flash-deals');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update flash deal');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/flash-deals">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Flash Deal</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update flash deal information and products</p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        {/* Basic Information */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Deal Title *
            </label>
            <Input
              type="text"
              placeholder="E.g., Summer Beauty Sale"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <TextArea
              placeholder="Tell customers about this deal"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Display Order
            </label>
            <Input
              type="number"
              placeholder="0"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))
              }
            />
          </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Selection</h2>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Search & Select Products *
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products by name..."
                value={searchQuery}
                onFocus={() => setShowProductSearch(true)}
                onChange={(e) => handleSearchProducts(e.target.value)}
              />
              {showProductSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto z-10">
                  {searchingProducts ? (
                    <div className="p-4 text-center text-gray-600">Searching...</div>
                  ) : searchQuery.length < 2 ? (
                    <div className="p-4 text-center text-gray-600">Enter at least 2 characters to search</div>
                  ) : products.length === 0 ? (
                    <div className="p-4 text-center text-gray-600">No products found</div>
                  ) : (
                    products.map((product) => {
                      const isSelected = formData.products.some((p) => p.productId === (product._id || product.id));
                      return (
                        <button
                          key={product._id}
                          type="button"
                          onClick={() => handleSelectProduct(product)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                            isSelected ? 'bg-green-50 dark:bg-green-900/20 opacity-75' : ''
                          }`}
                        >
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {product.name}
                            {isSelected && ' ✓ (Added)'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">₹{product.price}</p>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Products List */}
          {formData.products.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Selected Products ({formData.products.length})</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {formData.products.map((product) => (
                  <div key={product.productId} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{product.productName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {product.productId}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.productId)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                      >
                        <X className="w-5 h-5 text-red-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Original Price (₹)
                        </label>
                        <Input
                          type="number"
                          value={product.originalPrice}
                          onChange={(e) =>
                            handleUpdateProductPrice(product.productId, 'originalPrice', parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Sale Price (₹)
                        </label>
                        <Input
                          type="number"
                          value={product.salePrice}
                          onChange={(e) =>
                            handleUpdateProductPrice(product.productId, 'salePrice', parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>

                    {product.originalPrice > 0 && product.salePrice > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-400">
                          Discount: {Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Duration</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                End Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        {/* Ad Image */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ad Banner Image</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Upload Banner Image *
            </label>
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50', 'dark:bg-blue-900/20');
                const files = e.dataTransfer.files;
                if (files?.length > 0) {
                  const fileInput = document.getElementById('ad-image-input') as HTMLInputElement;
                  if (fileInput) {
                    fileInput.files = files;
                    const event = new Event('change', { bubbles: true });
                    fileInput.dispatchEvent(event);
                  }
                }
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="ad-image-input"
              />
              <label htmlFor="ad-image-input" className="cursor-pointer">
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                  {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">PNG, JPG, WebP up to 10MB</p>
              </label>
            </div>

            {formData.adImage && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">✓ Image uploaded</p>
                <img src={formData.adImage} alt="Ad Banner" className="max-w-xs max-h-48 rounded-lg border border-gray-200 dark:border-gray-700" />
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button variant="primary" type="submit" disabled={loading} size="lg">
            {loading ? 'Updating...' : 'Update Flash Deal'}
          </Button>
          <Link href="/admin/flash-deals">
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
