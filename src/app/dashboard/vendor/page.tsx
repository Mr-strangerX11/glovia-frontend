"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useOrders, useProfile } from "@/hooks/useData";
import { vendorAPI } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ShoppingBag, DollarSign, Package, Clock, UserCircle, BarChart3, Settings } from "lucide-react";

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

    if (user) {
      loadProductCount();
    }
  }, [user]);

  const totalOrders = orders?.length || 0;
  const totalRevenue =
    orders?.reduce((acc, order) => {
      if (order.status === "CANCELLED") return acc;
      return acc + (Number(order.total) || 0);
    }, 0) || 0;
  const inProgress =
    orders?.filter((order) => order.status !== "DELIVERED" && order.status !== "CANCELLED").length || 0;
  const deliveredOrders = orders?.filter((order) => order.status === "DELIVERED").length || 0;
  const display = profile || user;

  const stats = useMemo(
    () => [
      {
        label: "Orders",
        value: totalOrders,
        icon: ShoppingBag,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        label: "Revenue",
        value: `NPR ${totalRevenue.toLocaleString()}`,
        icon: DollarSign,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        label: "Products",
        value: loadingProducts ? "..." : productCount,
        icon: Package,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
      {
        label: "In Progress",
        value: inProgress,
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
    ],
    [totalOrders, totalRevenue, loadingProducts, productCount, inProgress]
  );

  const quickActionCardBase = "group rounded-2xl border border-gray-200 bg-white p-5 min-h-[138px] hover:shadow-md hover:-translate-y-0.5 transition-all";
  const quickActionIconBase = "w-8 h-8 mb-2";

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

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container space-y-8">
        <div>
          <p className="text-sm text-gray-500">Dashboard</p>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-gray-600">Manage your account, products, and order performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card p-6">
                <div className={`w-11 h-11 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/vendor/products" className={`${quickActionCardBase} hover:border-violet-300`}>
                <Package className={`${quickActionIconBase} text-violet-600`} />
                <p className="text-sm font-semibold text-gray-900">Manage Products</p>
                <p className="text-xs text-gray-500 mt-1">Create, edit, and publish items</p>
              </Link>
              <Link href="/vendor/orders" className={`${quickActionCardBase} hover:border-blue-300`}>
                <ShoppingBag className={`${quickActionIconBase} text-blue-600`} />
                <p className="text-sm font-semibold text-gray-900">View Orders</p>
                <p className="text-xs text-gray-500 mt-1">Track and fulfill customer orders</p>
              </Link>
              <Link href="/vendor/analytics" className={`${quickActionCardBase} hover:border-emerald-300`}>
                <BarChart3 className={`${quickActionIconBase} text-emerald-600`} />
                <p className="text-sm font-semibold text-gray-900">Open Analytics</p>
                <p className="text-xs text-gray-500 mt-1">Review sales and performance</p>
              </Link>
              <Link href="/vendor/account" className={`${quickActionCardBase} hover:border-primary-300`}>
                <Settings className={`${quickActionIconBase} text-primary-600`} />
                <p className="text-sm font-semibold text-gray-900">Update Account</p>
                <p className="text-xs text-gray-500 mt-1">Edit profile and contact info</p>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Order Snapshot</h3>
              <p className="text-sm text-gray-600">Delivered: <span className="font-semibold text-gray-900">{deliveredOrders}</span></p>
              <p className="text-sm text-gray-600">Active Pipeline: <span className="font-semibold text-gray-900">{inProgress}</span></p>
              {isLoading && <p className="text-sm text-gray-500 mt-2">Refreshing order data...</p>}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold">{display.firstName} {display.lastName}</p>
                <p className="text-sm text-gray-600">{display.email}</p>
              </div>
            </div>
            {display.phone && <p className="text-sm text-gray-600 mb-4">Phone: {display.phone}</p>}
            <Link href="/vendor/account" className="btn-outline w-full text-center">Edit Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
