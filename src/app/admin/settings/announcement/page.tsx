'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI } from '@/lib/api';
import { Loader2, Save, AlertCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AnnouncementSettingsPage() {
  const router = useRouter();
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    text: '🚚 Express Delivery: We deliver within 60 minutes!',
    icon: '🚚',
    backgroundColor: '#0066CC',
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      fetchAnnouncement();
    }
  }, [user]);

  const fetchAnnouncement = async () => {
    try {
      setFetching(true);
      const { data } = await adminAPI.getAnnouncement();
      setFormData({
        text: data.text || '🚚 Express Delivery: We deliver within 60 minutes!',
        icon: data.icon || '🚚',
        backgroundColor: data.backgroundColor || '#0066CC',
        isActive: data.isActive !== false,
      });
    } catch (error) {
      console.error('Failed to fetch announcement:', error);
      toast.error('Failed to load announcement settings');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminAPI.updateAnnouncement(formData);
      toast.success('Announcement updated successfully');
    } catch (error: any) {
      console.error('Failed to update announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to update announcement');
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

  if (fetching) {
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
              href="/admin/settings/delivery"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back to Delivery Settings
            </Link>
            <h1 className="text-3xl font-bold">Announcement Bar Settings</h1>
            <p className="text-gray-600">Manage the top announcement bar content and appearance</p>
          </div>

          {/* Preview Box */}
          <div className="card p-6 mb-6 bg-gray-100">
            <p className="text-sm text-gray-600 font-semibold mb-3">Preview:</p>
            {formData.isActive ? (
              <div 
                className="w-full text-white py-2 px-4 rounded text-sm flex items-center justify-between gap-3"
                style={{ backgroundColor: formData.backgroundColor }}
              >
                <div className="flex items-center gap-2">
                  <span>{formData.icon}</span>
                  <p className="leading-none">{formData.text}</p>
                </div>
                <button className="text-base leading-none hover:opacity-80">×</button>
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-3 px-4 bg-white rounded border border-gray-200">
                Announcement bar is disabled
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="card p-4 mb-6 bg-blue-50 border border-blue-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">About Announcement Bar:</p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• Shows at the top of every page when active</li>
                  <li>• Customize the icon, text, and background color</li>
                  <li>• Toggle on/off to show or hide the announcement</li>
                  <li>• Changes take effect immediately across the site</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-6">
            <div>
              <label className="label">Announcement Text *</label>
              <textarea
                value={formData.text}
                onChange={(e) => handleChange('text', e.target.value)}
                className="input min-h-[80px]"
                placeholder="Enter announcement text..."
                required
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">{formData.text.length}/500 characters</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Icon (Emoji) *</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleChange('icon', e.target.value)}
                  className="input text-2xl text-center"
                  placeholder="🚚"
                  maxLength={5}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Copy an emoji here</p>
              </div>

              <div>
                <label className="label">Background Color *</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={(e) => handleChange('backgroundColor', e.target.value)}
                    className="input flex-1"
                    placeholder="#0066CC"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="flex items-center gap-2 cursor-pointer flex-1">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="font-medium">
                  {formData.isActive ? 'Announcement is Active' : 'Announcement is Inactive'}
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => fetchAnnouncement()}
                className="btn btn-secondary"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="card p-4 mt-6 bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-900">
              <strong>💡 Tip:</strong> Use this announcement bar to promote special offers, delivery updates, or important information. The announcement appears at the top of all pages and can be dismissed by users temporarily (they see it again after clearing browser cache).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
