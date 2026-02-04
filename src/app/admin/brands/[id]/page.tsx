'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI, brandsAPI } from '@/lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Params {
  id: string;
}

export default function EditBrandPage({ params }: { params: Params }) {
  const router = useRouter();
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      fetchBrand();
    }
  }, [user, params.id]);

  const fetchBrand = async () => {
    try {
      setFetching(true);
      // We need to get brand by ID from our API - for now using brandsAPI with list
      const { data: brands } = await brandsAPI.getAll();
      const brand = brands.find((b: any) => b.id === params.id);
      
      if (brand) {
        setFormData({
          name: brand.name,
          slug: brand.slug,
          description: brand.description || '',
          logo: brand.logo || '',
          isActive: brand.isActive !== false,
        });
      } else {
        toast.error('Brand not found');
        router.push('/admin/brands');
      }
    } catch (error) {
      toast.error('Failed to load brand');
      router.push('/admin/brands');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminAPI.updateBrand(params.id, formData);
      toast.success('Brand updated successfully');
      router.push('/admin/brands');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update brand');
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link
              href="/admin/brands"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Brands
            </Link>
            <h1 className="text-3xl font-bold">Edit Brand</h1>
            <p className="text-gray-600">Update brand information</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-6">
            <div>
              <label className="label">Brand Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px]"
              />
            </div>

            <div>
              <label className="label">Logo URL</label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="input"
              />
              {formData.logo && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                  <img
                    src={formData.logo}
                    alt="Brand Logo"
                    className="h-16 object-contain"
                    onError={() => {}}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Active Brand</span>
              </label>
              <p className="text-sm text-gray-500 mt-1">Inactive brands won't appear in the catalog</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Updating...' : 'Update Brand'}
              </button>
              <Link
                href="/admin/brands"
                className="btn btn-secondary flex-1"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
