"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useOrders } from "@/hooks/useData";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  MapPin, Heart, UserCircle2, ShoppingBag, Clock3, CheckCircle2,
  ChevronRight, Package, Star, TrendingUp, ArrowRight, Sparkles,
} from "lucide-react";

const ActivityFeed = dynamic(() => import("@/components/ActivityFeed"), {
  ssr: false,
  loading: () => null,
});

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    PENDING:    { bg: "bg-amber-100",   text: "text-amber-700" },
    CONFIRMED:  { bg: "bg-blue-100",    text: "text-blue-700" },
    PROCESSING: { bg: "bg-violet-100",  text: "text-violet-700" },
    SHIPPED:    { bg: "bg-indigo-100",  text: "text-indigo-700" },
    DELIVERED:  { bg: "bg-emerald-100", text: "text-emerald-700" },
    CANCELLED:  { bg: "bg-red-100",     text: "text-red-700" },
  };
  const s = map[status] || { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, gradient, bg, iconColor }: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-13 h-13 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`} style={{ width: 52, height: 52 }}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-black text-gray-900 leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["CUSTOMER", "ADMIN", "SUPER_ADMIN", "VENDOR"] });
  const { orders, isLoading } = useOrders();

  const totalOrders     = orders?.length || 0;
  const activeOrders    = orders?.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length || 0;
  const completedOrders = orders?.filter((o) => o.status === "DELIVERED").length || 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Orders",  value: totalOrders,     icon: ShoppingBag,   gradient: "from-blue-500 to-blue-600",    bg: "bg-blue-50",    iconColor: "text-blue-600" },
    { label: "Active Orders", value: activeOrders,    icon: Clock3,         gradient: "from-amber-400 to-orange-500", bg: "bg-amber-50",   iconColor: "text-amber-600" },
    { label: "Delivered",     value: completedOrders, icon: CheckCircle2,   gradient: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
  ];

  const quickActions = [
    { label: "My Profile",  desc: "Update personal details",    href: "/account",           icon: UserCircle2, color: "text-pink-600",   bg: "bg-pink-50",   hoverBorder: "hover:border-pink-200" },
    { label: "Addresses",   desc: "Manage delivery locations",  href: "/account/addresses", icon: MapPin,      color: "text-violet-600", bg: "bg-violet-50", hoverBorder: "hover:border-violet-200" },
    { label: "Wishlist",    desc: "View & manage saved items",  href: "/wishlist",          icon: Heart,       color: "text-rose-600",   bg: "bg-rose-50",   hoverBorder: "hover:border-rose-200" },
    { label: "All Orders",  desc: "Track every purchase",       href: "/account/orders",    icon: Package,     color: "text-blue-600",   bg: "bg-blue-50",   hoverBorder: "hover:border-blue-200" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 pt-10 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-36 -mt-36 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="text-white">
              <p className="text-pink-200 text-sm font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> {greeting}
              </p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {user.firstName} {user.lastName}!
              </h1>
              <p className="text-pink-100 mt-1.5 text-sm">
                {totalOrders > 0 ? `You have ${activeOrders > 0 ? `${activeOrders} active order${activeOrders > 1 ? "s" : ""}` : "no active orders"} right now.` : "Start shopping — your first order awaits!"}
              </p>
            </div>
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all backdrop-blur-sm border border-white/30 flex-shrink-0"
            >
              <UserCircle2 className="w-4 h-4" />
              My Account
            </Link>
          </div>
        </div>
      </div>

      <div className="container -mt-14 pb-16 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Recent Orders + Quick Actions side-by-side on large screens */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
                <p className="text-xs text-gray-400 mt-0.5">Your latest purchases</p>
              </div>
              <Link href="/account/orders" className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Loading orders…</p>
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-14 px-6">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-7 h-7 text-gray-300" />
                </div>
                <p className="font-bold text-gray-700 text-sm">No orders yet</p>
                <p className="text-xs text-gray-400 mt-1 mb-5">Start shopping to place your first order.</p>
                <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow hover:shadow-md transition-all">
                  <Star className="w-4 h-4" /> Browse Products
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id || order.orderNumber}
                    href={`/account/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-4 h-4 text-pink-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} />
                      <p className="text-sm font-black text-gray-900 hidden sm:block">NPR {Number(order.total).toLocaleString()}</p>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
              <p className="text-xs text-gray-400 mt-0.5">Jump to any section</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`group rounded-xl border border-gray-100 bg-gray-50 p-4 hover:shadow-sm hover:-translate-y-0.5 transition-all ${action.hoverBorder}`}
                  >
                    <div className={`w-9 h-9 ${action.bg} rounded-lg flex items-center justify-center mb-2.5`}>
                      <Icon className={`w-4.5 h-4.5 ${action.color}`} style={{ width: 18, height: 18 }} />
                    </div>
                    <p className="text-xs font-bold text-gray-800">{action.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{action.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* What's New */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">What&apos;s New</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest products added to the store</p>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
              Shop now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-6">
            {ActivityFeed && <ActivityFeed limit={6} compact={true} actionFilter="CREATE_PRODUCT" />}
          </div>
        </div>

        {/* Promotions banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-violet-200 text-xs font-bold uppercase tracking-wider mb-1">Free Delivery</p>
            <p className="text-white text-lg font-black">On orders above NPR 2,000</p>
            <p className="text-violet-200 text-sm mt-1">Shop more, save more!</p>
          </div>
          <Link
            href="/products"
            className="relative z-10 flex-shrink-0 flex items-center gap-2 bg-white text-violet-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-violet-50 transition-colors shadow-lg"
          >
            <TrendingUp className="w-4 h-4" /> Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
