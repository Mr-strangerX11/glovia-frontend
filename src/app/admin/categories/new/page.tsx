import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  parentId?: string;
}

const NewCategoryPage = () => {
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    type: '',
    parentId: '',
    displayOrder: 0,
  });

  useEffect(() => {
    // Fetch parent categories
    axios.get('/api/categories').then(res => {
      setParentCategories(res.data.filter((cat: Category) => !cat.parentId));
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/categories', form);
    // Optionally redirect or show success
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
      <form onSubmit={handleSubmit}>
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
        <input
          className="w-full mb-2 p-2 border rounded"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          name="type"
          placeholder="Type (SKINCARE, HAIRCARE, etc)"
          value={form.type}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          name="displayOrder"
          type="number"
          placeholder="Display Order"
          value={form.displayOrder}
          onChange={handleChange}
        />
        <select
          className="w-full mb-2 p-2 border rounded"
          name="parentId"
          value={form.parentId}
          onChange={handleChange}
        >
          <option value="">No Parent (Main Category)</option>
          {parentCategories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        <button className="w-full bg-blue-600 text-white p-2 rounded mt-2" type="submit">
          Add Category
        </button>
      </form>
    </div>
  );
};

export default NewCategoryPage;
