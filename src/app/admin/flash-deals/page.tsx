"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';
import { flashDealsAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

type FlashDeal = {
  _id: string;
  title: string;
  description?: string;
  products: Array<{
    productId: string;
    productName: string;
    originalPrice: number;
    salePrice: number;
    discountPercentage?: number;
  }>;
  startTime: string;
  endTime: string;
  isActive: boolean;
  displayOrder: number;
  views: number;
  clicks: number;
};

export default function FlashDealsManagementPage() {
  const [deals, setDeals] = useState<FlashDeal[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // Fetch deals and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dealsRes, statsRes] = await Promise.all([
          flashDealsAPI.getAll(1, 100),
          flashDealsAPI.getStats(),
        ]);

        setDeals(dealsRes.data?.data || []);
        setStats(statsRes.data?.data || {});
      } catch (error) {
        toast.error('Failed to fetch flash deals');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flash deal?')) return;

    try {
      setDeleting(id);
      await flashDealsAPI.delete(id);
      setDeals((prev) => prev.filter((deal) => deal._id !== id));
      toast.success('Flash deal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete flash deal');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      setToggling(id);
      const res = await flashDealsAPI.toggle(id);
      setDeals((prev) =>
        prev.map((deal) =>
          deal._id === id ? { ...deal, isActive: res.data?.data?.isActive } : deal
        )
      );
      toast.success('Flash deal updated');
    } catch (error) {
      toast.error('Failed to toggle flash deal');
    } finally {
      setToggling(null);
    }
  };

  const now = new Date();
  const active = deals.filter((d) => {
    const start = new Date(d.startTime);
    const end = new Date(d.endTime);
    return start <= now && now <= end && d.isActive;
  });

  const upcoming = deals.filter((d) => new Date(d.startTime) > now);
  const expired = deals.filter((d) => new Date(d.endTime) < now);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Flash Deals Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all your flash deals and promotional campaigns</p>
        </div>
        <Link href="/admin/flash-deals/create">
          <Button variant="primary" className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New Deal
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-5 gap-4">
        {[
          { label: 'Active Deals', value: active.length, color: 'bg-green-50 text-green-700' },
          { label: 'Upcoming Deals', value: upcoming.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Expired Deals', value: expired.length, color: 'bg-gray-50 text-gray-700' },
          { label: 'Total Views', value: stats?.totalViews || 0, color: 'bg-purple-50 text-purple-700' },
          { label: 'Total Clicks', value: stats?.totalClicks || 0, color: 'bg-red-50 text-red-700' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} p-4 rounded-lg border border-current/10`}
          >
            <p className="text-sm font-semibold uppercase tracking-wide opacity-75">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Deals Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Deal Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Products</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                    No flash deals created yet
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr key={deal._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{deal.title}</p>
                        {deal.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{deal.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                          {deal.products.length} product{deal.products.length !== 1 ? 's' : ''}
                        </p>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {deal.products.map((product, idx) => (
                            <div key={idx} className="text-xs">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{product.productName}</p>
                              <p className="text-red-600">₹{product.salePrice.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p>{format(new Date(deal.startTime), 'MMM dd, hh:mm')}</p>
                      <p className="text-gray-600 dark:text-gray-400">to</p>
                      <p>{format(new Date(deal.endTime), 'MMM dd, hh:mm')}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p>👁️ {deal.views} views</p>
                      <p>🖱️ {deal.clicks} clicks</p>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(deal.startTime) <= now && now <= new Date(deal.endTime) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          🟢 Active
                        </span>
                      ) : new Date(deal.startTime) > now ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          🔵 Upcoming
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                          ⚪ Expired
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(deal._id)}
                          disabled={toggling === deal._id}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
                          title={deal.isActive ? 'Disable' : 'Enable'}
                        >
                          {deal.isActive ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <Link href={`/admin/flash-deals/${deal._id}/edit`}>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(deal._id)}
                          disabled={deleting === deal._id}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
