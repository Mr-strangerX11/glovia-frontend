'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useBrands } from '@/hooks/useData';
import { adminAPI, brandsAPI } from '@/lib/api';
import { ArrowLeft, Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ImageUploadField from '@/components/ImageUploadField';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  isActive?: boolean;
}

export default function AdminBrandsPage() {
  const router = useRouter();
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const { brands = [], isLoading } = useBrands();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    coverImage: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: generateSlug(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        // await adminAPI.updateBrand(editingId, formData);
        // toast.success("Brand updated successfully");
      } else {
        // await adminAPI.createBrand(formData);
        // toast.success("Brand created successfully");
      }

      setFormData({
        name: "",
        slug: "",
        description: "",
        logo: "",
        coverImage: "",
        isActive: true,
      });
      setShowForm(false);
      setEditingId(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save brand");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    setDeleting(id);
    try {
      await adminAPI.deleteBrand(id);
      toast.success('Brand deleted successfully');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete brand');
    } finally {
      setDeleting(null);
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Manage Brands</h1>
                <p className="text-gray-600">Create and manage product brands</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                }}
                className="flex items-center gap-2 btn-primary"
              >
                <Plus className="w-5 h-5" />
                Create Brand
              </button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Brand" : "Create New Brand"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Brand Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="input"
                      placeholder="e.g., MAC Cosmetics"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-")
                            .replace(/(^-|-$)/g, ""),
                        })
                      }
                      className="input"
                      placeholder="mac-cosmetics"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input min-h-[100px]"
                    placeholder="Describe the brand..."
                  />
                </div>

                <div>
                  <label className="label">Logo</label>
                  <ImageUploadField
                    images={formData.logo ? [formData.logo] : []}
                    onImagesChange={(urls) =>
                      setFormData({ ...formData, logo: urls[0] || "" })
                    }
                    maxImages={1}
                  />
                </div>

                <div>
                  <label className="label">Cover Image</label>
                  <ImageUploadField
                    images={formData.coverImage ? [formData.coverImage] : []}
                    onImagesChange={(urls) =>
                      setFormData({ ...formData, coverImage: urls[0] || "" })
                    }
                    maxImages={1}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Saving..." : editingId ? "Update Brand" : "Create Brand"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({
                        name: "",
                        slug: "",
                        description: "",
                        logo: "",
                        coverImage: "",
                        isActive: true,
                      });
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Brands Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : brands && brands.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Brand Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {brands.map((brand: Brand) => (
                      <tr key={brand.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {brand.logo && (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="font-medium text-gray-900">{brand.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{brand.slug}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 line-clamp-1">
                            {brand.description || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            brand.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {brand.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingId(brand.id);
                                setFormData({
                                  name: brand.name,
                                  slug: brand.slug,
                                  description: brand.description || "",
                                  logo: brand.logo || "",
                                  coverImage: brand.coverImage || "",
                                  isActive: brand.isActive !== false,
                                });
                                setShowForm(true);
                              }}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(brand.id)}
                              disabled={deleting === brand.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-gray-600 mb-4">No brands created yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-primary-600 hover:underline font-semibold"
              >
                Create your first brand
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
