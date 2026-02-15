"use client";

import { useEffect, useState } from "react";
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
  const [brands, setBrands] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(null);

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
      setFormData({ ...productRes.data });
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data?.data || brandsRes.data || []);
    } catch (error) {
      toast.error("Failed to load product data");
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
      await adminAPI.updateProduct(id, formData);
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error) {
      toast.error("Failed to update product");
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
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat._id} value={cat.id || cat._id}>
                    {cat.name}
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
