'use client';

import { useState } from 'react';
import { Package, Search } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement order tracking logic
    setTimeout(() => {
      setLoading(false);
      alert('Order tracking will be implemented soon!');
    }, 1000);
  };

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Package className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order number to track your delivery status
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleTrack}>
            <div className="mb-6">
              <label className="label">Order Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="ORD123456789"
                  className="input pr-10"
                  required
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                You can find your order number in your confirmation email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="/contact" className="text-primary-600 hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
