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
  Plus,
  Loader2,
  Settings,
  ShieldCheck,
  RefreshCcw,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Loading superadmin dashboard...</p>
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Metrics
  const metrics = [
    {
      label: "Total Users",
      value: dashboard?.totalUsers ?? "-",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Admins",
      value: dashboard?.totalAdmins ?? "-",
      icon: ShieldCheck,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Vendors",
      value: dashboard?.totalVendors ?? "-",
      icon: UserCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Orders",
      value: dashboard?.totalOrders ?? "-",
      icon: ShoppingBag,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Revenue",
      value: dashboard?.totalRevenue ? `NPR ${dashboard.totalRevenue.toLocaleString()}` : "-",
      icon: DollarSign,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">SuperAdmin Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.firstName} {user.lastName}! You have full system access.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/settings" className="btn-outline flex items-center gap-2">
              <Settings className="w-4 h-4" /> Platform Settings
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card p-6 flex flex-col items-center justify-center">
                <div className={`p-3 rounded-lg mb-2 ${item.bg}`}><Icon className={`w-6 h-6 ${item.color}`} /></div>
                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link href="/admin/users" className="group p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center">
              <Users className="w-8 h-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">Manage Users</p>
            </Link>
            <Link href="/admin/users?role=ADMIN" className="group p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-center">
              <ShieldCheck className="w-8 h-8 text-orange-400 group-hover:text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-orange-700 group-hover:text-orange-800">Manage Admins</p>
            </Link>
            <Link href="/admin/users?role=VENDOR" className="group p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center">
              <UserCheck className="w-8 h-8 text-purple-400 group-hover:text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-purple-700 group-hover:text-purple-800">Manage Vendors</p>
            </Link>
            <Link href="/admin/orders" className="group p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center">
              <ShoppingBag className="w-8 h-8 text-green-400 group-hover:text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-700 group-hover:text-green-800">Manage Orders</p>
            </Link>
            <Link href="/admin/products" className="group p-4 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center">
              <Package className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-indigo-700 group-hover:text-indigo-800">Manage Products</p>
            </Link>
            <button
              onClick={handleFixSuperAdmin}
              className="group p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-center flex flex-col items-center"
              disabled={fixing}
              title="Fix SuperAdmin role if incorrect"
            >
              <RefreshCcw className="w-8 h-8 text-red-400 group-hover:text-red-600 mx-auto mb-2 animate-spin" style={{ display: fixing ? 'block' : 'none' }} />
              <UserCheck className="w-8 h-8 text-red-400 group-hover:text-red-600 mx-auto mb-2" style={{ display: fixing ? 'none' : 'block' }} />
              <p className="text-sm font-semibold text-red-700 group-hover:text-red-800">Fix SuperAdmin</p>
            </button>
            <button
              onClick={handleInitializeUsers}
              className="group p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center flex flex-col items-center"
              disabled={initializing}
              title="Initialize default users"
            >
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2 animate-spin" style={{ display: initializing ? 'block' : 'none' }} />
              <Users className="w-8 h-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2" style={{ display: initializing ? 'none' : 'block' }} />
              <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">Init Users</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
            ) : dashboard?.recentUsers?.length > 0 ? (
              <div className="divide-y">
                {dashboard.recentUsers.slice(0, 5).map((u: any) => (
                  <div key={u.id || u._id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded transition-colors">
                    <div>
                      <p className="font-semibold">{u.firstName} {u.lastName}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{u.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No recent users.</p>
              </div>
            )}
          </div>
          {/* Recent Orders */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
            ) : dashboard?.recentOrders?.length > 0 ? (
              <div className="divide-y">
                {dashboard.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded transition-colors">
                    <div>
                      <p className="font-semibold">#{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{order.user?.firstName} {order.user?.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">NPR {order.total?.toLocaleString()}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No recent orders.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Link href="/admin/settings/announcement" className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <Package className="w-8 h-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Announcements</h3>
              <p className="text-gray-600 text-sm">Manage platform-wide announcements</p>
            </div>
          </Link>
          <Link href="/admin/settings/delivery" className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Delivery Settings</h3>
              <p className="text-gray-600 text-sm">Configure delivery & discount settings</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
