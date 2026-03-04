'use client';

import { useState } from 'react';
import { ordersAPI } from '@/lib/api';
import { Package, Search, Truck, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type TrackingOrder = {
  orderNumber: string;
  status: string;
  createdAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  trackingNumber?: string;
  deliveryPartner?: string;
  total?: number;
  paymentMethod?: string;
  address?: {
    district?: string;
    area?: string;
  };
  timeline?: Array<{ key: string; label: string; at?: string | null }>;
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<TrackingOrder | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !identifier.trim()) {
      toast.error('Please enter order number and email/phone');
      return;
    }

    setLoading(true);
    setTrackedOrder(null);

    try {
      const { data } = await ordersAPI.track(orderNumber.trim().toUpperCase(), identifier.trim());
      setTrackedOrder(data);
    } catch (error: any) {
      setTrackedOrder(null);
      const message = error?.response?.data?.message || 'Unable to track order';
      toast.error(typeof message === 'string' ? message : 'Unable to track order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RETURNED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

            <div className="mb-6">
              <label className="label">Email or Phone</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or 98XXXXXXXX"
                className="input"
                required
              />
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

        {trackedOrder && (
          <div className="card mt-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Order</p>
                <h2 className="text-xl font-semibold">#{trackedOrder.orderNumber}</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trackedOrder.status)}`}>
                {trackedOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded border p-3">
                <p className="text-gray-500">Total</p>
                <p className="font-semibold">NPR {Number(trackedOrder.total || 0).toLocaleString()}</p>
              </div>
              <div className="rounded border p-3">
                <p className="text-gray-500">Payment Method</p>
                <p className="font-semibold">{trackedOrder.paymentMethod || 'N/A'}</p>
              </div>
              <div className="rounded border p-3">
                <p className="text-gray-500">Tracking Number</p>
                <p className="font-semibold">{trackedOrder.trackingNumber || 'Not assigned yet'}</p>
              </div>
              <div className="rounded border p-3">
                <p className="text-gray-500">Delivery Partner</p>
                <p className="font-semibold">{trackedOrder.deliveryPartner || 'Pending assignment'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Tracking Timeline</h3>
              <div className="space-y-2">
                {(trackedOrder.timeline || []).map((step) => {
                  const reached = Boolean(step.at);
                  return (
                    <div key={step.key} className="flex items-center justify-between rounded border p-3">
                      <div className="flex items-center gap-2">
                        {step.key === 'DELIVERED' && reached ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : step.key === 'CANCELLED' && reached ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Truck className={`w-4 h-4 ${reached ? 'text-primary-600' : 'text-gray-400'}`} />
                        )}
                        <span className={reached ? 'font-medium text-gray-900' : 'text-gray-500'}>{step.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {step.at ? new Date(step.at).toLocaleString() : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Delivery Area: {trackedOrder.address?.district || '-'}{trackedOrder.address?.area ? `, ${trackedOrder.address.area}` : ''}
            </div>
          </div>
        )}

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
