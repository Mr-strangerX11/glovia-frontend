"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { promoCodesAPI } from '@/lib/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';

const NewPromoCodePage = () => {
  const { user, isChecking } = useAuthGuard({ roles: ['SUPER_ADMIN'] });
  const router = useRouter();
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: '',
    validUntil: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error('Promo code is required');
      return;
    }

    if (!form.validUntil) {
      toast.error('Valid until date is required');
      return;
    }

    const validUntilDate = new Date(form.validUntil);
    if (Number.isNaN(validUntilDate.getTime())) {
      toast.error('Please enter a valid expiry date/time');
      return;
    }

    const validFromDate = form.validFrom ? new Date(form.validFrom) : null;
    if (validFromDate && Number.isNaN(validFromDate.getTime())) {
      toast.error('Please enter a valid start date/time');
      return;
    }

    try {
      setSaving(true);
      await promoCodesAPI.create({
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || undefined,
        maxDiscount: form.discountType === 'PERCENTAGE' ? Number(form.maxDiscount) || undefined : undefined,
        usageLimit: Number(form.usageLimit) || undefined,
        validFrom: validFromDate ? validFromDate.toISOString() : new Date().toISOString(),
        validUntil: validUntilDate.toISOString(),
        isActive: form.isActive,
      });
      toast.success('Promo code created successfully');
      router.push('/admin/promocodes');
    } catch (error: any) {
      const message = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error?.response?.data?.message || 'Failed to create promo code';
      toast.error(message);
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
            href="/dashboard/superadmin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to SuperAdmin Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Add New Promo Code</h1>
          <p className="text-gray-600 mt-2">Create promo codes that customers can apply at checkout</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Promo Code <span className="text-red-500">*</span></label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg"
              name="code"
              placeholder="Promo Code (e.g. NEWYEAR10)"
              value={form.code}
              onChange={handleChange}
              required
            />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg"
              name="description"
              placeholder="Description (optional)"
              value={form.description}
              onChange={handleChange}
            />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Discount Type <span className="text-red-500">*</span></label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg"
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Discount Value <span className="text-red-500">*</span></label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg"
                name="discountValue"
                type="number"
                min="0"
                placeholder="Discount Value"
                value={form.discountValue}
                onChange={handleChange}
                required
              />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Minimum Order Amount</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg"
                name="minOrderAmount"
                type="number"
                min="0"
                placeholder="Min Order Amount"
                value={form.minOrderAmount}
                onChange={handleChange}
              />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Maximum Discount (for Percentage)</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg"
                name="maxDiscount"
                type="number"
                min="0"
                placeholder="Max Discount"
                value={form.maxDiscount}
                onChange={handleChange}
                disabled={form.discountType !== 'PERCENTAGE'}
              />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Usage Limit (Number of Customers)</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg"
                name="usageLimit"
                type="number"
                min="0"
                placeholder="Usage Limit"
                value={form.usageLimit}
                onChange={handleChange}
              />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Valid From (Start Date/Time)</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg"
                name="validFrom"
                type="datetime-local"
                value={form.validFrom}
                onChange={handleChange}
              />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Valid Until (Expiry Date/Time) <span className="text-red-500">*</span></label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg"
                name="validUntil"
                type="datetime-local"
                value={form.validUntil}
                onChange={handleChange}
                placeholder="Expiry Date"
                required
              />
              </div>
            </div>
            <p className="text-xs text-gray-500">Set the expiry date/time in the second field (Valid Until).</p>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm font-semibold text-gray-800">Status: Active</span>
            </label>

            <button className="w-full bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50" type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Add Promo Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPromoCodePage;
