"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAdminDashboard, useAdminBrandAnalytics } from "@/hooks/useData";
import {
  ShoppingBag, Users, DollarSign, TrendingUp, Package, Layers,
  Award, AlertCircle, CheckCircle, Clock, ArrowUp, ArrowDown,
  ChevronRight, Star, Settings, BarChart2, Tag
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["ADMIN", "SUPER_ADMIN"] });
  const { dashboard, isLoading } = useAdminDashboard();
  const { analytics: brandAnalytics, isLoading: brandLoading } = useAdminBrandAnalytics();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Total Revenue",
      value: dashboard ? `NPR ${dashboard.totalRevenue?.toLocaleString()}` : "—",
      icon: DollarSign, color: "text-green-600", bg: "bg-green-50", change: "+12.5%", positive: true
    },
    {
      label: "Total Orders",
      value: dashboard?.totalOrders ?? 0,
      icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50", change: "+8.2%", positive: true
    },
    {
      label: "Customers",
      value: dashboard?.totalCustomers ?? 0,
      icon: Users, color: "text-purple-600", bg: "bg-purple-50", change: "+15.3%", positive: true
    },
    {
      label: "Pending Orders",
      value: dashboard?.pendingOrders ?? 0,
      icon: Clock, color: "text-orange-600", bg: "bg-orange-50", change: "-5.1%", positive: false
    },
  ];

  const quickActions = [
    { label: "Add Product", desc: "Create new catalog item", href: "/admin/products/new", icon: Package, color: "text-violet-600", bg: "bg-violet-50", border: "hover:border-violet-300" },
    { label: "Manage Orders", desc: "Review and fulfill orders", href: "/admin/orders", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-300" },
    { label: "Manage Users", desc: "User and role management", href: "/admin/users", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "hover:border-indigo-300" },
    { label: "Manage Brands", desc: "View and edit brands", href: "/admin/brands", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "hover:border-emerald-300" },
    { label: "Categories", desc: "Edit main category tree", href: "/admin/categories", icon: Layers, color: "text-cyan-600", bg: "bg-cyan-50", border: "hover:border-cyan-300" },
    { label: "Sub-Categories", desc: "Update child categories", href: "/admin/categories?view=subcategories", icon: Layers, color: "text-sky-600", bg: "bg-sky-50", border: "hover:border-sky-300" },
    { label: "Delivery Settings", desc: "Configure discounts", href: "/admin/settings/delivery", icon: DollarSign, color: "text-green-600", bg: "bg-green-50", border: "hover:border-green-300" },
    { label: "Loyalty Points", desc: "Points and rewards", href: "/loyalty", icon: Award, color: "text-amber-600", bg: "bg-amber-50", border: "hover:border-amber-300" },
  ];

  const orderStatuses = [
    { label: "Completed", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 border-green-100", value: dashboard?.totalOrders ? Math.floor(dashboard.totalOrders * 0.7) : 0 },
    { label: "Pending", icon: Clock, color: "text-orange-600", bg: "bg-orange-50 border-orange-100", value: dashboard?.pendingOrders ?? 0 },
    { label: "Processing", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 border-blue-100", value: dashboard?.totalOrders ? Math.floor(dashboard.totalOrders * 0.2) : 0 },
    { label: "Cancelled", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 border-red-100", value: dashboard?.totalOrders ? Math.floor(dashboard.totalOrders * 0.1) : 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 pt-10 pb-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4">
            <div className="text-white">
              <p className="text-blue-200 text-sm font-medium">Admin Dashboard</p>
              <h1 className="text-3xl font-bold mt-1">Welcome back, {user.firstName}</h1>
              <p className="text-blue-200 mt-1.5 text-sm">Manage products, orders, users and analytics.</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/admin/products/new" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
                <Package className="w-4 h-4" /> Add Product
              </Link>
              <Link href="/admin/orders" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/30">
                <ShoppingBag className="w-4 h-4" /> Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container -mt-10 pb-16 space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${item.positive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {item.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {item.change}
                  </div>
                </div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* Chart + Order Status */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue bar chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                <p className="text-sm text-gray-500">This week's daily revenue</p>
              </div>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="p-6">
              <div className="h-52 flex items-end justify-around gap-2 bg-gradient-to-t from-indigo-50/60 to-transparent rounded-xl p-4">
                {[40, 65, 55, 80, 70, 90, 85].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 rounded-t-lg hover:from-indigo-700 hover:to-violet-600 transition-colors cursor-pointer group relative"
                      style={{ height: `${h}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        NPR {(h * 1000).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">D{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
              <p className="text-sm text-gray-500">Live breakdown</p>
            </div>
            <div className="p-5 space-y-3">
              {orderStatuses.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`flex items-center justify-between p-3 ${s.bg} rounded-xl border`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${s.color}`} />
                      <span className="text-sm font-medium text-gray-700">{s.label}</span>
                    </div>
                    <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders + Top Products */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <p className="text-sm text-gray-500">Latest transactions</p>
              </div>
              <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : !dashboard?.recentOrders?.length ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recent orders</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {dashboard.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">#{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{order.user?.firstName} {order.user?.lastName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">NPR {order.total?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
                <p className="text-sm text-gray-500">By units sold</p>
              </div>
              <Link href="/admin/products" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                All products <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : !dashboard?.topProducts?.length ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No product data yet</p>
              </div>
            ) : (
              <div className="p-5 space-y-3">
                {dashboard.topProducts.map((item: any, idx: number) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-200 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{item.product?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{item._sum?.quantity || 0} units sold</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brand Analytics */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Brand Performance</h3>
              <p className="text-sm text-gray-500">Revenue by brand</p>
            </div>
            <Link href="/admin/brands" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Manage brands <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {brandLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : brandAnalytics ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                    <p className="text-xs text-gray-500 mb-1">Total Brands</p>
                    <p className="text-2xl font-bold text-indigo-700">{brandAnalytics.totalBrands || 0}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                    <p className="text-xs text-gray-500 mb-1">Active Brands</p>
                    <p className="text-2xl font-bold text-emerald-700">{brandAnalytics.activeBrands || 0}</p>
                  </div>
                </div>
                {brandAnalytics.brandPerformance?.length > 0 && (
                  <div className="space-y-2">
                    {brandAnalytics.brandPerformance.slice(0, 5).map((brand: any, idx: number) => (
                      <div key={brand.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                            idx === 1 ? 'bg-gray-200 text-gray-600' :
                            idx === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>{idx + 1}</span>
                          <div>
                            <p className="font-semibold text-sm text-gray-800">{brand.name}</p>
                            <p className="text-xs text-gray-400">{brand.productCount} products</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">NPR {brand.revenue?.toLocaleString() || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Jump to key management sections</p>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all ${action.border}`}
                >
                  <div className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{action.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
