"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/useData";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function CustomerDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["CUSTOMER", "ADMIN", "SUPER_ADMIN", "VENDOR"] });
  const { orders, isLoading } = useOrders();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Loading your dashboard...</p>
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container space-y-8">
        <div>
          <p className="text-sm text-gray-500">Dashboard</p>
          <h1 className="text-3xl font-bold">Welcome back, {user.firstName}</h1>
          <p className="text-gray-600">Track your orders and manage your account.</p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent orders</h3>
            <Link href="/account/orders" className="text-primary-600 text-sm font-semibold">
              View all
            </Link>
          </div>
          {isLoading && <p className="text-sm text-gray-500">Loading orders...</p>}
          {!isLoading && (!orders || orders.length === 0) && (
            <p className="text-sm text-gray-600">No orders yet. Start shopping to place your first order.</p>
          )}
          {!isLoading && orders && orders.length > 0 && (
            <div className="divide-y">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.items.length} items</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/account" className="card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold">Profile</h3>
            <p className="text-sm text-gray-600">Update your personal details.</p>
          </Link>
          <Link href="/account/addresses" className="card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold">Addresses</h3>
            <p className="text-sm text-gray-600">Manage delivery locations.</p>
          </Link>
          <Link href="/wishlist" className="card p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold">Wishlist</h3>
            <p className="text-sm text-gray-600">View and manage saved items.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
