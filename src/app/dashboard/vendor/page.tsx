"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useOrders } from "@/hooks/useData";

export default function VendorDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["VENDOR"] });
  const { orders, isLoading } = useOrders();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Loading vendor dashboard...</p>
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0;
  const inProgress = orders?.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container space-y-8">
        <div>
          <p className="text-sm text-gray-500">Vendor Dashboard</p>
          <h1 className="text-3xl font-bold">Welcome, {user.firstName}</h1>
          <p className="text-gray-600">Manage your products and monitor orders you fulfill.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ label: "Total Orders", value: totalOrders }, { label: "Revenue", value: `NPR ${totalRevenue}` }, { label: "In Progress", value: inProgress }].map((m) => (
            <div key={m.label} className="card p-4">
              <p className="text-sm text-gray-500">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent orders</h3>
            <Link href="/vendor/orders" className="text-primary-600 text-sm font-semibold">
              View all
            </Link>
          </div>
          {isLoading && <p className="text-sm text-gray-600">Loading orders...</p>}
          {!isLoading && (!orders || orders.length === 0) && (
            <p className="text-sm text-gray-600">No orders yet.</p>
          )}
          {!isLoading && orders && orders.length > 0 && (
            <div className="divide-y">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id || order.orderNumber} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Order #{order.orderNumber || order.id.slice(0, 6)}</p>
                    <p className="text-xs text-gray-500 uppercase">{order.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">NPR {order.total}</p>
                    <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/vendor/products" className="card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold">My Products</h3>
            <p className="text-sm text-gray-600">Create and manage the products you supply.</p>
          </Link>
          <Link href="/vendor/orders" className="card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold">Orders</h3>
            <p className="text-sm text-gray-600">Track orders assigned to you.</p>
          </Link>
          <Link href="/vendor/analytics" className="card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold">Analytics</h3>
            <p className="text-sm text-gray-600">See performance and payouts.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
