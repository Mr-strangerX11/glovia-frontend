"use client";
import React, { useEffect, useState } from 'react';
import { categoriesAPI } from '@/lib/api';

interface Category {
  _id: string;
  name: string;
  type: string;
  parentId?: string;
}

const CATEGORY_TYPES = [
  'SKINCARE',
  'MAKEUP',
  'HAIRCARE',
  'BODY_CARE',
  'TOOLS_ACCESSORIES',
  'FRAGRANCE',
  'ORGANIC_NATURAL',
  'MENS_GROOMING',
  'ORGANIC',
  'HERBAL',
] as const;

const NewCategoryPage = () => {
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
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
        setFeedback('Failed to load categories. Please refresh and try again.');
      }
    };

    fetchParentCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback('');

    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        displayOrder: Number(form.displayOrder),
      };

      if (categoryLevel === 'sub') {
        if (!form.parentId) {
          setFeedback('Please select a parent category for subcategory.');
          setIsSubmitting(false);
          return;
        }
        payload.parentId = form.parentId;
      } else {
        payload.type = form.type;
      }

      await categoriesAPI.create(payload);
      setFeedback(categoryLevel === 'sub' ? 'Subcategory created successfully.' : 'Category created successfully.');
      setForm({
        name: '',
        slug: '',
        description: '',
        type: form.type,
        parentId: '',
        displayOrder: 0,
      });
    } catch {
      setFeedback('Failed to create category. Please ensure you are logged in as admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCategoryLevel('main')}
            className={`rounded border p-2 text-sm font-medium ${categoryLevel === 'main' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'}`}
          >
            Main Category
          </button>
          <button
            type="button"
            onClick={() => setCategoryLevel('sub')}
            className={`rounded border p-2 text-sm font-medium ${categoryLevel === 'sub' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'}`}
          >
            Subcategory
          </button>
        </div>

        <input
          className="w-full mb-2 p-2 border rounded"
          name="name"
          placeholder="Category Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          name="slug"
          placeholder="Slug"
          value={form.slug}
          onChange={handleChange}
          required
        />
        <textarea
          className="w-full mb-2 p-2 border rounded"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />

        {categoryLevel === 'main' ? (
          <select
            className="w-full mb-2 p-2 border rounded"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            {CATEGORY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        ) : (
          <select
            className="w-full mb-2 p-2 border rounded"
            name="parentId"
            value={form.parentId}
            onChange={handleChange}
            required
          >
            <option value="">Select parent category</option>
            {parentCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}

        <input
          className="w-full mb-2 p-2 border rounded"
          name="displayOrder"
          type="number"
          placeholder="Display Order"
          value={form.displayOrder}
          onChange={handleChange}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded mt-2 disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : categoryLevel === 'sub' ? 'Add Subcategory' : 'Add Category'}
        </button>
        {feedback && <p className="mt-3 text-sm text-gray-700">{feedback}</p>}
      </form>
    </div>
  );
};

export default NewCategoryPage;
