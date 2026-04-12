'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useOrders } from '@/hooks/useData';
import { Loader2, TrendingUp, Package, DollarSign, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function VendorAnalyticsPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['VENDOR'] });
  const { orders, isLoading } = useOrders();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0) || 0;
  const deliveredOrders = orders?.filter((o: any) => o.status === 'DELIVERED').length || 0;
  const pendingOrders = orders?.filter((o: any) => o.status === 'PENDING').length || 0;

  const stats = [
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: totalOrders,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `NPR ${totalRevenue.toLocaleString()}`,
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Package,
      label: 'Delivered',
      value: deliveredOrders,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: TrendingUp,
      label: 'Pending',
      value: pendingOrders,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-600">Track your performance and sales</p>
          </div>
          <Link href="/dashboard/vendor" className="btn-outline">
            Back to Dashboard
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Order Status Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { status: 'PENDING', count: pendingOrders, color: 'bg-yellow-500' },
                    {
                      status: 'CONFIRMED',
                      count: orders?.filter((o: any) => o.status === 'CONFIRMED').length || 0,
                      color: 'bg-blue-500',
                    },
                    {
                      status: 'PROCESSING',
                      count: orders?.filter((o: any) => o.status === 'PROCESSING').length || 0,
                      color: 'bg-purple-500',
                    },
                    {
                      status: 'SHIPPED',
                      count: orders?.filter((o: any) => o.status === 'SHIPPED').length || 0,
                      color: 'bg-indigo-500',
                    },
                    { status: 'DELIVERED', count: deliveredOrders, color: 'bg-green-500' },
                    {
                      status: 'CANCELLED',
                      count: orders?.filter((o: any) => o.status === 'CANCELLED').length || 0,
                      color: 'bg-red-500',
                    },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium">{item.status}</span>
                      </div>
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order?.id || order?._id || order?.orderNumber} className="flex items-center justify-between py-2 border-b">
                        <div>
                          <p className="text-sm font-medium">
                            Order #{order.orderNumber || (order?.id || order?._id || '').slice(0, 8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">NPR {Number(order.total).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No recent activity</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
