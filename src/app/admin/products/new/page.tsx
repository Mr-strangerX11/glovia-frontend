'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI, categoriesAPI, brandsAPI } from '@/lib/api';
import {
  ArrowLeft, ChevronRight, Loader2, Package, Tag, DollarSign,
  Layers, Image as ImageIcon, Star, Sparkles, AlertCircle, CheckCircle2,
} from 'lucide-react';
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
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
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

  const normalizeId = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if (value._id) return String(value._id);
      if (value.id) return String(value.id);
      if (value.$oid) return String(value.$oid);
    }
    const parsed = String(value);
    return parsed === '[object Object]' ? '' : parsed;
  };

  const getCategoryId = (category: any) => normalizeId(category?.id || category?._id);
  const getParentId = (category: any) => normalizeId(category?.parentId);
  const getBrandId = (brand: any) => brand?.id || brand?._id || '';

  const parentCategories = useMemo(
    () => (Array.isArray(categories) ? categories.filter((cat) => !getParentId(cat)) : []),
    [categories]
  );

  const availableSubCategories = subCategories;

  const getSubCategoriesFromParent = (parentId: string) => {
    const selectedParent = parentCategories.find((cat) => getCategoryId(cat) === parentId);
    const embeddedChildren = Array.isArray(selectedParent?.children) ? selectedParent.children : [];
    const allMatchedChildren = categories.filter((cat) => getParentId(cat) === parentId);

    const merged = [...embeddedChildren, ...allMatchedChildren];
    const seen = new Set<string>();

    return merged.filter((cat: any) => {
      const id = getCategoryId(cat);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  useEffect(() => {
    let active = true;

    const loadSubCategories = async () => {
      // Clear subcategories if no category is selected
      if (!formData.categoryId) {
        if (active) {
          setSubCategories([]);
          setSubCategoriesLoading(false);
        }
        return;
      }

      if (active) setSubCategoriesLoading(true);

      try {
        const { data } = await categoriesAPI.getByParent(formData.categoryId);
        
        // Handle various response formats
        let apiList: any[] = [];
        if (Array.isArray(data)) {
          apiList = data;
        } else if (data?.data && Array.isArray(data.data)) {
          apiList = data.data;
        }

        // Get fallback list from embedded children in the categories data
        const fallbackList = getSubCategoriesFromParent(formData.categoryId);
        
        // Use API list if available, otherwise fallback
        const list = apiList.length > 0 ? apiList : fallbackList;
        
        if (!active) return;
        
        setSubCategories(list);

        // Update formData to preserve valid subCategoryId or reset if changed
        setFormData((prev) => {
          if (!prev) return prev;
          
          // If the current subCategoryId is still valid in the new list, keep it
          const hasCurrent = list.some((subCat: any) => getCategoryId(subCat) === prev.subCategoryId);
          
          // If current subCategoryId is not in new list and it's not empty, reset it
          if (!hasCurrent && prev.subCategoryId) {
            return { ...prev, subCategoryId: '' };
          }
          
          return prev;
        });
      } catch (error) {
        console.error('Error loading subcategories:', error);
        // Try fallback on error
        const fallbackList = getSubCategoriesFromParent(formData.categoryId);
        if (active) {
          setSubCategories(fallbackList);
        }
      } finally {
        if (active) setSubCategoriesLoading(false);
      }
    };

    loadSubCategories();

    return () => {
      active = false;
    };
  }, [formData.categoryId, categories]);

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

  const isObjectId = (value: string) => /^[a-fA-F0-9]{24}$/.test((value || '').trim());

  const extractErrorMessage = (error: any): string => {
    const message = error?.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
    if (message && typeof message === 'object') return JSON.stringify(message);
    return 'Failed to create product';
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

    const selectedCategoryId =
      formData.subCategoryId
        ? formData.subCategoryId
        : formData.categoryId;

    if (!isObjectId(selectedCategoryId)) {
      setErrors((prev: any) => ({ ...prev, categoryId: 'Please select a valid category.' }));
      toast.error('Please select a valid category.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        sku: formData.sku.trim(),
        categoryId: selectedCategoryId,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        isFeatured: !!formData.isFeatured,
        isNew: !!formData.isNew,
      };

      if (isObjectId(formData.brandId)) {
        payload.brandId = formData.brandId;
      }

      if (Number.isFinite(formData.discountPercentage) && Number(formData.discountPercentage) >= 0) {
        payload.discountPercentage = Number(formData.discountPercentage);
      }

      if (Number.isFinite(formData.quantityMl) && Number(formData.quantityMl) >= 0) {
        payload.quantityMl = Number(formData.quantityMl);
      }

      await adminAPI.createProduct(payload);
      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (error: any) {
      const msg = extractErrorMessage(error);
      toast.error(msg);
      if (typeof msg === 'string' && msg.toLowerCase().includes('sku')) setErrors((e:any)=>({...e,sku:msg}));
      if (typeof msg === 'string' && msg.toLowerCase().includes('slug')) setErrors((e:any)=>({...e,slug:msg}));
      if (typeof msg === 'string' && msg.toLowerCase().includes('category')) setErrors((e:any)=>({...e,categoryId:msg}));
    } finally {
      setLoading(false);
    }
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const finalPrice = formData.price > 0 && formData.discountPercentage > 0
    ? formData.price * (1 - formData.discountPercentage / 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky top bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/admin/products" className="hover:text-gray-900">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">New Product</span>
          </div>
          {selectedBrand && (
            <div className="ml-auto flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-indigo-700">
              <Tag className="w-3.5 h-3.5" />
              <span className="font-medium">{selectedBrand}</span>
              <button
                onClick={() => { setSelectedBrand(null); setFormData(prev => ({ ...prev, brandId: '' })); }}
                className="ml-1 text-indigo-400 hover:text-indigo-700 font-bold leading-none"
              >×</button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 mt-1">Fill in the details below to add a product to your catalog.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Section 1: Basic Info ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <Package className="w-4 h-4 text-indigo-500" />
              <h2 className="font-semibold text-gray-900">Basic Information</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. COSRX Snail Mucin 96 Power Repairing Essence"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-400">auto-generated · editable</span>
                </label>
                <div className={`flex rounded-lg border overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition ${errors.slug ? 'border-red-400' : 'border-gray-300'}`}>
                  <span className="flex items-center px-3 bg-gray-50 border-r border-gray-200 text-gray-400 text-sm select-none">/products/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="product-slug"
                    className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-white"
                    required
                  />
                </div>
                {errors.slug && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.slug}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the product, its benefits, key ingredients, how to use…"
                  rows={4}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  required
                />
                {errors.description && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* ── Section 2: Pricing & Inventory ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-green-500" />
              <h2 className="font-semibold text-gray-900">Pricing & Inventory</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price (NPR) <span className="text-red-500">*</span>
                  </label>
                  <div className={`flex rounded-lg border overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition ${errors.price ? 'border-red-400' : 'border-gray-300'}`}>
                    <span className="flex items-center px-3 bg-gray-50 border-r border-gray-200 text-gray-500 text-sm font-medium select-none">₨</span>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="flex-1 px-3 py-2.5 text-sm text-gray-900 outline-none bg-white"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount (%)</label>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition">
                    <input
                      type="number"
                      value={formData.discountPercentage || ''}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                      placeholder="0"
                      className="flex-1 px-3 py-2.5 text-sm text-gray-900 outline-none bg-white"
                      min="0"
                      max="100"
                      step="1"
                    />
                    <span className="flex items-center px-3 bg-gray-50 border-l border-gray-200 text-gray-500 text-sm select-none">%</span>
                  </div>
                  {finalPrice !== null && (
                    <p className="mt-1 text-xs text-green-600 font-semibold">
                      Final: ₨{finalPrice.toFixed(2)}
                      <span className="ml-1 text-gray-400 font-normal">({formData.discountPercentage}% off)</span>
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity ?? ''}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition ${errors.stockQuantity ? 'border-red-400' : 'border-gray-300'}`}
                    min="0"
                    required
                  />
                  {errors.stockQuantity && <p className="mt-1 text-xs text-red-600">{errors.stockQuantity}</p>}
                </div>

                {/* Quantity ml */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Size / Volume (ml)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.quantityMl || ''}
                    onChange={(e) => setFormData({ ...formData, quantityMl: Number(e.target.value) })}
                    placeholder="e.g. 100"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>

              {/* SKU */}
              <div className="mt-4 max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  SKU <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-gray-400">unique product code</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  placeholder="e.g. COSRX-SNAIL-100ML"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-mono text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition uppercase ${errors.sku ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  required
                />
                {errors.sku && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.sku}</p>}
              </div>
            </div>
          </div>

          {/* ── Section 3: Categorization ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-purple-500" />
              <h2 className="font-semibold text-gray-900">Categorization</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: '' })}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition bg-white ${errors.categoryId ? 'border-red-400' : 'border-gray-300'}`}
                  disabled={categoriesLoading}
                  required
                >
                  <option value="">{categoriesLoading ? 'Loading…' : '— Select Category —'}</option>
                  {parentCategories.map((cat) => (
                    <option key={getCategoryId(cat)} value={getCategoryId(cat)}>{cat.name}</option>
                  ))}
                </select>
                {!categoriesLoading && parentCategories.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No categories. <Link href="/admin/categories/new" className="underline">Create one</Link>
                  </p>
                )}
                {errors.categoryId && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.categoryId}</p>}
              </div>

              {/* Sub-Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sub-Category
                  {formData.categoryId && !subCategoriesLoading && availableSubCategories.length > 0 && (
                    <span className="ml-1.5 text-xs font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      {availableSubCategories.length} available
                    </span>
                  )}
                </label>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  disabled={!formData.categoryId || subCategoriesLoading}
                >
                  <option value="">
                    {!formData.categoryId
                      ? 'Select a Category first'
                      : subCategoriesLoading
                        ? 'Loading…'
                        : availableSubCategories.length === 0
                          ? 'No sub-categories'
                          : '— Optional —'}
                  </option>
                  {availableSubCategories.map((subCat: any) => (
                    <option key={getCategoryId(subCat)} value={getCategoryId(subCat)}>{subCat.name}</option>
                  ))}
                </select>
                {formData.categoryId && !subCategoriesLoading && availableSubCategories.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    <Link href={`/admin/categories/new?level=sub&parentId=${formData.categoryId}`} className="text-indigo-600 underline">
                      + Add sub-category
                    </Link>
                  </p>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
                <select
                  value={formData.brandId}
                  onChange={(e) => {
                    setFormData({ ...formData, brandId: e.target.value });
                    const obj = Array.isArray(brands) ? brands.find((b: any) => getBrandId(b) === e.target.value) : null;
                    setSelectedBrand(obj?.name || null);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition bg-white"
                >
                  <option value="">— Optional —</option>
                  {Array.isArray(brands) && brands.map((brand: any) => (
                    <option key={getBrandId(brand)} value={getBrandId(brand)}>{brand.name}</option>
                  ))}
                </select>
                {formData.brandId && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Brand selected
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 4: Images ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold text-gray-900">Product Images</h2>
              <span className="ml-auto text-xs text-gray-400">Up to 5 images</span>
            </div>
            <div className="p-5">
              <ImageUploadField
                images={formData.images.filter((img) => img.trim() !== '')}
                onImagesChange={(urls) => setFormData({ ...formData, images: urls })}
                maxImages={5}
              />
              {errors.images && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.images}
                </p>
              )}
            </div>
          </div>

          {/* ── Section 5: Flags ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <h2 className="font-semibold text-gray-900">Product Flags</h2>
            </div>
            <div className="p-5 flex flex-wrap gap-3">
              {[
                { key: 'isFeatured', icon: <Star className="w-4 h-4" />, label: 'Featured Product', desc: 'Show on homepage & featured sections', color: 'yellow' },
                { key: 'isNew', icon: <Sparkles className="w-4 h-4" />, label: 'New Arrival', desc: 'Tag this as a new arrival', color: 'green' },
              ].map(({ key, icon, label, desc, color }) => {
                const checked = formData[key as keyof typeof formData] as boolean;
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all min-w-[200px] ${
                      checked
                        ? color === 'yellow' ? 'border-yellow-400 bg-yellow-50' : 'border-green-400 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                      className="sr-only"
                    />
                    <span className={checked ? (color === 'yellow' ? 'text-yellow-600' : 'text-green-600') : 'text-gray-400'}>
                      {icon}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${checked ? (color === 'yellow' ? 'text-yellow-800' : 'text-green-800') : 'text-gray-700'}`}>{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                    {checked && (
                      <CheckCircle2 className={`w-4 h-4 ml-auto flex-shrink-0 ${color === 'yellow' ? 'text-yellow-500' : 'text-green-500'}`} />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 gap-3">
            <Link href="/admin/products" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
            <div className="flex items-center gap-3">
              {formData.name && (
                <p className="text-xs text-gray-400 hidden sm:block truncate max-w-[200px]">{formData.name}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                ) : (
                  <><Package className="w-4 h-4" /> Create Product</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <NewProductContent />
    </Suspense>
  );
}
