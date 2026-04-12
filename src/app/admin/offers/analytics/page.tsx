'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, TrendingUp, Users, ShoppingBag, BarChart3 } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';

// Mock chart data
const chartData = {
  revenueByOffer: [
    { name: 'Summer Sale', value: 2500000 },
    { name: 'Flash Sale', value: 890000 },
    { name: 'BOGO', value: 1200000 },
  ],
  conversionTrend: [
    { date: 'Mon', rate: 6.5 },
    { date: 'Tue', rate: 7.2 },
    { date: 'Wed', rate: 8.1 },
    { date: 'Thu', rate: 7.8 },
    { date: 'Fri', rate: 9.2 },
    { date: 'Sat', rate: 12.5 },
    { date: 'Sun', rate: 10.3 },
  ],
  topOffers: [
    { name: 'Summer Sale 2026', uses: 1200, revenue: 2500000 },
    { name: 'Flash Sale - Makeup', uses: 345, revenue: 890000 },
    { name: 'BOGO - Skincare', uses: 567, revenue: 1200000 },
  ],
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('last7days');

  const stats = {
    totalRevenue: 4590000,
    totalUses: 2112,
    avgConversionRate: 8.8,
    activeOffers: 2,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800 sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-20">
            <Link
              href="/admin/offers"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </Link>
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offer Analytics</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Detailed performance insights</p>
            </div>
            <div className="flex gap-2">
              {['last7days', 'last30days', 'last90days'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === 'last7days' ? '7 Days' : range === 'last30days' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: 35, isPositive: true }}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatsCard
            title="Total Uses"
            value={stats.totalUses}
            icon={<ShoppingBag className="w-6 h-6" />}
            trend={{ value: 22, isPositive: true }}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
          />
          <StatsCard
            title="Avg Conversion Rate"
            value={`${stats.avgConversionRate}%`}
            icon={<BarChart3 className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
            gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
          />
          <StatsCard
            title="Active Offers"
            value={stats.activeOffers}
            icon={<Users className="w-6 h-6" />}
            gradient="bg-gradient-to-br from-orange-500 to-red-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue by Offer</h2>
            <div className="space-y-3">
              {chartData.revenueByOffer.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      ₹{(item.value / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full"
                      style={{
                        width: `${(item.value / Math.max(...chartData.revenueByOffer.map((i) => i.value))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Rate Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversion Rate Trend</h2>
            <div className="h-56 flex items-center justify-center">
              <div className="flex items-end gap-2 h-full w-full">
                {chartData.conversionTrend.map((item) => (
                  <div key={item.date} className="flex-1 flex flex-col items-center">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400 transition-all hover:to-cyan-300"
                      style={{ height: `${(item.rate / 12.5) * 100}%` }}
                    />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Offers Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden dark:bg-gray-900 dark:border-gray-800 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Offers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Offer Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Total Uses</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Revenue Generated</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Avg. Revenue/Use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {chartData.topOffers.map((offer) => (
                  <tr key={offer.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{offer.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-900 dark:text-white">{offer.uses}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">
                      ₹{(offer.revenue / 100000).toFixed(1)}L
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      ₹{(offer.revenue / offer.uses).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
