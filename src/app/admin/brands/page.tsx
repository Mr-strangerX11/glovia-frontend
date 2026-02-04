'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useBrands } from '@/hooks/useData';
import { adminAPI, brandsAPI } from '@/lib/api';
import { ArrowLeft, Edit2, Trash2, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

export default function AdminBrandsPage() {
  const router = useRouter();
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const { brands = [], isLoading } = useBrands();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    setDeleting(id);
    try {
      await adminAPI.deleteBrand(id);
      toast.success('Brand deleted successfully');
      // Refresh brands
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold">Manage Brands</h1>
              <p className="text-gray-600">Create and manage product brands</p>
            </div>
            <Link
              href="/admin/brands/new"
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </Link>
          </div>

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
                            <Link
                              href={`/admin/brands/${brand.id}`}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
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
              <Link
                href="/admin/brands/new"
                className="text-primary-600 hover:underline font-semibold"
              >
                Create your first brand
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
