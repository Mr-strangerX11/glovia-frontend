import React, { useState } from 'react';
import axios from 'axios';
import ImageUploadField from '@/components/ImageUploadField';

const NewPopupPage = () => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    image: '',
    link: '',
    isActive: true,
    showOnce: false,
    expiresAt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (url: string) => {
    setForm({ ...form, image: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/popups', {
      ...form,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
    });
    // Optionally redirect or show success
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Pop-up Offer</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full mb-2 p-2 border rounded"
          name="title"
          placeholder="Popup Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          className="w-full mb-2 p-2 border rounded"
          name="content"
          placeholder="Popup Content"
          value={form.content}
          onChange={handleChange}
          required
        />
        <ImageUploadField
          images={form.image ? [form.image] : []}
          onImagesChange={urls => handleImageUpload(urls[0] || '')}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          name="link"
          placeholder="Link (optional)"
          value={form.link}
          onChange={handleChange}
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          name="expiresAt"
          type="date"
          placeholder="Expiry Date"
          value={form.expiresAt}
          onChange={handleChange}
        />
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={e => setForm({ ...form, isActive: e.target.checked })}
          />
          <span>Active</span>
        </label>
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={form.showOnce}
            onChange={e => setForm({ ...form, showOnce: e.target.checked })}
          />
          <span>Show Once Per User</span>
        </label>
        <button className="w-full bg-blue-600 text-white p-2 rounded mt-2" type="submit">
          Add Pop-up
        </button>
      </form>
    </div>
  );
};

export default NewPopupPage;
