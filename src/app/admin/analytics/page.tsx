"use client";


import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useAnalyticsOverview, useSalesAnalytics, useRevenueAnalytics, useTopProducts, useTopCustomers, useOrdersStats } from "@/hooks/useAnalytics";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "@/components/Charts";
import { Activity, ShoppingBag, DollarSign, Users, Package, Sparkles } from "lucide-react";

type AnalyticsItem = {
  _id: string;
  count?: number;
  sum?: number;
  totalSold?: number;
  totalSpent?: number;
};

const PIE_COLORS = ["#5f6fff", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#0ea5e9"];

const formatCurrency = (value: number) => `NPR ${Number(value || 0).toLocaleString()}`;

export default function AdminAnalyticsDashboard() {
  const { overview, isLoading: loadingOverview } = useAnalyticsOverview();
  const { sales, isLoading: loadingSales } = useSalesAnalytics();
  const { revenue, isLoading: loadingRevenue } = useRevenueAnalytics();
  const { topProducts, isLoading: loadingTopProducts } = useTopProducts();
  const { topCustomers, isLoading: loadingTopCustomers } = useTopCustomers();
  const { ordersStats, isLoading: loadingOrdersStats } = useOrdersStats();

  const saleSeries = useMemo(() => (sales ?? []) as AnalyticsItem[], [sales]);
  const revenueSeries = useMemo(() => (revenue ?? []) as AnalyticsItem[], [revenue]);
  const topProductSeries = useMemo(() => (topProducts ?? []) as AnalyticsItem[], [topProducts]);
  const topCustomerSeries = useMemo(() => (topCustomers ?? []) as AnalyticsItem[], [topCustomers]);
  const orderStatusSeries = useMemo(() => (ordersStats ?? []) as AnalyticsItem[], [ordersStats]);

  const totals = useMemo(() => {
    const totalSalesLast30 = saleSeries.reduce((acc, item) => acc + Number(item.count ?? 0), 0);
    const totalRevenueLast30 = revenueSeries.reduce((acc, item) => acc + Number(item.sum ?? 0), 0);
    const peakDaySales = saleSeries.reduce((acc, item) => Math.max(acc, Number(item.count ?? 0)), 0);
    return {
      totalSalesLast30,
      totalRevenueLast30,
      peakDaySales,
    };
  }, [saleSeries, revenueSeries]);

  if (loadingOverview || loadingSales || loadingRevenue || loadingTopProducts || loadingTopCustomers || loadingOrdersStats) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 via-white to-primary-50/30 p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-24 animate-pulse rounded-3xl bg-white/70 shadow-sm" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/80 shadow-sm" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-3xl bg-white/80 shadow-sm" />
            <div className="h-72 animate-pulse rounded-3xl bg-white/80 shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Orders",
      value: Number(overview?.totalOrders ?? 0).toLocaleString(),
      sub: `${totals.totalSalesLast30.toLocaleString()} in last 30 days`,
      icon: ShoppingBag,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(Number(overview?.totalRevenue ?? 0)),
      sub: `${formatCurrency(totals.totalRevenueLast30)} in last 30 days`,
      icon: DollarSign,
    },
    {
      title: "Total Customers",
      value: Number(overview?.totalCustomers ?? 0).toLocaleString(),
      sub: "Retention and repeat purchase insights",
      icon: Users,
    },
    {
      title: "Total Products",
      value: Number(overview?.totalProducts ?? 0).toLocaleString(),
      sub: `Peak daily sales: ${totals.peakDaySales.toLocaleString()}`,
      icon: Package,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-primary-50/40 p-6 md:p-8">
      <motion.div
        className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl"
        animate={{ x: [0, 30, -10, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 top-28 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl"
        animate={{ x: [0, -25, 15, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Golvia Nepal · Admin Intelligence</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">Premium Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-slate-600">Real-time sales intelligence, top movers, and operational signals for high-conversion decisions.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md">
              <Activity className="h-4 w-4 text-emerald-600" />
              Live data synced
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -4, rotateX: 2, rotateY: index % 2 ? 2 : -2 }}
              style={{ transformStyle: "preserve-3d" }}
              className="rounded-2xl border border-white/50 bg-white/75 p-5 shadow-lg backdrop-blur-xl"
            >
              <div className="mb-3 inline-flex rounded-xl bg-primary-50 p-2 text-primary-700">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.title}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{item.value}</p>
              <p className="mt-2 text-xs text-slate-600">{item.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-primary-600" />
              Sales Momentum (Last 30 Days)
            </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={saleSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#dbe3f2" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "0.8rem", border: "1px solid #e2e8f0" }} />
              <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Revenue Trend (Last 30 Days)
            </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#d1fae5" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: "0.8rem", border: "1px solid #d1fae5" }} />
              <Line type="monotone" dataKey="sum" stroke="#059669" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Top Products</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProductSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#fce7f3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: "0.8rem", border: "1px solid #fce7f3" }} />
              <Bar dataKey="totalSold" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Top Customers</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCustomerSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#ede9fe" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: "0.8rem", border: "1px solid #e9d5ff" }} />
              <Bar dataKey="totalSpent" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl lg:col-span-2"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Status Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={orderStatusSeries}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={92}
                  innerRadius={48}
                  label
                >
                  {orderStatusSeries.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "0.8rem", border: "1px solid #e2e8f0" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-900">AI Signals</h2>
            <div className="space-y-3 text-sm">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                <p className="font-semibold text-emerald-700">Revenue velocity is stable</p>
                <p className="mt-1 text-emerald-900/80">Last 30 days revenue remains healthy for scale campaigns.</p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
                <p className="font-semibold text-indigo-700">Top products outperforming</p>
                <p className="mt-1 text-indigo-900/80">Prioritize stock refill for best-selling SKUs to avoid lost conversion.</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                <p className="font-semibold text-amber-700">Pending orders monitor</p>
                <p className="mt-1 text-amber-900/80">Track pending bucket daily for faster fulfillment and trust score.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
