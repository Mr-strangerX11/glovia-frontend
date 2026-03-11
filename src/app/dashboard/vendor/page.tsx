"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useOrders, useProfile } from "@/hooks/useData";
import { vendorAPI } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import {
  Loader2, ShoppingBag, DollarSign, Package, Clock,
  UserCircle, BarChart3, Settings, ChevronRight, TrendingUp,
  CheckCircle2, XCircle
} from "lucide-react";

function StatCard({
  label, value, icon: Icon, iconColor, bg, trend
}: {
  label: string; value: string | number; icon: any;
  iconColor: string; bg: string; trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

export default function VendorDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["VENDOR"] });
  const { orders, isLoading } = useOrders();
  const { user: profile } = useProfile();
  const [productCount, setProductCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    const loadProductCount = async () => {
      try {
        setLoadingProducts(true);
        const { data } = await vendorAPI.getProducts({ page: 1, limit: 1 });
        setProductCount(Number(data?.meta?.total || 0));
      } catch {
        setProductCount(0);
      } finally {
        setLoadingProducts(false);
      }
    };
    if (user) loadProductCount();
  }, [user]);

  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((acc, order) => {
    if (order.status === "CANCELLED") return acc;
    return acc + (Number(order.total) || 0);
  }, 0) || 0;
  const inProgress = orders?.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length || 0;
  const deliveredOrders = orders?.filter((o) => o.status === "DELIVERED").length || 0;
  const display = profile || user;

  const stats = useMemo(() => [
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, iconColor: "text-blue-600", bg: "bg-blue-50" },
    { label: "Revenue", value: `NPR ${totalRevenue.toLocaleString()}`, icon: DollarSign, iconColor: "text-green-600", bg: "bg-green-50", trend: "+12%" },
    { label: "Products", value: loadingProducts ? "…" : productCount, icon: Package, iconColor: "text-violet-600", bg: "bg-violet-50" },
    { label: "In Progress", value: inProgress, icon: Clock, iconColor: "text-amber-600", bg: "bg-amber-50" },
  ], [totalOrders, totalRevenue, loadingProducts, productCount, inProgress]);

  const quickActions = [
    { label: "Manage Products", desc: "Create, edit, publish", href: "/vendor/products", icon: Package, color: "text-violet-600", bg: "bg-violet-50", border: "hover:border-violet-300" },
    { label: "View Orders", desc: "Track & fulfill orders", href: "/vendor/orders", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-300" },
    { label: "Analytics", desc: "Sales & performance", href: "/vendor/analytics", icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50", border: "hover:border-emerald-300" },
    { label: "Account Settings", desc: "Profile & contact info", href: "/vendor/account", icon: Settings, color: "text-pink-600", bg: "bg-pink-50", border: "hover:border-pink-300" },
  ];

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading vendor dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 pt-10 pb-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4">
            <div className="text-white">
              <p className="text-violet-200 text-sm font-medium">Vendor Dashboard</p>
              <h1 className="text-3xl font-bold mt-1">
                {display?.firstName} {display?.lastName}'s Store
              </h1>
              <p className="text-violet-200 mt-1.5 text-sm">Manage products, orders, and performance.</p>
            </div>
            <Link
              href="/vendor/products/new"
              className="hidden sm:inline-flex items-center gap-2 bg-white text-violet-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-violet-50 transition-colors shadow-sm"
            >
              <Package className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>
      </div>

      <div className="container -mt-10 pb-16 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick actions + order snapshot */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-500 mt-0.5">Jump to key vendor tools</p>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
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

            {/* Order snapshot */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Order Snapshot</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Live pipeline status</p>
                </div>
                <Link href="/vendor/orders" className="flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Delivered</p>
                    <p className="text-2xl font-bold text-green-700">{deliveredOrders}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <Clock className="w-8 h-8 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-amber-700">{inProgress}</p>
                  </div>
                </div>
              </div>
              {isLoading && (
                <div className="px-6 pb-4 flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Refreshing…
                </div>
              )}
            </div>
          </div>

          {/* Account card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-violet-500 to-blue-500" />
              <div className="px-6 pb-6 -mt-6">
                <div className="w-14 h-14 rounded-2xl border-4 border-white bg-violet-100 flex items-center justify-center shadow">
                  <UserCircle className="w-8 h-8 text-violet-600" />
                </div>
                <div className="mt-3">
                  <p className="font-bold text-gray-900">{display?.firstName} {display?.lastName}</p>
                  <p className="text-sm text-gray-500">{display?.email}</p>
                  {display?.phone && <p className="text-xs text-gray-400 mt-0.5">{display.phone}</p>}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-block text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full border border-violet-200">
                    Vendor
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/vendor/account"
              className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Edit Profile</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
            </Link>

            <div className="bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl p-5 text-white">
              <Package className="w-8 h-8 text-violet-200 mb-3" />
              <p className="font-bold text-lg">{loadingProducts ? "…" : productCount}</p>
              <p className="text-violet-200 text-sm">Active products in your store</p>
              <Link href="/vendor/products" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors">
                Manage <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}