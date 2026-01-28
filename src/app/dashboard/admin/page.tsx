"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAdminDashboard } from "@/hooks/useData";

export default function AdminDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["ADMIN", "SUPER_ADMIN"] });
  const { dashboard, isLoading } = useAdminDashboard();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Loading admin dashboard...</p>
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Total Orders", value: dashboard?.totalOrders ?? 0 },
    { label: "Total Revenue", value: dashboard ? `NPR ${dashboard.totalRevenue}` : "N/A" },
    { label: "Customers", value: dashboard?.totalCustomers ?? 0 },
    { label: "Pending Orders", value: dashboard?.pendingOrders ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container space-y-8">
        <div>
          <p className="text-sm text-gray-500">Dashboard</p>
          <h1 className="text-3xl font-bold">Welcome, {user.firstName}</h1>
          <p className="text-gray-600">Manage products, orders, and customers.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((item) => (
            <div key={item.label} className="card p-4">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent orders</h3>
              <Link href="/admin/orders" className="text-primary-600 text-sm font-semibold">
                View all
              </Link>
            </div>
            {isLoading && <p className="text-sm text-gray-600">Loading orders...</p>}
            {!isLoading && dashboard?.recentOrders?.length === 0 && (
              <p className="text-sm text-gray-600">No recent orders.</p>
            )}
            {!isLoading && dashboard?.recentOrders?.length > 0 && (
              <div className="divide-y">
                {dashboard.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Order #{order.orderNumber || order.id.slice(0, 6)}</p>
                      <p className="text-sm text-gray-500">{order.user?.firstName} {order.user?.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">NPR {order.total}</p>
                      <p className="text-xs text-gray-500 uppercase">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top products</h3>
              <Link href="/admin/products" className="text-primary-600 text-sm font-semibold">
                Manage products
              </Link>
            </div>
            {isLoading && <p className="text-sm text-gray-600">Loading products...</p>}
            {!isLoading && dashboard?.topProducts?.length === 0 && (
              <p className="text-sm text-gray-600">No product data yet.</p>
            )}
            {!isLoading && dashboard?.topProducts?.length > 0 && (
              <div className="space-y-3">
                {dashboard.topProducts.map((p: any, idx: number) => (
                  <div key={p.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700">{p.product?.name || p.productId}</span>
                    </div>
                    <span className="text-sm font-semibold">{p._sum?.quantity || 0} sold</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/products" className="card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold">Products</h3>
            <p className="text-sm text-gray-600">Create, edit, and manage catalog items.</p>
          </Link>
          <Link href="/admin/orders" className="card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold">Orders</h3>
            <p className="text-sm text-gray-600">Review orders, update status, and handle fulfillment.</p>
          </Link>
          <Link href="/admin/users" className="card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold">Users & Roles</h3>
            <p className="text-sm text-gray-600">Manage customers and admins with proper access.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
