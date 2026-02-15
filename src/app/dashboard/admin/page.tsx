"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAdminDashboard, useAdminBrandAnalytics } from "@/hooks/useData";
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Package, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["ADMIN", "SUPER_ADMIN"] });
  const { dashboard, isLoading } = useAdminDashboard();
  const { analytics: brandAnalytics, isLoading: brandLoading } = useAdminBrandAnalytics();

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
    { 
      label: "Total Revenue", 
      value: dashboard ? `NPR ${dashboard.totalRevenue?.toLocaleString()}` : "N/A",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      change: "+12.5%",
      positive: true
    },
    { 
      label: "Total Orders", 
      value: dashboard?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
      change: "+8.2%",
      positive: true
    },
    { 
      label: "Customers", 
      value: dashboard?.totalCustomers ?? 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      change: "+15.3%",
      positive: true
    },
    { 
      label: "Pending Orders", 
      value: dashboard?.pendingOrders ?? 0,
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
      change: "-5.1%",
      positive: false
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Dashboard</p>
            <h1 className="text-3xl font-bold">Welcome, {user.firstName}</h1>
            <p className="text-gray-600">Manage products, orders, and customers.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/admin/products" className="btn-outline flex items-center gap-2">
              <Package className="w-4 h-4" />
              Manage Products
            </Link>
            <Link href="/admin/products/new" className="btn-primary">
              Add Product
            </Link>
            <Link href="/admin/orders" className="btn-outline">
              View Orders
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${item.bg}`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    {item.positive ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Overview */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Revenue Overview</h3>
                <p className="text-sm text-gray-600">Monthly revenue trends</p>
              </div>
              <select className="input-sm">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            {/* Simple revenue chart placeholder */}
            <div className="h-64 bg-gradient-to-t from-primary-50 to-transparent rounded-lg flex items-end justify-around p-4 gap-2">
              {[40, 65, 55, 80, 70, 90, 85].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary-600 rounded-t hover:bg-primary-700 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`Day ${i + 1}: NPR ${(height * 1000).toLocaleString()}`}
                  />
                  <span className="text-xs text-gray-500">Day {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Order Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Completed</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {dashboard?.totalOrders ? Math.floor(dashboard.totalOrders * 0.7) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">Pending</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {dashboard?.pendingOrders ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Processing</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {dashboard?.totalOrders ? Math.floor(dashboard.totalOrders * 0.2) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Cancelled</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {dashboard?.totalOrders ? Math.floor(dashboard.totalOrders * 0.1) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <Link href="/admin/orders" className="text-primary-600 text-sm font-semibold hover:underline">
                View all →
              </Link>
            </div>
            {isLoading && <p className="text-sm text-gray-600">Loading orders...</p>}
            {!isLoading && dashboard?.recentOrders?.length === 0 && (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No recent orders.</p>
              </div>
            )}
            {!isLoading && dashboard?.recentOrders?.length > 0 && (
              <div className="divide-y">
                {dashboard.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold">#{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500">{order.user?.firstName} {order.user?.lastName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">NPR {order.total?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top Selling Products</h3>
              <Link href="/admin/products" className="text-primary-600 text-sm font-semibold hover:underline">
                Manage products →
              </Link>
            </div>
            {isLoading && <p className="text-sm text-gray-600">Loading products...</p>}
            {!isLoading && (!dashboard?.topProducts || dashboard.topProducts.length === 0) && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No product data yet.</p>
              </div>
            )}
            {!isLoading && dashboard?.topProducts && dashboard.topProducts.length > 0 && (
              <div className="space-y-3">
                {dashboard.topProducts.map((item: any, index: number) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-gray-500">{item._sum?.quantity || 0} units sold</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brand Analytics */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Brand Performance</h3>
            <Link href="/admin/brands" className="text-primary-600 text-sm font-semibold hover:underline">
              Manage brands →
            </Link>
          </div>
          {brandLoading && <p className="text-sm text-gray-600">Loading brand data...</p>}
          {!brandLoading && brandAnalytics && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    <p className="text-sm text-gray-600">Total Brands</p>
                  </div>
                  <p className="text-2xl font-bold text-primary-700">{brandAnalytics.totalBrands || 0}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-gray-600">Active Brands</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{brandAnalytics.activeBrands || 0}</p>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Brands by Revenue</h4>
              {brandAnalytics.brandPerformance?.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No brand performance data yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {brandAnalytics.brandPerformance?.slice(0, 5).map((brand: any, idx: number) => (
                    <div key={brand.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                          idx === 1 ? 'bg-gray-200 text-gray-700' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{brand.name}</p>
                          <p className="text-xs text-gray-500">{brand.productCount} products</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary-600">
                        NPR {brand.revenue?.toLocaleString() || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>



        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Link href="/admin/products/new" className="group p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center">
              <Package className="w-10 h-10 text-gray-400 group-hover:text-primary-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">Add Product</p>
              <p className="text-xs text-gray-500 mt-1">Create new catalog item</p>
            </Link>
            <Link href="/admin/brands" className="group p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center">
              <TrendingUp className="w-10 h-10 text-gray-400 group-hover:text-primary-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">Manage Brands</p>
              <p className="text-xs text-gray-500 mt-1">View and edit brands</p>
            </Link>
            <Link href="/admin/orders" className="group p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center">
              <ShoppingBag className="w-10 h-10 text-gray-400 group-hover:text-primary-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">View Orders</p>
              <p className="text-xs text-gray-500 mt-1">Review and fulfill orders</p>
            </Link>
            <Link href="/admin/users" className="group p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-center">
              <Users className="w-10 h-10 text-gray-400 group-hover:text-primary-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700 group-hover:text-primary-700">Manage Users</p>
              <p className="text-xs text-gray-500 mt-1">User and role management</p>
            </Link>
            <Link href="/admin/settings/delivery" className="group p-5 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center">
              <DollarSign className="w-10 h-10 text-gray-400 group-hover:text-green-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700 group-hover:text-green-700">Delivery Settings</p>
              <p className="text-xs text-gray-500 mt-1">Configure discounts & delivery</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
