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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading superadmin dashboard...</p>
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

  const quickActionCardBase = "group rounded-2xl border border-gray-200 bg-white p-5 min-h-[138px] hover:shadow-md hover:-translate-y-0.5 transition-all text-center";
  const quickActionIconBase = "w-8 h-8 mx-auto mb-2";

  return (
    <div className="min-h-screen bg-gray-50 py-10 dark:bg-gray-950">
      <div className="container space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">SuperAdmin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Welcome, {user.firstName} {user.lastName}! You have full system access.</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card p-6 flex flex-col items-center justify-center">
                <div className={`p-3 rounded-lg mb-2 ${item.bg}`}><Icon className={`w-6 h-6 ${item.color}`} /></div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-1">Quick Actions</h3>
          <p className="text-sm text-gray-500 mb-4">Go to high-impact admin tools in one click.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link href="/account" className={`${quickActionCardBase} border-primary-200 hover:border-primary-400`}>
              <UserCheck className={`${quickActionIconBase} text-primary-600`} />
              <p className="text-sm font-semibold text-gray-900">My Account</p>
              <p className="text-xs text-gray-500 mt-1">Profile and security</p>
            </Link>
            <Link href="/admin/users" className={`${quickActionCardBase} hover:border-indigo-300`}>
              <Users className={`${quickActionIconBase} text-indigo-600`} />
              <p className="text-sm font-semibold text-gray-900">Manage Users</p>
              <p className="text-xs text-gray-500 mt-1">Roles and access</p>
            </Link>
            <Link href="/admin/orders" className={`${quickActionCardBase} hover:border-blue-300`}>
              <ShoppingBag className={`${quickActionIconBase} text-blue-600`} />
              <p className="text-sm font-semibold text-gray-900">Manage Orders</p>
              <p className="text-xs text-gray-500 mt-1">Processing and delivery</p>
            </Link>
            <Link href="/admin/products" className={`${quickActionCardBase} hover:border-violet-300`}>
              <Package className={`${quickActionIconBase} text-violet-600`} />
              <p className="text-sm font-semibold text-gray-900">Manage Products</p>
              <p className="text-xs text-gray-500 mt-1">Catalog and status</p>
            </Link>
            <Link href="/admin/categories" className={`${quickActionCardBase} hover:border-cyan-300`}>
              <Layers className={`${quickActionIconBase} text-cyan-600`} />
              <p className="text-sm font-semibold text-gray-900">Manage Categories</p>
              <p className="text-xs text-gray-500 mt-1">Main category tree</p>
            </Link>
            <Link href="/admin/categories/new?level=sub" className={`${quickActionCardBase} hover:border-sky-300`}>
              <Plus className={`${quickActionIconBase} text-sky-600`} />
              <p className="text-sm font-semibold text-gray-900">Add Sub-Category</p>
              <p className="text-xs text-gray-500 mt-1">Create child category</p>
            </Link>
            <Link href="/admin/categories?view=subcategories" className={`${quickActionCardBase} hover:border-blue-300`}>
              <Layers className={`${quickActionIconBase} text-blue-600`} />
              <p className="text-sm font-semibold text-gray-900">Manage Sub-Categories</p>
              <p className="text-xs text-gray-500 mt-1">Edit nested categories</p>
            </Link>
            <Link href="/admin/brands" className={`${quickActionCardBase} hover:border-emerald-300`}>
              <Tag className={`${quickActionIconBase} text-emerald-600`} />
              <p className="text-sm font-semibold text-gray-900">Manage Brands</p>
              <p className="text-xs text-gray-500 mt-1">Brand list and status</p>
            </Link>
            <Link href="/admin/brands/new" className={`${quickActionCardBase} hover:border-lime-300`}>
              <Plus className={`${quickActionIconBase} text-lime-600`} />
              <p className="text-sm font-semibold text-gray-900">Add Brand</p>
              <p className="text-xs text-gray-500 mt-1">Create brand profile</p>
            </Link>
            <Link href="/admin/banners" className={`${quickActionCardBase} hover:border-pink-300`}>
              <ImageIcon className={`${quickActionIconBase} text-pink-600`} />
              <p className="text-sm font-semibold text-gray-900">Offers Images</p>
              <p className="text-xs text-gray-500 mt-1">Manage homepage offers</p>
            </Link>
            <Link href="/admin/promocodes/new" className={`${quickActionCardBase} hover:border-violet-300`}>
              <Tag className={`${quickActionIconBase} text-violet-600`} />
              <p className="text-sm font-semibold text-gray-900">Create Promo Code</p>
              <p className="text-xs text-gray-500 mt-1">Launch new campaign code</p>
            </Link>
            <Link href="/admin/promocodes" className={`${quickActionCardBase} hover:border-fuchsia-300`}>
              <Tag className={`${quickActionIconBase} text-fuchsia-600`} />
              <p className="text-sm font-semibold text-gray-900">Manage Promo Codes</p>
              <p className="text-xs text-gray-500 mt-1">Edit and disable codes</p>
            </Link>
            <Link href="/loyalty" className={`${quickActionCardBase} hover:border-amber-300`}>
              <Award className={`${quickActionIconBase} text-amber-600`} />
              <p className="text-sm font-semibold text-gray-900">Loyalty Points</p>
              <p className="text-xs text-gray-500 mt-1">Rewards and points</p>
            </Link>
            <button
              onClick={handleFixSuperAdmin}
              className={`${quickActionCardBase} hover:border-red-300 flex flex-col items-center`}
              disabled={fixing}
              title="Fix SuperAdmin role if incorrect"
            >
              <RefreshCcw className={`${quickActionIconBase} text-red-400 group-hover:text-red-600 animate-spin`} style={{ display: fixing ? 'block' : 'none' }} />
              <UserCheck className={`${quickActionIconBase} text-red-400 group-hover:text-red-600`} style={{ display: fixing ? 'none' : 'block' }} />
              <p className="text-sm font-semibold text-gray-900">Fix SuperAdmin</p>
              <p className="text-xs text-gray-500 mt-1">Repair superadmin role</p>
            </button>
            <button
              onClick={handleInitializeUsers}
              className={`${quickActionCardBase} hover:border-primary-300 flex flex-col items-center`}
              disabled={initializing}
              title="Initialize default users"
            >
              <Plus className={`${quickActionIconBase} text-gray-400 group-hover:text-primary-600 dark:text-gray-500 dark:group-hover:text-primary-300 animate-spin`} style={{ display: initializing ? 'block' : 'none' }} />
              <Users className={`${quickActionIconBase} text-gray-400 group-hover:text-primary-600 dark:text-gray-500 dark:group-hover:text-primary-300`} style={{ display: initializing ? 'none' : 'block' }} />
              <p className="text-sm font-semibold text-gray-900">Init Users</p>
              <p className="text-xs text-gray-500 mt-1">Seed default accounts</p>
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
                  <div key={u.id || u._id} className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded transition-colors">
                    <div>
                      <p className="font-semibold dark:text-gray-100">{u.firstName} {u.lastName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{u.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No recent users.</p>
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
                  <div key={order.id} className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded transition-colors">
                    <div>
                      <p className="font-semibold dark:text-gray-100">#{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.user?.firstName} {order.user?.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold dark:text-gray-100">NPR {order.total?.toLocaleString()}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No recent orders.</p>
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
              <p className="text-gray-600 dark:text-gray-300 text-sm">Manage platform-wide announcements</p>
            </div>
          </Link>
          <Link href="/admin/settings/delivery" className="card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Delivery Settings</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Configure delivery & discount settings</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
