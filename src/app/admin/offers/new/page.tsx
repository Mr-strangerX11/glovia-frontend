'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Save, Eye, Check, AlertCircle } from 'lucide-react';
import { CreateOfferPayload, OfferStatus, OfferType, DiscountType } from '@/types/offer';

type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;

interface FormState extends CreateOfferPayload {
  step: StepNumber;
}

export default function CreateOfferPage() {
  const [form, setForm] = useState<Partial<FormState>>({
    step: 1,
    name: '',
    description: '',
    type: 'PERCENTAGE' as OfferType,
    appliesToType: 'ALL',
    appliesTo: {},
    discountType: 'PERCENTAGE' as DiscountType,
    discountValue: 0,
    priority: 1,
    status: 'DRAFT' as OfferStatus,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    autoActivate: true,
    conditions: {},
  });

  const step = (form.step || 1) as StepNumber;
  const steps = [
    { number: 1, title: 'Basic Info', icon: '📝' },
    { number: 2, title: 'Discount', icon: '💰' },
    { number: 3, title: 'Apply To', icon: '🎯' },
    { number: 4, title: 'Schedule', icon: '📅' },
    { number: 5, title: 'Conditions', icon: '⚙️' },
    { number: 6, title: 'Preview', icon: '👁️' },
  ];

  const handleNext = () => {
    if (step < 6) {
      setForm({ ...form, step: (step + 1) as StepNumber });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setForm({ ...form, step: (step - 1) as StepNumber });
    }
  };

  const handleSave = async () => {
    console.log('Saving offer:', form);
    // API call would go here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800 sticky top-0 z-40">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/admin/offers"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Offers
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create New Offer</h1>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              <Save className="w-5 h-5" />
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((s, idx) => (
              <div
                key={s.number}
                className="flex flex-col items-center flex-1"
              >
                <button
                  onClick={() => setForm({ ...form, step: s.number as StepNumber })}
                  className={`w-10 h-10 rounded-full font-bold flex items-center justify-center mb-2 transition-all ${
                    step === s.number
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : step > s.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                </button>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">{s.title}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-1">
            {steps.map((s) => (
              <div
                key={s.number}
                className={`flex-1 h-1 rounded-full transition-all ${
                  step >= s.number
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                    : 'bg-gray-200 dark:bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 dark:bg-gray-900 dark:border-gray-800 shadow-sm mb-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Offer Name *
                </label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Summer Sale 2026"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your offer..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority (1-100)
                </label>
                <input
                  type="number"
                  value={form.priority || 1}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Higher priority offers appear first</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Offer Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['PERCENTAGE', 'FLAT', 'BOGO', 'FLASH_SALE'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, type })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        form.type === type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <p className="font-medium text-sm">{type === 'FLASH_SALE' ? '⚡ Flash Sale' : type}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Discount Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Discount Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['PERCENTAGE', 'FLAT', 'BOGO'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setForm({ ...form, discountType: type })}
                      className={`p-4 rounded-lg border-2 transition-all text-center font-medium ${
                        form.discountType === type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {type === 'PERCENTAGE' ? '%' : type === 'FLAT' ? '₹' : 'BOGO'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount Value *
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={form.discountValue || 0}
                    onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <div className="px-4 py-2.5 bg-gray-100 rounded-lg dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">
                    {form.discountType === 'PERCENTAGE' ? '%' : '₹'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Discount Limit (Optional)
                </label>
                <input
                  type="number"
                  value={form.maxDiscountLimit || ''}
                  onChange={(e) => setForm({ ...form, maxDiscountLimit: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="e.g., 5000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Apply To</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Applies To *
                </label>
                <div className="space-y-2">
                  {(['ALL', 'CATEGORY', 'VENDOR', 'PRODUCT'] as const).map((applieTo) => (
                    <button
                      key={applieTo}
                      onClick={() => setForm({ ...form, appliesToType: applieTo })}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left font-medium ${
                        form.appliesToType === applieTo
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {applieTo === 'ALL' && '🌍 All Products'}
                      {applieTo === 'CATEGORY' && '🏷️ Specific Categories'}
                      {applieTo === 'VENDOR' && '🏪 Specific Vendors'}
                      {applieTo === 'PRODUCT' && '📦 Specific Products'}
                    </button>
                  ))}
                </div>
              </div>

              {form.appliesToType !== 'ALL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select {form.appliesToType}s
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                    🔍 Select items (searchable multi-select implementation here)
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Schedule</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                <input
                  type="checkbox"
                  id="autoActivate"
                  checked={form.autoActivate || false}
                  onChange={(e) => setForm({ ...form, autoActivate: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="autoActivate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-activate when scheduled time arrives
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Conditions</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Order Amount (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 5000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Per User Limit (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 3"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Preview</h2>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Product Card Preview</p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 text-center text-gray-500 dark:text-gray-400">
                    📦 Offer badge displayed on product card
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Product Page Preview</p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 text-center text-gray-500 dark:text-gray-400">
                    💰 Full offer details on product page
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Homepage Banner Preview</p>
                  <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded p-8 text-center text-gray-600 dark:text-gray-300">
                    🎉 Featured offer banner
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-3">
            <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 font-medium">
              Save as Draft
            </button>
            <button
              onClick={handleNext}
              disabled={step === 6}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
