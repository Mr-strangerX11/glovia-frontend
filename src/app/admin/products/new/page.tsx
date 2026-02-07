'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI, categoriesAPI, brandsAPI } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Separate component to handle search params
function NewProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    discountPercentage: 0,
    stockQuantity: 0,
    sku: '',
    categoryId: '',
    brandId: '',
    images: [''],
    isFeatured: false,
    isNew: true,
  });

  useEffect(() => {
    // Get brand from query parameter (from product page)
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      setFormData(prev => ({ ...prev, brandId: brandParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchBrands();
    }
  }, [user]);

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
      const brandsList = Array.isArray(data) ? data : data?.data || [];
      setBrands(brandsList);
      
      // If brand was passed via query param, auto-populate the select
      const brandParam = searchParams.get('brand');
      if (brandParam && brandsList && brandsList.length > 0) {
        const foundBrand = brandsList.find((b: any) => b.id === brandParam || b.slug === brandParam);
        if (foundBrand) {
          setFormData(prev => ({ ...prev, brandId: foundBrand.id }));
          setSelectedBrand(foundBrand.name);
        }
      }
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
    setLoading(true);

    try {
      const imageUrls = formData.images.filter((img) => img.trim() !== '');
      
      await adminAPI.createProduct({
        ...formData,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });

      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
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
              href="/admin/products"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-gray-600">Create a new product in your catalog</p>
            
            {/* Selected Brand Preview */}
            {selectedBrand && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Brand Selected:</span> {selectedBrand}
                </p>
                <button
                  onClick={() => {
                    setSelectedBrand(null);
                    setFormData(prev => ({ ...prev, brandId: '' }));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear
                </button>
              </div>
            )}
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

            <div className="grid md:grid-cols-3 gap-4">
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
                <label className="label">Discount (%)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                    className="input"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  {formData.price > 0 && formData.discountPercentage > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      Final: ₨{(formData.price * (1 - formData.discountPercentage / 100)).toFixed(2)}
                    </p>
                  )}
                </div>
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
                  disabled={categoriesLoading}
                  required
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                  </option>
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
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
                  onChange={(e) => {
                    setFormData({ ...formData, brandId: e.target.value });
                    const selectedBrandObj = Array.isArray(brands) ? brands.find(b => b.id === e.target.value) : null;
                    setSelectedBrand(selectedBrandObj?.name || null);
                  }}
                  className="input"
                >
                  <option value="">Select Brand (Optional)</option>
                  {Array.isArray(brands) && brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {formData.brandId && (
                  <p className="text-xs text-green-600 mt-1 font-medium">✓ Brand selected</p>
                )}
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
                    Creating...
                  </>
                ) : (
                  'Create Product'
                )}
              </button>
              <Link href="/admin/products" className="btn-outline">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <NewProductContent />
    </Suspense>
  );
}
