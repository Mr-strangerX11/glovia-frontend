"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { adminAPI, categoriesAPI, brandsAPI } from "@/lib/api";
import {
  Loader2, ArrowLeft, Package, DollarSign, Tag, Image as ImageIcon,
  Settings, Save, AlertCircle, CheckCircle2, BarChart3, Star, Zap, Eye
} from "lucide-react";
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
  const getBrandId = (brand: any) => normalizeId(brand?.id || brand?._id);
  const ALL_SUB_CATEGORIES = "__ALL_SUB_CATEGORIES__";

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
      if (!formData?.categoryId) { if (active) setSubCategories([]); return; }
      try {
        const { data } = await categoriesAPI.getByParent(formData.categoryId);
        let apiList: any[] = Array.isArray(data) ? data : data?.data && Array.isArray(data.data) ? data.data : [];
        const fallbackList = getSubCategoriesFromParent(formData.categoryId);
        const list = apiList.length > 0 ? apiList : fallbackList;
        if (!active) return;
        setSubCategories(list);
        setFormData((prev: any) => {
          if (!prev) return prev;
          const hasCurrent = list.some((subCat: any) => getCategoryId(subCat) === prev.subCategoryId);
          if (!hasCurrent && prev.subCategoryId && prev.subCategoryId !== ALL_SUB_CATEGORIES) return { ...prev, subCategoryId: "" };
          return prev;
        });
      } catch {
        const fallbackList = getSubCategoriesFromParent(formData.categoryId);
        if (active) setSubCategories(fallbackList);
      }
    };
    loadSubCategories();
    return () => { active = false; };
  }, [formData?.categoryId, categories]);

  useEffect(() => {
    if (user && params && (params as any).id) fetchData();
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
      const product = productRes.data;
      const categoriesList = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.data || [];
      const rawCategoryId = normalizeId(product.categoryId || product.category?._id || product.category?.id || "");
      const selectedCategory = categoriesList.find((cat: any) => getCategoryId(cat) === rawCategoryId);
      const selectedCategoryParentId = selectedCategory ? getParentId(selectedCategory) : "";
      const cleanedData = {
        ...product,
        categoryId: selectedCategoryParentId || rawCategoryId,
        subCategoryId: selectedCategoryParentId ? rawCategoryId : "",
        brandId: normalizeId(product.brandId || product.brand?._id || product.brand?.id || ""),
        images: Array.isArray(product.images) ? product.images.map((img: any) => typeof img === "string" ? img : img.url) : [],
      };
      setFormData(cleanedData);
      setCategories(categoriesList);
      setBrands(brandsRes.data?.data || brandsRes.data || []);
    } catch (error) {
      toast.error((error as any)?.response?.data?.message || "Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleToggle = (name: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleImageChange = (images: string[]) => {
    setFormData((prev: any) => ({ ...prev, images }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = params && (params as any).id;
      if (!id) { toast.error("Invalid product ID"); setSaving(false); return; }
      const cleanData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || "",
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: formData.subCategoryId && formData.subCategoryId !== ALL_SUB_CATEGORIES ? formData.subCategoryId : formData.categoryId,
        brandId: formData.brandId || null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isNew: formData.isNew || formData.isNewProduct,
      };
      if (formData.images && Array.isArray(formData.images)) {
        cleanData.images = formData.images.map((img: any) => typeof img === "string" ? img : img.url);
      }
      if (formData.sku) cleanData.sku = formData.sku;
      if (formData.compareAtPrice) cleanData.compareAtPrice = Number(formData.compareAtPrice);
      if (formData.discountPercentage) cleanData.discountPercentage = Number(formData.discountPercentage);
      if (formData.ingredients) cleanData.ingredients = formData.ingredients;
      if (formData.benefits) cleanData.benefits = formData.benefits;
      if (formData.howToUse) cleanData.howToUse = formData.howToUse;
      if (formData.tags) cleanData.tags = formData.tags;
      if (formData.suitableFor) cleanData.suitableFor = formData.suitableFor;
      await adminAPI.updateProduct(id, cleanData);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      toast.error((error as any)?.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (isChecking || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading product…</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="font-semibold text-gray-700">Product not found.</p>
          <Link href="/admin/products" className="btn-outline text-sm">Back to Products</Link>
        </div>
      </div>
    );
  }

  const Toggle = ({ name, checked, label }: { name: string; checked: boolean; label: string }) => (
    <button
      type="button"
      onClick={() => handleToggle(name)}
      className={`relative flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all ${
        checked ? "bg-primary-50 border-primary-200" : "bg-gray-50 border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className={`text-sm font-medium ${checked ? "text-primary-700" : "text-gray-600"}`}>{label}</span>
      <div className={`relative w-10 h-5.5 rounded-full transition-colors ${checked ? "bg-primary-500" : "bg-gray-300"}`}
        style={{ height: "22px" }}>
        <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4.5" : ""}`}
          style={{ width: "18px", height: "18px", transform: checked ? "translateX(18px)" : "translateX(0)" }} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container max-w-7xl py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Products
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{formData.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/products" className="btn-outline text-sm px-4 py-2">
              Cancel
            </Link>
            <button
              type="submit"
              form="edit-product-form"
              disabled={saving}
              className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <form id="edit-product-form" onSubmit={handleSubmit}>
        <div className="container max-w-7xl py-6">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── Left Column ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Basic Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-800">Basic Information</h2>
                    <p className="text-xs text-gray-400">Name, slug and description</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                    <input
                      type="text" name="name" value={formData.name || ""} onChange={handleChange}
                      className="input text-sm" placeholder="e.g. COSRX Snail Mucin Essence" required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Slug <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">/products/</span>
                      <input
                        type="text" name="slug" value={formData.slug || ""} onChange={handleChange}
                        className="input text-sm pl-[80px] font-mono" placeholder="cosrx-snail-mucin-essence" required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                    <textarea
                      name="description" value={formData.description || ""} onChange={handleChange}
                      rows={4} className="input text-sm resize-none" placeholder="Describe your product…"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">SKU</label>
                    <input
                      type="text" name="sku" value={formData.sku || ""} onChange={handleChange}
                      className="input text-sm font-mono" placeholder="PROD-001"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-800">Pricing & Inventory</h2>
                    <p className="text-xs text-gray-400">Price, stock and discount</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price (NPR) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">NPR</span>
                        <input
                          type="number" name="price" value={formData.price || 0} onChange={handleChange}
                          className="input text-sm pl-12" min={0} required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Compare At Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">NPR</span>
                        <input
                          type="number" name="compareAtPrice" value={formData.compareAtPrice || ""} onChange={handleChange}
                          className="input text-sm pl-12" min={0} placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock Quantity <span className="text-red-500">*</span></label>
                      <input
                        type="number" name="stockQuantity" value={formData.stockQuantity || 0} onChange={handleChange}
                        className="input text-sm" min={0} required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Discount (%)</label>
                      <div className="relative">
                        <input
                          type="number" name="discountPercentage" value={formData.discountPercentage || ""} onChange={handleChange}
                          className="input text-sm pr-8" min={0} max={100} placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                      </div>
                    </div>
                  </div>
                  {formData.price > 0 && formData.discountPercentage > 0 && (
                    <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <p className="text-xs text-emerald-700 font-medium">
                        Discounted price: <strong>NPR {(formData.price * (1 - formData.discountPercentage / 100)).toFixed(0)}</strong>
                        {" "}(saving NPR {(formData.price * formData.discountPercentage / 100).toFixed(0)})
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category & Brand */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-800">Category & Brand</h2>
                    <p className="text-xs text-gray-400">Classification and taxonomy</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category <span className="text-red-500">*</span></label>
                      <select
                        name="categoryId" value={formData.categoryId || ""}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, categoryId: e.target.value, subCategoryId: "" }))}
                        className="input text-sm" required
                      >
                        <option value="">Select category</option>
                        {parentCategories.map((cat) => (
                          <option key={getCategoryId(cat) || cat.name} value={getCategoryId(cat)}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sub-Category</label>
                      <select
                        name="subCategoryId" value={formData.subCategoryId || ""} onChange={handleChange}
                        className="input text-sm" disabled={!formData.categoryId || availableSubCategories.length === 0}
                      >
                        <option value="">
                          {!formData.categoryId ? "Select category first" : availableSubCategories.length === 0 ? "None available" : "Optional"}
                        </option>
                        {availableSubCategories.length > 0 && <option value={ALL_SUB_CATEGORIES}>All Sub-Categories</option>}
                        {availableSubCategories.map((subCat: any) => (
                          <option key={getCategoryId(subCat)} value={getCategoryId(subCat)}>{subCat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Brand</label>
                      <select name="brandId" value={formData.brandId || ""} onChange={handleChange} className="input text-sm">
                        <option value="">No brand</option>
                        {brands.map((brand) => (
                          <option key={getBrandId(brand) || brand.name} value={getBrandId(brand)}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-800">Product Details</h2>
                    <p className="text-xs text-gray-400">Ingredients, benefits & usage</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ingredients</label>
                    <textarea name="ingredients" value={formData.ingredients || ""} onChange={handleChange}
                      rows={2} className="input text-sm resize-none" placeholder="List key ingredients…" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Benefits</label>
                    <textarea name="benefits" value={formData.benefits || ""} onChange={handleChange}
                      rows={2} className="input text-sm resize-none" placeholder="Key product benefits…" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">How to Use</label>
                    <textarea name="howToUse" value={formData.howToUse || ""} onChange={handleChange}
                      rows={2} className="input text-sm resize-none" placeholder="Usage instructions…" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Sidebar ── */}
            <div className="space-y-5">

              {/* Status */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-rose-600" />
                  </div>
                  <h2 className="text-sm font-bold text-gray-800">Product Status</h2>
                </div>
                <div className="p-5 space-y-2.5">
                  <Toggle name="isActive" checked={!!formData.isActive} label="Active (visible in store)" />
                  <Toggle name="isFeatured" checked={!!formData.isFeatured} label="Featured product" />
                  <Toggle name="isBestSeller" checked={!!formData.isBestSeller} label="Best seller" />
                  <Toggle name="isNewProduct" checked={!!(formData.isNew || formData.isNewProduct)} label="New arrival" />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden text-white">
                <div className="px-5 py-4 border-b border-white/10">
                  <h2 className="text-sm font-bold">Quick Overview</h2>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Current Price</span>
                    <span className="text-sm font-bold text-emerald-400">NPR {Number(formData.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Stock</span>
                    <span className={`text-sm font-bold ${Number(formData.stockQuantity) > 10 ? "text-emerald-400" : "text-amber-400"}`}>
                      {formData.stockQuantity || 0} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Status</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${formData.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Images</span>
                    <span className="text-sm font-bold text-white/80">{(formData.images || []).length}</span>
                  </div>
                  {formData.isFeatured && (
                    <div className="flex items-center gap-2 bg-amber-500/10 rounded-lg px-3 py-2 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs text-amber-300 font-medium">Featured on homepage</span>
                    </div>
                  )}
                  {(formData.isNew || formData.isNewProduct) && (
                    <div className="flex items-center gap-2 bg-blue-500/10 rounded-lg px-3 py-2">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-blue-300 font-medium">Shown as new arrival</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Images */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-800">Product Images</h2>
                    <p className="text-xs text-gray-400">First image is the primary</p>
                  </div>
                </div>
                <div className="p-5">
                  <ImageUploadField images={formData.images || []} onImagesChange={handleImageChange} />
                </div>
              </div>

              {/* Preview Link */}
              {formData.slug && (
                <a
                  href={`/products/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all"
                >
                  <Eye className="w-4 h-4" /> Preview product page
                </a>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
