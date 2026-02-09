'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { vendorAPI, categoriesAPI } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function VendorEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { user, isChecking } = useAuthGuard({ roles: ['VENDOR'] });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    sku: '',
    categoryId: '',
    images: [''],
    isFeatured: false,
    isNew: true,
  });

  useEffect(() => {
    if (user && productId) {
      fetchInitialData();
    }
  }, [user, productId]);

  const getCategoryId = (category: any) => category?.id || category?._id || '';

  const fetchInitialData = async () => {
    try {
      const [{ data: categoriesData }, { data: productData }] = await Promise.all([
        categoriesAPI.getAll(),
        vendorAPI.getProduct(productId),
      ]);

      const product = productData?.data || productData;
      const images =
        product?.images?.length
          ? product.images
              .map((img: any) => (typeof img === 'string' ? img : img?.url))
              .filter(Boolean)
          : [''];

      setCategories(categoriesData || []);
      setFormData({
        name: product?.name || '',
        slug: product?.slug || '',
        description: product?.description || '',
        price: product?.price || 0,
        stockQuantity: product?.stockQuantity || 0,
        sku: product?.sku || '',
        categoryId: product?.categoryId || '',
        images: images.length ? images : [''],
        isFeatured: product?.isFeatured || false,
        isNew: product?.isNew || false,
      });
    } catch (error) {
      toast.error('Failed to load product');
      router.push('/vendor/products');
    } finally {
      setFetching(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrls = formData.images.filter((img) => img.trim() !== '');
      await vendorAPI.updateProduct(productId, {
        ...formData,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      toast.success('Product updated successfully');
      router.push('/vendor/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (isChecking || !user || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/vendor/products"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            <h1 className="text-3xl font-bold">Edit Product</h1>
            <p className="text-gray-600">Update product details</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-6">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="input"
                required
              />
              <p className="text-sm text-gray-500 mt-1">URL-friendly version of the name</p>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px]"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Price (NPR) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="label">Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })
                  }
                  className="input"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">SKU *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={getCategoryId(cat) || cat.name} value={getCategoryId(cat)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Product Images</label>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="input flex-1"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  className="btn-outline text-sm"
                >
                  + Add Another Image
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Featured Product</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">New Arrival</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              <Link href="/vendor/products" className="btn-outline">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
