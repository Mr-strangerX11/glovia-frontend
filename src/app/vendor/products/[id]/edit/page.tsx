'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    discountPercentage: 0,
    stockQuantity: 0,
    quantityMl: 0,
    sizeType: '',
    sizeValue: '',
    sizeUnit: '',
    sku: '',
    categoryId: '',
    subCategoryId: '',
    images: [''],
    isFeatured: false,
    isNew: true,
  });

  useEffect(() => {
    if (user && productId) {
      fetchInitialData();
    }
  }, [user, productId]);

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

  // Category to size type mapping
  const categoryTupleTypes: Record<string, string> = {
    'Clothing': 'clothing',
    'Apparel': 'clothing',
    'Fashion': 'clothing',
    'Groceries': 'weight',
    'Food': 'weight',
    'Beverages': 'volume',
    'Liquids': 'volume',
    'Beauty': 'volume',
    'Skincare': 'volume',
  };

  // Size options for different types
  const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL'];
  const weightUnits = ['Gram', 'kg'];
  const volumeUnits = ['ML', 'L'];

  // Determine size type based on selected category name
  const getSizeTypeForCategory = (categoryId: string): string => {
    const category = categories.find(cat => getCategoryId(cat) === categoryId);
    if (!category) return '';
    
    const categoryName = category.name || '';
    for (const [key, value] of Object.entries(categoryTupleTypes)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return '';
  };

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
        }
        return;
      }

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
          if (!hasCurrent && prev.subCategoryId && prev.subCategoryId !== ALL_SUB_CATEGORIES) {
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
      }
    };

    loadSubCategories();

    return () => {
      active = false;
    };
  }, [formData.categoryId, categories]);

  const fetchInitialData = async () => {
    try {
      const [{ data: categoriesData }, { data: productData }] = await Promise.all([
        categoriesAPI.getAll(),
        vendorAPI.getProduct(productId),
      ]);

      const product = productData?.data || productData;
      const categoriesList = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
      const rawCategoryId = (product?.categoryId || product?.category?._id || product?.category?.id || '').toString();
      const selectedCategory = categoriesList.find((cat: any) => getCategoryId(cat) === rawCategoryId);
      const selectedCategoryParentId = selectedCategory ? getParentId(selectedCategory) : '';
      const images =
        product?.images?.length
          ? product.images
              .map((img: any) => (typeof img === 'string' ? img : img?.url))
              .filter(Boolean)
          : [''];

      setCategories(categoriesList);
      setCategoriesLoading(false);
      
      // Determine size type for the product's category
      const categoryIdForSize = selectedCategoryParentId || rawCategoryId;
      const sizeType = categoryIdForSize ? getSizeTypeForCategory(categoryIdForSize) : '';
      
      setFormData({
        name: product?.name || '',
        slug: product?.slug || '',
        description: product?.description || '',
        price: product?.price || 0,
        discountPercentage: product?.discountPercentage || 0,
        stockQuantity: product?.stockQuantity || 0,
        quantityMl: product?.quantityMl || 0,
        sizeType: sizeType,
        sizeValue: product?.size || '', // Can be clothing size, weight value, or volume value
        sizeUnit: product?.sizeUnit || (sizeType === 'weight' ? 'kg' : sizeType === 'volume' ? 'ML' : ''),
        sku: product?.sku || '',
        categoryId: selectedCategoryParentId || rawCategoryId,
        subCategoryId: rawCategoryId && selectedCategoryParentId ? rawCategoryId : '',
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
      
      const selectedCategoryId =
        formData.subCategoryId
          ? formData.subCategoryId
          : formData.categoryId;

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

      if (Number.isFinite(formData.discountPercentage) && Number(formData.discountPercentage) >= 0) {
        payload.discountPercentage = Number(formData.discountPercentage);
      }

      // Handle size/volume based on type
      if (formData.sizeType === 'clothing' && formData.sizeValue) {
        payload.size = formData.sizeValue; // S, M, L, XL, etc.
      } else if (formData.sizeType === 'weight' && formData.sizeValue && formData.sizeUnit) {
        payload.weight = `${formData.sizeValue}${formData.sizeUnit}`; // e.g., "500G" or "1KG"
      } else if (formData.sizeType === 'volume' && formData.sizeValue && formData.sizeUnit) {
        // Convert to milliliters for consistency
        let mlValue = Number(formData.sizeValue);
        if (formData.sizeUnit === 'L') {
          mlValue *= 1000;
        }
        payload.quantityMl = mlValue;
      } else if (Number.isFinite(formData.quantityMl) && Number(formData.quantityMl) >= 0) {
        payload.quantityMl = Number(formData.quantityMl);
      }

      await vendorAPI.updateProduct(productId, payload);
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
                  onChange={(e) => {
                    const newCategoryId = e.target.value;
                    const newSizeType = getSizeTypeForCategory(newCategoryId);
                    setFormData({ 
                      ...formData, 
                      categoryId: newCategoryId, 
                      subCategoryId: '',
                      sizeType: newSizeType,
                      sizeValue: '',
                      sizeUnit: newSizeType === 'weight' ? 'KG' : newSizeType === 'volume' ? 'ML' : ''
                    });
                  }}
                  className="input"
                  required
                >
                  <option value="">Select Category</option>
                  {parentCategories.map((cat) => (
                    <option key={getCategoryId(cat) || cat.name} value={getCategoryId(cat)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Sub-Category</label>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                  className="input"
                  disabled={!formData.categoryId || subCategoriesLoading}
                >
                  <option value="">
                    {subCategoriesLoading ? 'Loading...' : 'Select Sub-Category (Optional)'}
                  </option>
                  {availableSubCategories && availableSubCategories.length > 0 && (
                    availableSubCategories.map((subCat: any) => (
                      <option key={getCategoryId(subCat)} value={getCategoryId(subCat)}>
                        {subCat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Discount Percentage (%)</label>
                <input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })
                  }
                  className="input"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <p className="text-sm text-gray-500 mt-1">Optional: 0-100%</p>
              </div>

              <div>
                <label className="label">
                  {formData.sizeType === 'clothing' && 'Size'}
                  {formData.sizeType === 'weight' && 'Weight'}
                  {formData.sizeType === 'volume' && 'Volume'}
                  {!formData.sizeType && 'Size / Volume (ml)'}
                </label>
                {formData.sizeType === 'clothing' && (
                  <select
                    value={formData.sizeValue}
                    onChange={(e) => setFormData({ ...formData, sizeValue: e.target.value })}
                    className="input"
                  >
                    <option value="">Select Size</option>
                    {clothingSizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                )}
                {formData.sizeType === 'weight' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={formData.sizeValue || ''}
                      onChange={(e) => setFormData({ ...formData, sizeValue: e.target.value })}
                      placeholder="e.g. 500"
                      className="input flex-1"
                    />
                    <select
                      value={formData.sizeUnit}
                      onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value })}
                      className="input"
                    >
                      <option value="">Unit</option>
                      {weightUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                )}
                {formData.sizeType === 'volume' && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      value={formData.sizeValue || ''}
                      onChange={(e) => setFormData({ ...formData, sizeValue: e.target.value })}
                      placeholder="e.g. 100"
                      className="input flex-1"
                    />
                    <select
                      value={formData.sizeUnit}
                      onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value })}
                      className="input"
                    >
                      <option value="">Unit</option>
                      {volumeUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                )}
                {!formData.sizeType && (
                  <input
                    type="number"
                    min={0}
                    value={formData.quantityMl || ''}
                    onChange={(e) => setFormData({ ...formData, quantityMl: Number(e.target.value) })}
                    placeholder="e.g. 100"
                    className="input"
                  />
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {formData.sizeType === 'clothing' && 'Select clothing size'}
                  {formData.sizeType === 'weight' && 'Specify weight (e.g., 500G, 1KG)'}
                  {formData.sizeType === 'volume' && 'Specify volume (e.g., 100ML, 1L)'}
                  {!formData.sizeType && 'Optional: Product volume in milliliters'}
                </p>
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
