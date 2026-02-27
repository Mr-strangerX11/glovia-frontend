"use client";

import React, { useState } from 'react';
import axios from 'axios';

const NewPromoCodePage = () => {
  const [form, setForm] = useState({
    code: '',
    discountPercentage: 0,
    usageLimit: 0,
    expiresAt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/promocodes', {
      ...form,
      discountPercentage: Number(form.discountPercentage),
      usageLimit: Number(form.usageLimit),
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : undefined,
    });
    // Optionally redirect or show success
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Promo Code</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full mb-2 p-2 border rounded"
          name="code"
          placeholder="Promo Code"
          value={form.code}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          name="discountPercentage"
          type="number"
          placeholder="Discount Percentage"
          value={form.discountPercentage}
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-2 p-2 border rounded"
          name="usageLimit"
          type="number"
          placeholder="Usage Limit"
          value={form.usageLimit}
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
        <button className="w-full bg-blue-600 text-white p-2 rounded mt-2" type="submit">
          Add Promo Code
        </button>
      </form>
    </div>
  );
};

export default NewPromoCodePage;
