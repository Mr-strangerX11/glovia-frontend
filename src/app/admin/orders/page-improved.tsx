'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, Alert } from '@/components/ui';
import { PageLayout, PageSection } from '@/components/ui';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string };
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  createdAt: string;
  updatedAt: string;
}

const mockOrders: Order[] = [
  {
    _id: '1',
    orderNumber: 'ORD-001234',
    customer: { name: 'John Doe', email: 'john@example.com' },
    total: 5999,
    status: 'delivered',
    items: 3,
    createdAt: '2026-04-08',
    updatedAt: '2026-04-09',
  },
  {
    _id: '2',
    orderNumber: 'ORD-001235',
    customer: { name: 'Jane Smith', email: 'jane@example.com' },
    total: 3499,
    status: 'processing',
    items: 1,
    createdAt: '2026-04-09',
    updatedAt: '2026-04-09',
  },
  {
    _id: '3',
    orderNumber: 'ORD-001236',
    customer: { name: 'Bob Wilson', email: 'bob@example.com' },
    total: 8999,
    status: 'pending',
    items: 5,
    createdAt: '2026-04-09',
    updatedAt: '2026-04-09',
  },
];

export default function ImprovedOrdersAdminPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  if (isChecking || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const statuses = [
    { value: 'all', label: 'All Orders', icon: '📦', count: mockOrders.length },
    { value: 'pending', label: 'Pending', icon: '⏳', count: mockOrders.filter(o => o.status === 'pending').length },
    { value: 'processing', label: 'Processing', icon: '⚙️', count: mockOrders.filter(o => o.status === 'processing').length },
    { value: 'shipped', label: 'Shipped', icon: '🚚', count: mockOrders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: 'Delivered', icon: '✅', count: mockOrders.filter(o => o.status === 'delivered').length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Orders', value: mockOrders.length, icon: '📦', color: 'primary' },
    { label: 'Pending', value: mockOrders.filter(o => o.status === 'pending').length, icon: '⏳', color: 'warning' },
    { label: 'Delivered', value: mockOrders.filter(o => o.status === 'delivered').length, icon: '✅', color: 'success' },
    { label: 'Revenue', value: `NPR ${mockOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`, icon: '💰', color: 'info' },
  ];

  return (
    <PageLayout
      title="Orders Management"
      subtitle="View, manage, and fulfill customer orders"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="primary">Add Order</Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <PageSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} hover shadow="md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`text-3xl opacity-20`}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      {/* Status Tabs */}
      <PageSection>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                statusFilter === status.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
              }`}
            >
              <span>{status.icon}</span>
              <span>{status.label}</span>
              <span className="ml-1 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {status.count}
              </span>
            </button>
          ))}
        </div>
      </PageSection>

      {/* Search and Filters */}
      <PageSection>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>
      </PageSection>

      {/* Orders Table */}
      <PageSection>
        {filteredOrders.length === 0 ? (
          <Alert variant="info" title="No orders found" description="Try adjusting your search or filters" />
        ) : (
          <Card shadow="md">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order #</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer.name}</p>
                          <p className="text-sm text-gray-600">{order.customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-medium">{order.items}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">NPR {order.total.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(order.status)} size="sm">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-primary-100 rounded-lg transition-colors text-primary-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <CardFooter className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredOrders.length}</span> orders
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </PageSection>
    </PageLayout>
  );
}
