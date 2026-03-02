"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import ImageUploadField from '@/components/ImageUploadField';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const NewBannerPage = () => {
  const { user, isChecking } = useAuthGuard({ roles: ['SUPER_ADMIN'] });
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    mobileImage: '',
    link: '',
    displayOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (name: string, url: string) => {
    setForm({ ...form, [name]: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.image) {
      toast.error('Title and image are required');
      return;
    }

    try {
      setSaving(true);
      await adminAPI.createBanner({
        ...form,
        displayOrder: Number(form.displayOrder),
      });
      toast.success('Banner created successfully');
      router.push('/admin/banners');
    } catch (error) {
      toast.error('Failed to create banner');
    } finally {
      setSaving(false);
    }
  };

  if (isChecking || !user) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/banners"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Banners
          </Link>
          <h1 className="text-3xl font-bold">Add New Banner</h1>
          <p className="text-gray-600 mt-2">Create a new promotional banner for the homepage</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                name="title"
                placeholder="e.g., Mega Sale, New Collection"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                name="subtitle"
                placeholder="Optional subtitle or description"
                value={form.subtitle}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-2">Recommended size: 800x400px</p>
              <ImageUploadField
                images={form.image ? [form.image] : []}
                onImagesChange={urls => handleImageUpload('image', urls[0] || '')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Image (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-2">Optimized for mobile devices</p>
              <ImageUploadField
                images={form.mobileImage ? [form.mobileImage] : []}
                onImagesChange={urls => handleImageUpload('mobileImage', urls[0] || '')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                name="link"
                type="url"
                placeholder="https://example.com/sale"
                value={form.link}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                name="displayOrder"
                type="number"
                placeholder="0"
                value={form.displayOrder}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (show on homepage)
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                className="flex-1 bg-primary-600 text-white p-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Banner'}
              </button>
              <Link
                href="/admin/banners"
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewBannerPage;

