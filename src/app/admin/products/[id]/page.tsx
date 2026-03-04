"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { adminAPI, categoriesAPI, brandsAPI } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageUploadField from "@/components/ImageUploadField";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isChecking } = useAuthGuard({ roles: ["ADMIN", "SUPER_ADMIN"] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(null);

  const normalizeId = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id) return String(value._id);
      if (value.id) return String(value.id);
      if (value.$oid) return String(value.$oid);
    }
    const parsed = String(value);
    return parsed === "[object Object]" ? "" : parsed;
  };

  const getCategoryId = (category: any) => normalizeId(category?.id || category?._id);
  const getParentId = (category: any) => normalizeId(category?.parentId);
  const ALL_SUB_CATEGORIES = '__ALL_SUB_CATEGORIES__';

  const parentCategories = useMemo(
    () => (Array.isArray(categories) ? categories.filter((cat) => !getParentId(cat)) : []),
    [categories]
  );

  const availableSubCategories = subCategories;

  useEffect(() => {
    let active = true;

    const loadSubCategories = async () => {
      if (!formData?.categoryId) {
        if (active) setSubCategories([]);
        return;
      }

      try {
        const { data } = await categoriesAPI.getByParent(formData.categoryId);
        const list = Array.isArray(data) ? data : data?.data || [];
        if (!active) return;
        setSubCategories(list);

        setFormData((prev: any) => {
          if (!prev) return prev;
          const hasCurrent = list.some((subCat: any) => getCategoryId(subCat) === prev.subCategoryId);
          const nextSubCategoryId = list.length === 0
            ? ''
            : hasCurrent || prev.subCategoryId === ALL_SUB_CATEGORIES
              ? prev.subCategoryId
              : ALL_SUB_CATEGORIES;

          if (prev.subCategoryId === nextSubCategoryId) return prev;
          return { ...prev, subCategoryId: nextSubCategoryId };
        });
      } catch {
        if (active) setSubCategories([]);
      }
    };

    loadSubCategories();

    return () => {
      active = false;
    };
  }, [formData?.categoryId]);

  useEffect(() => {
    if (user && params && (params as any).id) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [user, params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const id = params && (params as any).id;
      const [productRes, categoriesRes, brandsRes] = await Promise.all([
        adminAPI.getProduct(id),
        categoriesAPI.getAll(),
        brandsAPI.getAll(),
      ]);
      // Clean up product data to extract IDs and image URLs
      const product = productRes.data;
      const categoriesList = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data?.data || [];

      const rawCategoryId = (product.categoryId || product.category?._id || product.category?.id || '').toString();
      const selectedCategory = categoriesList.find((cat: any) => getCategoryId(cat) === rawCategoryId);
      const selectedCategoryParentId = selectedCategory ? getParentId(selectedCategory) : '';

      const cleanedData = {
        ...product,
        categoryId: selectedCategoryParentId || rawCategoryId,
        subCategoryId: selectedCategoryParentId ? rawCategoryId : '',
        brandId: product.brandId || product.brand?._id || product.brand?.id || '',
        // Extract image URLs from image objects
        images: Array.isArray(product.images) 
          ? product.images.map((img: any) => typeof img === 'string' ? img : img.url)
          : [],
      };
      setFormData(cleanedData);
      setCategories(categoriesList);
      setBrands(brandsRes.data?.data || brandsRes.data || []);
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.message || "Failed to load product data";
      toast.error(errorMessage);
      console.error('Fetch product error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (images: string[]) => {
    setFormData((prev: any) => ({ ...prev, images }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = params && (params as any).id;
      if (!id) {
        toast.error("Invalid product ID");
        setSaving(false);
        return;
      }
      // Clean the data - remove nested objects and format properly
      const cleanData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || '',
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId:
          formData.subCategoryId && formData.subCategoryId !== ALL_SUB_CATEGORIES
            ? formData.subCategoryId
            : formData.categoryId,
        brandId: formData.brandId || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isNew: formData.isNew || formData.isNewProduct,
      };

      // Handle images - extract just the URLs
      if (formData.images && Array.isArray(formData.images)) {
        cleanData.images = formData.images.map((img: any) => 
          typeof img === 'string' ? img : img.url
        );
      }

      // Include optional fields if they exist
      if (formData.sku) cleanData.sku = formData.sku;
      if (formData.compareAtPrice) cleanData.compareAtPrice = Number(formData.compareAtPrice);
      if (formData.discountPercentage) cleanData.discountPercentage = Number(formData.discountPercentage);
      if (formData.ingredients) cleanData.ingredients = formData.ingredients;
      if (formData.benefits) cleanData.benefits = formData.benefits;
      if (formData.howToUse) cleanData.howToUse = formData.howToUse;
      if (formData.tags) cleanData.tags = formData.tags;
      if (formData.suitableFor) cleanData.suitableFor = formData.suitableFor;

      await adminAPI.updateProduct(id, cleanData);
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.message || "Failed to update product";
      toast.error(errorMessage);
      console.error('Update product error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isChecking || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/products" className="btn-outline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug || ""}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price *</label>
              <input
                type="number"
                name="price"
                value={formData.price || 0}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity || 0}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev: any) => ({
                    ...prev,
                    categoryId: value,
                    subCategoryId: "",
                  }));
                }}
                className="input"
                required
              >
                <option value="">Select category</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sub-Category</label>
              <select
                name="subCategoryId"
                value={formData.subCategoryId || ""}
                onChange={handleChange}
                className="input"
                disabled={!formData.categoryId || availableSubCategories.length === 0}
              >
                <option value="">
                  {!formData.categoryId
                    ? "Select Category First"
                    : availableSubCategories.length === 0
                      ? "No Sub-Category Available"
                      : "Select Sub-Category (Optional)"}
                </option>
                {availableSubCategories.length > 0 && (
                  <option value={ALL_SUB_CATEGORIES}>All Sub-Categories</option>
                )}
                {availableSubCategories.map((subCat: any) => (
                  <option key={getCategoryId(subCat)} value={getCategoryId(subCat)}>
                    {subCat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <select
                name="brandId"
                value={formData.brandId || ""}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand.id || brand._id} value={brand.id || brand._id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Images</label>
            <ImageUploadField
              images={formData.images || []}
              onImagesChange={handleImageChange}
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive || false}
                onChange={handleChange}
              />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured || false}
                onChange={handleChange}
              />
              Featured
            </label>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Save Changes"}
            </button>
            <Link href="/admin/products" className="btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
