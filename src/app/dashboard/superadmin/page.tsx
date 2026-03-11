"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAdminDashboard, useAdminBrandAnalytics } from "@/hooks/useData";
import { adminAPI } from "@/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Plus,
  Loader2,
  ShieldCheck,
  RefreshCcw,
  Image as ImageIcon,
  Award,
  Tag,
  ChevronRight,
} from "lucide-react";

export default function SuperAdminDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["SUPER_ADMIN"] });
  const { dashboard, isLoading } = useAdminDashboard();
  const { analytics: brandAnalytics, isLoading: brandLoading } = useAdminBrandAnalytics();
  const [fixing, setFixing] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Actions
  const handleFixSuperAdmin = async () => {
    setFixing(true);
    try {
      const { data } = await adminAPI.fixSuperAdminRole();
      toast.success(data?.message || "SuperAdmin role fixed successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fix SuperAdmin role");
    } finally {
      setFixing(false);
    }
  };
  const handleInitializeUsers = async () => {
    if (!confirm("This will create/update default users (SuperAdmin, Admin, Vendor, User). Continue?")) return;
    setInitializing(true);
    try {
      const { data } = await adminAPI.initializeUsers();
      toast.success(data?.message || "Users initialized successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initialize users");
    } finally {
      setInitializing(false);
    }
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading SuperAdmin dashboard…</p>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Total Users", value: dashboard?.totalUsers ?? "—", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Admins", value: dashboard?.totalAdmins ?? "—", icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Vendors", value: dashboard?.totalVendors ?? "—", icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Orders", value: dashboard?.totalOrders ?? "—", icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50" },
    { label: "Revenue", value: dashboard?.totalRevenue ? `NPR ${dashboard.totalRevenue.toLocaleString()}` : "—", icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  const actionItems = [
    { label: "My Account", desc: "Profile and security", href: "/account", icon: UserCheck, color: "text-pink-600", bg: "bg-pink-50", border: "hover:border-pink-300" },
    { label: "Manage Users", desc: "Roles and access", href: "/admin/users", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "hover:border-indigo-300" },
    { label: "Manage Orders", desc: "Processing and delivery", href: "/admin/orders", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-300" },
    { label: "Manage Products", desc: "Catalog and status", href: "/admin/products", icon: Package, color: "text-violet-600", bg: "bg-violet-50", border: "hover:border-violet-300" },
    { label: "Categories", desc: "Main category tree", href: "/admin/categories", icon: Layers, color: "text-cyan-600", bg: "bg-cyan-50", border: "hover:border-cyan-300" },
    { label: "Sub-Categories", desc: "Edit nested categories", href: "/admin/categories?view=subcategories", icon: Layers, color: "text-sky-600", bg: "bg-sky-50", border: "hover:border-sky-300" },
    { label: "Manage Brands", desc: "Brand list and status", href: "/admin/brands", icon: Tag, color: "text-emerald-600", bg: "bg-emerald-50", border: "hover:border-emerald-300" },
    { label: "Add Brand", desc: "Create brand profile", href: "/admin/brands/new", icon: Plus, color: "text-lime-600", bg: "bg-lime-50", border: "hover:border-lime-300" },
    { label: "Offers Images", desc: "Manage homepage banners", href: "/admin/banners", icon: ImageIcon, color: "text-pink-600", bg: "bg-pink-50", border: "hover:border-pink-300" },
    { label: "Create Promo", desc: "Launch campaign code", href: "/admin/promocodes/new", icon: Tag, color: "text-violet-600", bg: "bg-violet-50", border: "hover:border-violet-300" },
    { label: "Promo Codes", desc: "Edit and disable codes", href: "/admin/promocodes", icon: Tag, color: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "hover:border-fuchsia-300" },
    { label: "Loyalty Points", desc: "Rewards and points", href: "/loyalty", icon: Award, color: "text-amber-600", bg: "bg-amber-50", border: "hover:border-amber-300" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 pt-10 pb-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-red-200" />
                <span className="text-red-200 text-sm font-medium">SuperAdmin · Full System Access</span>
              </div>
              <h1 className="text-3xl font-bold">Welcome, {user.firstName} {user.lastName}</h1>
              <p className="text-orange-100 mt-1.5 text-sm">You have unrestricted access to all platform controls.</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleFixSuperAdmin}
                disabled={fixing}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors border border-white/30"
              >
                {fixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                Fix SuperAdmin
              </button>
              <button
                onClick={handleInitializeUsers}
                disabled={initializing}
                className="inline-flex items-center gap-2 bg-white text-red-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
              >
                {initializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Init Users
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container -mt-10 pb-16 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center text-center">
                <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">High-impact admin tools in one click</p>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {actionItems.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-center ${action.border}`}
                >
                  <div className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-gray-900 leading-tight">{action.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{action.desc}</p>
                </Link>
              );
            })}
            {/* Fix SuperAdmin button */}
            <button
              onClick={handleFixSuperAdmin}
              disabled={fixing}
              className="group rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-center hover:border-red-300"
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                {fixing ? <Loader2 className="w-5 h-5 text-red-500 animate-spin" /> : <RefreshCcw className="w-5 h-5 text-red-500" />}
              </div>
              <p className="text-xs font-semibold text-gray-800">Fix SuperAdmin</p>
              <p className="text-xs text-gray-400 mt-0.5">Repair role</p>
            </button>
            {/* Init Users button */}
            <button
              onClick={handleInitializeUsers}
              disabled={initializing}
              className="group rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-center hover:border-blue-300"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                {initializing ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <Users className="w-5 h-5 text-blue-500" />}
              </div>
              <p className="text-xs font-semibold text-gray-800">Init Users</p>
              <p className="text-xs text-gray-400 mt-0.5">Seed defaults</p>
            </button>
          </div>
        </div>

        {/* Recent Users + Recent Orders */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                <p className="text-sm text-gray-500">Newly registered accounts</p>
              </div>
              <Link href="/admin/users" className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700">
                All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-red-100 border-t-red-500 rounded-full animate-spin" />
              </div>
            ) : dashboard?.recentUsers?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {dashboard.recentUsers.slice(0, 5).map((u: any) => (
                  <div key={u.id || u._id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600">{(u.firstName?.[0] || '').toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{u.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No recent users</p>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <p className="text-sm text-gray-500">Latest transactions</p>
              </div>
              <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700">
                All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-red-100 border-t-red-500 rounded-full animate-spin" />
              </div>
            ) : dashboard?.recentOrders?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {dashboard.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">#{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{order.user?.firstName} {order.user?.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">NPR {order.total?.toLocaleString()}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* System Controls */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/admin/settings/announcement"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 group-hover:text-gray-900">Announcements</p>
              <p className="text-sm text-gray-500">Manage platform-wide announcements</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto flex-shrink-0" />
          </Link>
          <Link
            href="/admin/settings/delivery"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 group-hover:text-gray-900">Delivery Settings</p>
              <p className="text-sm text-gray-500">Configure delivery & discount settings</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto flex-shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
