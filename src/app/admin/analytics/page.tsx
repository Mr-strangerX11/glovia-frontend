"use client";


import React from "react";
import { useAnalyticsOverview, useSalesAnalytics, useRevenueAnalytics, useTopProducts, useTopCustomers, useOrdersStats } from "@/hooks/useAnalytics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "@/components/Charts";

export default function AdminAnalyticsDashboard() {
  const { overview, isLoading: loadingOverview } = useAnalyticsOverview();
  const { sales, isLoading: loadingSales } = useSalesAnalytics();
  const { revenue, isLoading: loadingRevenue } = useRevenueAnalytics();
  const { topProducts, isLoading: loadingTopProducts } = useTopProducts();
  const { topCustomers, isLoading: loadingTopCustomers } = useTopCustomers();
  const { ordersStats, isLoading: loadingOrdersStats } = useOrdersStats();

  if (loadingOverview || loadingSales || loadingRevenue || loadingTopProducts || loadingTopCustomers || loadingOrdersStats) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded shadow p-4">
          <div className="text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold">{overview?.totalOrders ?? '-'}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">NPR {overview?.totalRevenue?.toLocaleString() ?? '-'}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-gray-500">Total Customers</div>
          <div className="text-2xl font-bold">{overview?.totalCustomers ?? '-'}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-gray-500">Total Products</div>
          <div className="text-2xl font-bold">{overview?.totalProducts ?? '-'}</div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded shadow p-6">
          <h2 className="font-semibold mb-2">Sales (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sales} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="font-semibold mb-2">Revenue (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sum" stroke="#059669" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded shadow p-6">
          <h2 className="font-semibold mb-2">Top Products</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProducts} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="totalSold" fill="#f59e42" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="font-semibold mb-2">Top Customers</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCustomers} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalSpent" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="font-semibold mb-2">Order Status Stats</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={ordersStats}
              dataKey="count"
              nameKey="_id"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#2563eb"
              label
            >
              {ordersStats?.map((entry: any, idx: number) => (
                <Cell key={`cell-${idx}`} fill={["#2563eb", "#059669", "#f59e42", "#6366f1", "#f43f5e"][idx % 5]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
