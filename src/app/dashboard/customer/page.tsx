"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/useData";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  MapPin, Heart, UserCircle2, ShoppingBag,
  Clock3, CheckCircle2, ChevronRight, Package, Star
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-purple-100 text-purple-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function CustomerDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["CUSTOMER", "ADMIN", "SUPER_ADMIN", "VENDOR"] });
  const { orders, isLoading } = useOrders();
  const totalOrders = orders?.length || 0;
  const activeOrders = orders?.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length || 0;
  const completedOrders = orders?.filter((o) => o.status === "DELIVERED").length || 0;

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Orders",
      value: activeOrders,
      icon: Clock3,
      gradient: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Delivered",
      value: completedOrders,
      icon: CheckCircle2,
      gradient: "from-emerald-400 to-green-500",
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  const quickActions = [
    {
      label: "My Profile",
      desc: "Update personal details",
      href: "/account",
      icon: UserCircle2,
      color: "text-pink-600",
      bg: "bg-pink-50",
      border: "hover:border-pink-300",
    },
    {
      label: "Addresses",
      desc: "Manage delivery locations",
      href: "/account/addresses",
      icon: MapPin,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "hover:border-violet-300",
    },
    {
      label: "Wishlist",
      desc: "View & manage saved items",
      href: "/wishlist",
      icon: Heart,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "hover:border-rose-300",
    },
    {
      label: "All Orders",
      desc: "Track every purchase",
      href: "/account/orders",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "hover:border-blue-300",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 pt-10 pb-20">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-pink-200 text-sm font-medium">Customer Dashboard</p>
              <h1 className="text-3xl font-bold mt-1">Welcome back, {user.firstName}! 👋</h1>
              <p className="text-pink-100 mt-1.5 text-sm">Here's what's happening with your orders today.</p>
            </div>
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors backdrop-blur-sm border border-white/30"
            >
              <UserCircle2 className="w-4 h-4" />
              My Account
            </Link>
          </div>
        </div>
      </div>

      <div className="container -mt-10 pb-16 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 leading-tight">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500 mt-0.5">Your latest purchases</p>
            </div>
            <Link
              href="/account/orders"
              className="flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700">No orders yet</p>
              <p className="text-sm text-gray-500 mt-1 mb-5">Start shopping to place your first order.</p>
              <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm hover:shadow-md transition-all">
                <Star className="w-4 h-4" /> Browse Products
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id || order.orderNumber}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/70 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-gray-900">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-gray-900">NPR {Number(order.total).toLocaleString()}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500 mt-0.5">Jump to any section instantly</p>
          </div>
          <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
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
