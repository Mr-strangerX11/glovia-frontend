"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categoriesAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronRight, FolderOpen, Layers, Loader2, Tag } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  type: string;
  parentId?: string;
}

const CATEGORY_TYPES: { value: string; label: string; icon: string; description: string }[] = [
  { value: 'SKINCARE',          label: 'Skincare',            icon: '✨', description: 'Cleansers, serums, moisturizers' },
  { value: 'MAKEUP',            label: 'Makeup',              icon: '💄', description: 'Foundation, lipstick, eyeshadow' },
  { value: 'HAIRCARE',          label: 'Haircare',            icon: '💆', description: 'Shampoo, conditioner, hair oil' },
  { value: 'BODY_CARE',         label: 'Body Care',           icon: '🧴', description: 'Lotions, scrubs, body wash' },
  { value: 'TOOLS_ACCESSORIES', label: 'Tools & Accessories', icon: '🪮', description: 'Brushes, sponges, tools' },
  { value: 'FRAGRANCE',         label: 'Fragrance',           icon: '🌸', description: 'Perfumes, body mists, deodorants' },
  { value: 'ORGANIC_NATURAL',   label: 'Organic & Natural',   icon: '🌿', description: 'Herbal, chemical-free products' },
  { value: 'MENS_GROOMING',     label: "Men's Grooming",      icon: '🧔', description: 'Beard oil, face wash, hair wax' },
  { value: 'ORGANIC',           label: 'Organic',             icon: '🍃', description: 'Certified organic products' },
  { value: 'HERBAL',            label: 'Herbal',              icon: '🌱', description: 'Ayurvedic & herbal products' },
];

const NewCategoryContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loadingParents, setLoadingParents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [categoryLevel, setCategoryLevel] = useState<'main' | 'sub'>('main');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'SKINCARE',
    parentId: '',
    displayOrder: 0,
  });

  useEffect(() => {
    const fetchParentCategories = async () => {
      try {
        const res = await categoriesAPI.getAll();
        const allCategories: Category[] = Array.isArray(res.data) ? res.data : [];
        setParentCategories(allCategories.filter((cat) => !cat.parentId));
      } catch {
        setFeedback({ type: 'error', message: 'Failed to load parent categories. Please refresh.' });
      } finally {
        setLoadingParents(false);
      }
    };
    fetchParentCategories();
  }, []);

  useEffect(() => {
    const level = searchParams?.get('level');
    const parentId = searchParams?.get('parentId');
    if (level === 'sub') setCategoryLevel('sub');
    if (parentId) setForm((prev) => ({ ...prev, parentId }));
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated: typeof prev = { ...prev, [name]: value };
      if (name === 'name') {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      return updated;
    });
  };

  const selectedType = CATEGORY_TYPES.find((t) => t.value === form.type);
  const selectedParent = parentCategories.find((c) => c._id === form.parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        displayOrder: Number(form.displayOrder),
      };

      if (categoryLevel === 'sub') {
        if (!form.parentId) {
          setFeedback({ type: 'error', message: 'Please select a parent category.' });
          setIsSubmitting(false);
          return;
        }
        payload.parentId = form.parentId;
      } else {
        payload.type = form.type;
      }

      await categoriesAPI.create(payload);
      setSubmitted(true);
      setFeedback({
        type: 'success',
        message: categoryLevel === 'sub'
          ? `Sub-category "${form.name}" created successfully!`
          : `Category "${form.name}" created successfully!`,
      });
      setTimeout(() => router.push('/admin/categories'), 1500);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to create category. Please ensure you are logged in as admin.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/admin/categories" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/admin/categories" className="hover:text-gray-900">Categories</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">New Category</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Category</h1>
          <p className="text-gray-500 mt-1">Organise your product catalog with categories and sub-categories.</p>
        </div>

        {/* Feedback banners */}
        {submitted && feedback?.type === 'success' && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 px-5 py-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800">{feedback.message}</p>
              <p className="text-sm text-green-600 mt-0.5">Redirecting to category list…</p>
            </div>
          </div>
        )}
        {feedback?.type === 'error' && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
            ✗ {feedback.message}
          </div>
        )}

        <div className="space-y-5">
          {/* ── Step 1: Level ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">1</span>
              <h2 className="font-semibold text-gray-900">Category Level</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategoryLevel('main')}
                className={`relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all ${
                  categoryLevel === 'main'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Layers className={`w-5 h-5 ${categoryLevel === 'main' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`font-semibold text-sm ${categoryLevel === 'main' ? 'text-indigo-800' : 'text-gray-700'}`}>Main Category</span>
                <span className="text-xs text-gray-500">Top-level group (e.g. Skincare)</span>
                {categoryLevel === 'main' && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />}
              </button>

              <button
                type="button"
                onClick={() => setCategoryLevel('sub')}
                className={`relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all ${
                  categoryLevel === 'sub'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FolderOpen className={`w-5 h-5 ${categoryLevel === 'sub' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className={`font-semibold text-sm ${categoryLevel === 'sub' ? 'text-indigo-800' : 'text-gray-700'}`}>Sub-Category</span>
                <span className="text-xs text-gray-500">Nested inside a main category</span>
                {categoryLevel === 'sub' && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-500" />}
              </button>
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 2: Basic Details */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">2</span>
                <h2 className="font-semibold text-gray-900">Basic Details</h2>
              </div>
              <div className="p-5 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={categoryLevel === 'sub' ? 'e.g. Serum, Foundation, Shampoo' : 'e.g. Skincare, Makeup, Haircare'}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs font-normal text-gray-400">auto-generated · editable</span>
                  </label>
                  <div className="flex rounded-lg border border-gray-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 overflow-hidden transition">
                    <span className="flex items-center px-3 bg-gray-50 border-r border-gray-200 text-gray-400 text-sm select-none">/</span>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="e.g. skincare"
                      required
                      className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-white"
                    />
                  </div>
                  {form.slug && (
                    <p className="mt-1 text-xs text-gray-500">URL: <span className="font-mono text-indigo-600">/categories/{form.slug}</span></p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Short description shown on the category page…"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition resize-none"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Display Order
                    <span className="ml-2 text-xs font-normal text-gray-400">lower = appears first</span>
                  </label>
                  <input
                    name="displayOrder"
                    type="number"
                    min={0}
                    value={form.displayOrder}
                    onChange={handleChange}
                    className="w-28 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Type or Parent */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">3</span>
                <h2 className="font-semibold text-gray-900">
                  {categoryLevel === 'main' ? 'Category Type' : 'Parent Category'}
                </h2>
              </div>

              {categoryLevel === 'main' ? (
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-4">Choose the type that best describes this category.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATEGORY_TYPES.map((t) => (
                      <label
                        key={t.value}
                        className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                          form.type === t.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input type="radio" name="type" value={t.value} checked={form.type === t.value} onChange={handleChange} className="sr-only" />
                        <span className="text-xl">{t.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${form.type === t.value ? 'text-indigo-800' : 'text-gray-800'}`}>{t.label}</p>
                          <p className="text-xs text-gray-500 truncate">{t.description}</p>
                        </div>
                        {form.type === t.value && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                      </label>
                    ))}
                  </div>
                  {selectedType && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 rounded-lg px-4 py-2.5 border border-indigo-200">
                      <span className="text-lg">{selectedType.icon}</span>
                      <span>Selected: <strong>{selectedType.label}</strong> — {selectedType.description}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-4">Select which main category this sub-category belongs to.</p>
                  {loadingParents ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading categories…
                    </div>
                  ) : parentCategories.length === 0 ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                      ⚠ No main categories yet.{' '}
                      <button type="button" onClick={() => setCategoryLevel('main')} className="underline font-medium">
                        Create a main category first
                      </button>.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {parentCategories.map((cat) => (
                        <label
                          key={cat._id}
                          className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                            form.parentId === cat._id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input type="radio" name="parentId" value={cat._id} checked={form.parentId === cat._id} onChange={handleChange} className="sr-only" required />
                          <Tag className={`w-4 h-4 flex-shrink-0 ${form.parentId === cat._id ? 'text-indigo-500' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium flex-1 ${form.parentId === cat._id ? 'text-indigo-800' : 'text-gray-700'}`}>{cat.name}</span>
                          {form.parentId === cat._id && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                        </label>
                      ))}
                    </div>
                  )}
                  {selectedParent && (
                    <div className="mt-4 text-sm text-indigo-700 bg-indigo-50 rounded-lg px-4 py-2.5 border border-indigo-200">
                      Will be created under: <strong>{selectedParent.name}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
              <Link href="/admin/categories" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </Link>
              <div className="flex items-center gap-3">
                {form.name && (
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {categoryLevel === 'main' ? '📂 Main' : '📁 Sub'} · <span className="font-mono text-indigo-600">/{form.slug}</span>
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || submitted}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : submitted ? (
                    <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                  ) : (
                    categoryLevel === 'sub' ? 'Add Sub-Category' : 'Add Main Category'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const NewCategoryPage = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  }>
    <NewCategoryContent />
  </Suspense>
);

export default NewCategoryPage;

