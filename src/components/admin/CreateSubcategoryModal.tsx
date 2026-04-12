'use client';

import { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { categoriesAPI } from '@/lib/api';
import { toast } from 'sonner';

interface CreateSubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentCategoryId: string;
  parentCategoryName: string;
  onSuccess?: (subcategory: any) => void;
}

export default function CreateSubcategoryModal({
  isOpen,
  onClose,
  parentCategoryId,
  parentCategoryName,
  onSuccess,
}: CreateSubcategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Subcategory name is required';
    if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: generateSlug(formData.name.trim()),
        description: formData.description.trim(),
        parentId: parentCategoryId,
      };

      const { data } = await categoriesAPI.createSubcategory(payload);
      
      toast.success('Subcategory created successfully!');
      setFormData({ name: '', description: '' });
      onClose();
      
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create subcategory';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create Subcategory</h2>
            <p className="mt-0.5 text-sm text-gray-500">Under {parentCategoryName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {errors.submit && (
            <div className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Subcategory Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="e.g., Serums, Masques, Foundations"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition ${
                errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this subcategory..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition resize-none"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Subcategory
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
