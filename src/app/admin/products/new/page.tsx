'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI, categoriesAPI, brandsAPI } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ImageUploadField from '@/components/ImageUploadField';

// Separate component to handle search params
function NewProductContent() {
    const [errors, setErrors] = useState<any>({});
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
    quantityMl: 0,
    sku: '',
    categoryId: '',
    subCategoryId: '',
    brandId: '',
    images: [''],
    isFeatured: false,
    isNew: true,
  });

  useEffect(() => {
    // Get brand from query parameter (from product page)
    if (searchParams) {
      const brandParam = searchParams.get('brand');
      if (brandParam) {
        setFormData(prev => ({ ...prev, brandId: brandParam }));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchBrands();
    }
  }, [user]);

  const getCategoryId = (category: any) => category?.id || category?._id || '';
  const getParentId = (category: any) => category?.parentId?.toString?.() || category?.parentId || '';
  const getBrandId = (brand: any) => brand?.id || brand?._id || '';
  const ALL_SUB_CATEGORIES = '__ALL_SUB_CATEGORIES__';

  const parentCategories = useMemo(
    () => (Array.isArray(categories) ? categories.filter((cat) => !getParentId(cat)) : []),
    [categories]
  );

  const availableSubCategories = useMemo(() => {
    if (!formData.categoryId || !Array.isArray(categories)) return [];

    const selectedParent = categories.find((cat) => getCategoryId(cat) === formData.categoryId);
    if (selectedParent?.children?.length) {
      return selectedParent.children;
    }

    return categories.filter((cat) => getParentId(cat) === formData.categoryId);
  }, [categories, formData.categoryId]);

  const getSubCategoriesForCategory = (categoryId: string) => {
    if (!categoryId || !Array.isArray(categories)) return [];
    const selectedParent = categories.find((cat) => getCategoryId(cat) === categoryId);
    if (selectedParent?.children?.length) return selectedParent.children;
    return categories.filter((cat) => getParentId(cat) === categoryId);
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoriesAPI.getAll();
      
      // Handle various response formats
      let categoriesData = [];
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (response.data?.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      }

      setCategories(categoriesData);
      
      if (categoriesData.length === 0) {
        toast.error('No categories found. Please create categories first.');
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories. Please check your connection.');
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
      if (searchParams) {
        const brandParam = searchParams.get('brand');
        if (brandParam && brandsList && brandsList.length > 0) {
          const foundBrand = brandsList.find((b: any) => getBrandId(b) === brandParam || b.slug === brandParam);
          if (foundBrand) {
            const brandId = getBrandId(foundBrand);
            setFormData(prev => ({ ...prev, brandId }));
            setSelectedBrand(foundBrand.name);
          }
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
    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) newErrors.discountPercentage = 'Discount must be 0-100%.';
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
      await adminAPI.createProduct({
        ...formData,
        categoryId:
          formData.subCategoryId && formData.subCategoryId !== ALL_SUB_CATEGORIES
            ? formData.subCategoryId
            : formData.categoryId,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (error: any) {
      // Show backend error
      const msg = error.response?.data?.message || 'Failed to create product';
      toast.error(msg);
      // Try to map backend errors to fields
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
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 mb-3 sm:mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Add New Product</h1>
            <p className="text-sm sm:text-base text-gray-600">Create a new product in your catalog</p>
            
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

          <form onSubmit={handleSubmit} className="card p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="label text-sm sm:text-base">Product Name *</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  {errors.discountPercentage && <p className="text-sm text-red-600 mt-1">{errors.discountPercentage}</p>}
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
                {errors.stockQuantity && <p className="text-sm text-red-600 mt-1">{errors.stockQuantity}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  onChange={(e) => {
                    const nextCategoryId = e.target.value;
                    const nextSubCategories = getSubCategoriesForCategory(nextCategoryId);
                    setFormData({
                      ...formData,
                      categoryId: nextCategoryId,
                      subCategoryId: nextSubCategories.length > 0 ? ALL_SUB_CATEGORIES : '',
                    });
                  }}
                  className="input"
                  disabled={categoriesLoading}
                  required
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                  </option>
                  {parentCategories.length > 0 ? (
                    parentCategories.map((cat) => (
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
                {errors.categoryId && <p className="text-sm text-red-600 mt-1">{errors.categoryId}</p>}
              </div>

              <div>
                <label className="label">Sub-Category</label>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                  className="input"
                  disabled={!formData.categoryId || availableSubCategories.length === 0}
                >
                  <option value="">
                    {!formData.categoryId
                      ? 'Select Category First'
                      : availableSubCategories.length === 0
                        ? 'No Sub-Category Available'
                        : 'Select Sub-Category (Optional)'}
                  </option>
                  {availableSubCategories.length > 0 && (
                    <option value={ALL_SUB_CATEGORIES}>All Sub-Categories</option>
                  )}
                  {availableSubCategories.map((subCat: any) => (
                    <option key={getCategoryId(subCat) || subCat.name} value={getCategoryId(subCat)}>
                      {subCat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Brand</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => {
                    setFormData({ ...formData, brandId: e.target.value });
                    const selectedBrandObj = Array.isArray(brands) ? brands.find(b => getBrandId(b) === e.target.value) : null;
                    setSelectedBrand(selectedBrandObj?.name || null);
                  }}
                  className="input"
                >
                  <option value="">Select Brand (Optional)</option>
                  {Array.isArray(brands) && brands.map((brand) => (
                    <option key={getBrandId(brand) || brand.name} value={getBrandId(brand)}>
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

            <div className="mb-4">
              <label className="block mb-1 font-medium">Quantity (ml)</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 border rounded"
                value={formData.quantityMl}
                onChange={e => setFormData({ ...formData, quantityMl: Number(e.target.value) })}
                placeholder="Enter quantity in ml"
              />
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
