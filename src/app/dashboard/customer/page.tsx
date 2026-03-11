"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/useData";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { MapPin, Heart, UserCircle2, ShoppingBag, Clock3, CheckCircle2 } from "lucide-react";

export default function CustomerDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["CUSTOMER", "ADMIN", "SUPER_ADMIN", "VENDOR"] });
  const { orders, isLoading } = useOrders();
  const totalOrders = orders?.length || 0;
  const activeOrders = orders?.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length || 0;
  const completedOrders = orders?.filter((order) => order.status === "DELIVERED").length || 0;
  const quickActionCardBase = "group rounded-2xl border border-gray-200 bg-white p-5 min-h-[138px] hover:shadow-md hover:-translate-y-0.5 transition-all";
  const quickActionIconBase = "w-8 h-8 mb-2";

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </div>
          <div className="card p-5">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
              <Clock3 className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm text-gray-600">Active Orders</p>
            <p className="text-2xl font-bold">{activeOrders}</p>
          </div>
          <div className="card p-5">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Delivered</p>
            <p className="text-2xl font-bold">{completedOrders}</p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent orders</h3>
            <Link href="/account/orders#orders-section" className="text-primary-600 text-sm font-semibold">
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
                <div key={order.id || order.orderNumber} className="py-3 flex items-center justify-between">
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

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/account" className={`${quickActionCardBase} hover:border-primary-300`}>
              <UserCircle2 className={`${quickActionIconBase} text-primary-600`} />
              <p className="text-sm font-semibold text-gray-900">Profile</p>
              <p className="text-xs text-gray-500 mt-1">Update your personal details.</p>
            </Link>
            <Link href="/account/addresses" className={`${quickActionCardBase} hover:border-blue-300`}>
              <MapPin className={`${quickActionIconBase} text-blue-600`} />
              <p className="text-sm font-semibold text-gray-900">Addresses</p>
              <p className="text-xs text-gray-500 mt-1">Manage delivery locations.</p>
            </Link>
            <Link href="/wishlist" className={`${quickActionCardBase} hover:border-pink-300`}>
              <Heart className={`${quickActionIconBase} text-pink-600`} />
              <p className="text-sm font-semibold text-gray-900">Wishlist</p>
              <p className="text-xs text-gray-500 mt-1">View and manage saved items.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
