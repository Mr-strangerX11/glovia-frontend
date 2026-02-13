"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Eye } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import useAuthGuard from "@/hooks/useAuthGuard";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isChecking } = useAuthGuard(["SUPER_ADMIN", "ADMIN"]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isChecking && user) {
      fetchDashboard();
    }
  }, [isChecking, user]);

  const fetchDashboard = async () => {
    try {
      const { data } = await adminAPI.getDashboard();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-blue-500",
      link: "/admin/products",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-green-500",
      link: "/admin/users",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-purple-500",
      link: "/admin/orders",
    },
    {
      title: "Revenue",
      value: `₨${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-yellow-500",
      link: "/admin/orders",
    },
  ];

  const quickLinks = [
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings/delivery", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || user?.email}</p>
          {user?.role === "SUPER_ADMIN" && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-semibold">
                Super Admin
              </span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link
              key={index}
              href={stat.link}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <link.icon className="w-8 h-8 text-primary-600" />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-primary-600 hover:underline">
                View All
              </Link>
            </div>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.slice(0, 5).map((order: any) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium">#{order._id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">{order.user?.name || order.user?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₨{order.totalAmount}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            )}
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Low Stock Alert</h2>
              <Link href="/admin/products" className="text-sm text-primary-600 hover:underline">
                View All
              </Link>
            </div>
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockProducts.slice(0, 5).map((product: any) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        {product.stockQuantity} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">All products in stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
