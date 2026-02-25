'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { vendorAPI, categoriesAPI, brandsAPI } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ImageUploadField from '@/components/ImageUploadField';

export default function VendorNewProductPage() {
    const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const { user, isChecking } = useAuthGuard({ roles: ['VENDOR'] });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    sku: '',
    categoryId: '',
    brandId: '',
    images: [''],
    isFeatured: false,
    isNew: true,
  });

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchBrands();
    }
  }, [user]);

  const getCategoryId = (category: any) => category?.id || category?._id || '';
  const getBrandId = (brand: any) => brand?.id || brand?._id || '';

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const { data } = await categoriesAPI.getAll();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true);
      const { data } = await brandsAPI.getList();
      setBrands(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('Failed to load brands:', error);
      toast.error('Failed to load brands');
      setBrands([]);
    } finally {
      setBrandsLoading(false);
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
    setErrors({});
    // Client-side validation
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required.';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required.';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required.';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0.';
    if (formData.stockQuantity < 0) newErrors.stockQuantity = 'Stock cannot be negative.';
    // Basic check for at least one image
    const imageUrls = formData.images.filter((img) => img.trim() !== '');
    if (imageUrls.length === 0) newErrors.images = 'At least one product image is required.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form.');
      return;
    }
    setLoading(true);
    try {
      await vendorAPI.createProduct({
        ...formData,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      toast.success('Product created successfully');
      router.push('/vendor/products');
    } catch (error: any) {
      // Show backend error
      const msg = error.response?.data?.message || 'Failed to create product';
      toast.error(msg);
      if (typeof msg === 'string' && msg.toLowerCase().includes('sku')) setErrors((e:any)=>({...e,sku:msg}));
      if (typeof msg === 'string' && msg.toLowerCase().includes('slug')) setErrors((e:any)=>({...e,slug:msg}));
    } finally {
      setLoading(false);
    }
  };

  if (isChecking || !user) {
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
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-gray-600">Create a new product</p>
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
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
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
              {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug}</p>}
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
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
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
                {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
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
                {errors.stockQuantity && <p className="text-sm text-red-600 mt-1">{errors.stockQuantity}</p>}
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
                {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku}</p>}
              </div>

              <div>
                <label className="label">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="input"
                  disabled={categoriesLoading}
                  required
                >
                {errors.categoryId && <p className="text-sm text-red-600 mt-1">{errors.categoryId}</p>}
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                  </option>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={getCategoryId(cat) || cat.name} value={getCategoryId(cat)}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {categoriesLoading ? 'Loading...' : 'No categories available'}
                    </option>
                  )}
                </select>
                {!categoriesLoading && (!Array.isArray(categories) || categories.length === 0) && (
                  <p className="text-sm text-red-600 mt-1">⚠️ Failed to load categories. Please refresh the page.</p>
                )}
              </div>

              <div>
                <label className="label">Brand</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                  className="input"
                >
                  <option value="">Select Brand (Optional)</option>
                  {brands.map((brand) => (
                    <option key={getBrandId(brand) || brand.name} value={getBrandId(brand)}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Product Images</label>
              <ImageUploadField
                images={formData.images.filter(img => img.trim() !== '')}
                onImagesChange={(urls) => setFormData({ ...formData, images: urls })}
                maxImages={5}
              />
              {errors.images && <p className="text-sm text-red-600 mt-1">{errors.images}</p>}
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
                    Creating...
                  </>
                ) : (
                  'Create Product'
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
