import React, { useState } from 'react';
import axios from 'axios';
import ImageUploadField from '@/components/ImageUploadField';

const NewBannerPage = () => {
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    mobileImage: '',
    link: '',
    displayOrder: 0,
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (name: string, url: string) => {
    setForm({ ...form, [name]: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/banners', {
      ...form,
      displayOrder: Number(form.displayOrder),
    });
    // Optionally redirect or show success
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Banner</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full mb-2 p-2 border rounded"
          name="title"
          placeholder="Banner Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          name="subtitle"
          placeholder="Subtitle (optional)"
          value={form.subtitle}
          onChange={handleChange}
        />
        <ImageUploadField
          images={form.image ? [form.image] : []}
          onImagesChange={urls => handleImageUpload('image', urls[0] || '')}
        />
        <ImageUploadField
          images={form.mobileImage ? [form.mobileImage] : []}
          onImagesChange={urls => handleImageUpload('mobileImage', urls[0] || '')}
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
          name="displayOrder"
          type="number"
          placeholder="Display Order"
          value={form.displayOrder}
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
        <button className="w-full bg-blue-600 text-white p-2 rounded mt-2" type="submit">
          Add Banner
        </button>
      </form>
    </div>
  );
};

export default NewBannerPage;
