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
    <div className="min-h-screen bg-white">
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-2">Sales Analytics</h2>
            <p className="text-gray-600">Coming soon: sales charts, revenue, and performance metrics.</p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-2">Product Management</h2>
            <p className="text-gray-600">Manage your products, inventory, and pricing.</p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-2">Order Tracking</h2>
            <p className="text-gray-600">View and manage your orders and fulfillment status.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
