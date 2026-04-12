'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { categoriesAPI } from '@/lib/api';

interface CategoryItem {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  type?: string;
  parentId?: string;
  isActive?: boolean;
  displayOrder?: number;
  children?: CategoryItem[];
}

interface EditingDraft {
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

function getCategoryId(category: CategoryItem): string {
  return category.id || category._id || '';
}

function createDraft(category: CategoryItem): EditingDraft {
  return {
    name: category.name || '',
    slug: category.slug || '',
    description: category.description || '',
    displayOrder: Number(category.displayOrder || 0),
    isActive: category.isActive !== false,
  };
}

function AdminCategoriesContent() {
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const searchParams = useSearchParams();
  const initialView = searchParams?.get('view') === 'subcategories' ? 'subcategories' : 'all';
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'subcategories'>(initialView);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditingDraft | null>(null);

  const loadCategories = async (showLoader = false) => {
    try {
      if (showLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await categoriesAPI.getAll();
      const normalized = Array.isArray(data) ? data : [];
      setCategories(normalized);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isChecking && user) {
      loadCategories();
    }
  }, [isChecking, user]);

  const flatCount = useMemo(() => {
    return categories.reduce((acc, category) => acc + 1 + (category.children?.length || 0), 0);
  }, [categories]);

  const subcategories = useMemo(() => {
    return categories.flatMap((parent) =>
      (parent.children || []).map((child) => ({
        parentName: parent.name,
        category: child,
      })),
    );
  }, [categories]);

  const handleDelete = async (category: CategoryItem) => {
    const id = getCategoryId(category);
    if (!id) {
      toast.error('Invalid category id');
      return;
    }

    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted');
      await loadCategories(true);
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to delete category';
      toast.error(message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (category: CategoryItem) => {
    const id = getCategoryId(category);
    if (!id) return;
    setEditingId(id);
    setDraft(createDraft(category));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    if (!editingId || !draft) return;

    setSavingId(editingId);
    try {
      await categoriesAPI.update(editingId, {
        name: draft.name.trim(),
        slug: draft.slug.trim(),
        description: draft.description.trim(),
        displayOrder: Number(draft.displayOrder),
        isActive: draft.isActive,
      });

      toast.success('Category updated');
      setEditingId(null);
      setDraft(null);
      await loadCategories(true);
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Failed to update category';
      toast.error(message || 'Failed to update category');
    } finally {
      setSavingId(null);
    }
  };

  const renderCategoryRow = (category: CategoryItem, level: 0 | 1) => {
    const id = getCategoryId(category);
    const isEditing = editingId === id;
    const isBusy = deletingId === id || savingId === id;

    return (
      <div
        key={id || `${category.slug}-${level}`}
        className={`grid grid-cols-12 gap-2 rounded-lg border p-3 ${level === 1 ? 'ml-4 border-gray-200 bg-gray-50' : 'border-gray-300 bg-white'}`}
      >
        <div className="col-span-12 md:col-span-3">
          {isEditing && draft ? (
            <input
              className="input"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          ) : (
            <p className="font-semibold text-gray-900">{category.name}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{level === 0 ? 'Main Category' : 'Subcategory'}</p>
        </div>

        <div className="col-span-12 md:col-span-2">
          {isEditing && draft ? (
            <input
              className="input"
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            />
          ) : (
            <p className="text-sm text-gray-700">/{category.slug}</p>
          )}
        </div>

        <div className="col-span-12 md:col-span-2">
          <p className="text-sm text-gray-700">{category.type || '—'}</p>
        </div>

        <div className="col-span-6 md:col-span-1">
          {isEditing && draft ? (
            <input
              className="input"
              type="number"
              value={draft.displayOrder}
              onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value || 0) })}
            />
          ) : (
            <p className="text-sm text-gray-700">{category.displayOrder || 0}</p>
          )}
        </div>

        <div className="col-span-6 md:col-span-1">
          {isEditing && draft ? (
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              />
              Active
            </label>
          ) : (
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${category.isActive === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {category.isActive === false ? 'Inactive' : 'Active'}
            </span>
          )}
        </div>

        <div className="col-span-12 md:col-span-3 flex justify-end gap-2">
          {isEditing ? (
            <>
              <button className="btn-primary inline-flex items-center gap-2" onClick={saveEdit} disabled={isBusy || !draft?.name || !draft?.slug}>
                <Save className="h-4 w-4" /> Save
              </button>
              <button className="btn-outline inline-flex items-center gap-2" onClick={cancelEdit} disabled={isBusy}>
                <X className="h-4 w-4" /> Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn-outline inline-flex items-center gap-2" onClick={() => startEdit(category)} disabled={isBusy}>
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button className="btn-outline inline-flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(category)} disabled={isBusy}>
                {deletingId === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </>
          )}
        </div>

        <div className="col-span-12">
          {isEditing && draft ? (
            <textarea
              className="input min-h-[84px]"
              placeholder="Description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          ) : (
            <p className="text-sm text-gray-600">{category.description || 'No description'}</p>
          )}
        </div>
      </div>
    );
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href="/dashboard/admin" className="mb-3 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold">Manage Categories</h1>
              <p className="text-gray-600">Tree view with inline edit/delete for categories and subcategories</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={viewMode === 'all' ? 'btn-primary' : 'btn-outline'}
                onClick={() => setViewMode('all')}
                type="button"
              >
                All Categories
              </button>
              <button
                className={viewMode === 'subcategories' ? 'btn-primary' : 'btn-outline'}
                onClick={() => setViewMode('subcategories')}
                type="button"
              >
                Manage Sub-Categories
              </button>
              <button className="btn-outline" onClick={() => loadCategories(true)} disabled={refreshing}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <Link href="/admin/categories/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Category
              </Link>
              <Link href="/admin/categories/new?level=sub" className="btn-outline inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Sub-Category
              </Link>
            </div>
          </div>

          <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-700">
              {viewMode === 'all' ? (
                <>
                  Total items: <span className="font-semibold">{flatCount}</span> ({categories.length} main categories)
                </>
              ) : (
                <>
                  Total sub-categories: <span className="font-semibold">{subcategories.length}</span>
                </>
              )}
            </p>
          </div>

          {loading ? (
            <div className="rounded-lg bg-white p-10 text-center">
              <Loader2 className="mx-auto mb-3 h-7 w-7 animate-spin text-primary-600" />
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-lg bg-white p-10 text-center">
              <p className="text-gray-700">No categories found.</p>
              <Link href="/admin/categories/new" className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create first category
              </Link>
            </div>
          ) : viewMode === 'subcategories' ? (
            <div className="space-y-3">
              {subcategories.length === 0 ? (
                <div className="rounded-lg bg-white p-10 text-center">
                  <p className="text-gray-700">No sub-categories found.</p>
                  <Link href="/admin/categories/new?level=sub" className="btn-primary mt-4 inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create first sub-category
                  </Link>
                </div>
              ) : (
                subcategories.map((entry) => (
                  <div key={getCategoryId(entry.category) || entry.category.slug} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Parent: {entry.parentName}</p>
                    {renderCategoryRow(entry.category, 1)}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((mainCategory) => (
                <div key={getCategoryId(mainCategory) || mainCategory.slug} className="space-y-2">
                  {renderCategoryRow(mainCategory, 0)}
                  {(mainCategory.children || []).map((childCategory) => renderCategoryRow(childCategory, 1))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <AdminCategoriesContent />
    </Suspense>
  );
}
