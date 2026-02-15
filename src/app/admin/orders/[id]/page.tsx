'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI } from '@/lib/api';
import { Loader2, Save, ArrowLeft, Tag, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface OrderItem {
  id?: string;
  _id?: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    name: string;
    sku: string;
  };
}

interface Order {
  id?: string;
  _id?: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  items: OrderItem[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  address: {
    fullName: string;
    district: string;
    area: string;
  };
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [formData, setFormData] = useState({
    status: '',
    discount: 0,
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-2 sm:px-4">
        <div className="container max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Order #{order.orderNumber}</h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold mt-2 sm:mt-0 ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sticky bottom-0 z-10 bg-gray-50 py-2 sm:static sm:bg-transparent sm:py-0">
              {order.status !== "CANCELLED" && (
                <button
                  className="btn-outline text-red-600 w-full sm:w-auto"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
              <button
                className="btn-outline bg-red-50 text-red-600 border-red-200 hover:bg-red-100 w-full sm:w-auto"
                onClick={handleDelete}
                disabled={updating}
              >
                {updating ? "Deleting..." : "Delete Order"}
              </button>
            </div>
          </div>

          {/* Main Content Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Order Items & Pricing */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-6">
              {/* Items */}
              <div className="card p-4 sm:p-6 overflow-x-auto">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-3 min-w-[320px]">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <div key={getOrderItemId(item) || `${item.product?.sku || 'unknown'}-${item.price}`} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b last:border-0 gap-2">
                        <div>
                          <p className="font-medium text-base sm:text-lg">{item.product?.name || 'Product'}</p>
                          <p className="text-xs sm:text-sm text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-base sm:text-lg">NPR {Number(item.total).toLocaleString()}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            NPR {Number(item.price).toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No items in this order</p>
                  )}
                </div>
              </div>

              {/* Pricing Breakdown with Admin Controls */}
              <div className="card p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Pricing Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">NPR {Number(order.subtotal).toLocaleString()}</span>
                  </div>

                  {/* Discount Section */}
                  <div className="py-2 border-t">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Discount</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${formData.discount > 0 ? 'text-green-600' : ''}`}>-NPR {Number(formData.discount).toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => setShowDiscountForm(!showDiscountForm)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                        >
                          {showDiscountForm ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                    </div>
                    {showDiscountForm && (
                      <div className="mt-3 pt-3 border-t">
                        <label className="text-sm text-gray-600">Discount Amount (NPR)</label>
                        <input
                          type="number"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                          className="input mt-1"
                          min="0"
                          step="10"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Apply admin discount (e.g., special promotion, customer courtesy)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Delivery Charge Section */}
                  <div className="py-2 border-t">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Delivery Charge</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">NPR {Number(formData.deliveryCharge).toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => setShowDeliveryForm(!showDeliveryForm)}
                          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                        >
                          {showDeliveryForm ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                    </div>
                    {showDeliveryForm && (
                      <div className="mt-3 pt-3 border-t">
                        <label className="text-sm text-gray-600">Delivery Charge (NPR)</label>
                        <input
                          type="number"
                          value={formData.deliveryCharge}
                          onChange={(e) =>
                            setFormData({ ...formData, deliveryCharge: parseFloat(e.target.value) || 0 })
                          }
                          className="input mt-1"
                          min="0"
                          step="10"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Set to 0 for free delivery. Leave or set dynamically based on area.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="py-2 border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-lg text-primary-600">
                        NPR {Number(calculatedTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="card p-4 sm:p-6">
                <h3 className="font-semibold mb-4">Customer</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium break-all">{order.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{order.user.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card p-4 sm:p-6">
                <h3 className="font-semibold mb-4">Delivery Address</h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.address.fullName}</p>
                  <p className="text-gray-600">{order.address.area}</p>
                  <p className="text-gray-600">{order.address.district}</p>
                </div>
              </div>

              {/* Status & Tracking */}
              <form onSubmit={handleSubmit} className="card p-4 sm:p-6 space-y-4">
                <h3 className="font-semibold">Update Order</h3>

                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  {order.status !== "SHIPPED" && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                    <button
                      type="button"
                      className="btn-outline w-full sm:w-auto"
                      onClick={async () => {
                        setUpdating(true);
                        try {
                          await adminAPI.updateOrder(getOrderId(order), { status: "SHIPPED" });
                          toast.success("Order marked as On the Way");
                          await fetchOrder();
                        } catch (e) {
                          toast.error("Failed to update status");
                        } finally {
                          setUpdating(false);
                        }
                      }}
                      disabled={updating}
                    >
                      Mark as On the Way
                    </button>
                  )}
                  {order.status === "SHIPPED" && (
                    <button
                      type="button"
                      className="btn-outline w-full sm:w-auto"
                      onClick={async () => {
                        setUpdating(true);
                        try {
                          await adminAPI.updateOrder(getOrderId(order), { status: "DELIVERED" });
                          toast.success("Order marked as Complete");
                          await fetchOrder();
                        } catch (e) {
                          toast.error("Failed to update status");
                        } finally {
                          setUpdating(false);
                        }
                      }}
                      disabled={updating}
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                    placeholder="e.g., TRK123456"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Delivery Partner</label>
                  <input
                    type="text"
                    value={formData.deliveryPartner}
                    onChange={(e) => setFormData({ ...formData, deliveryPartner: e.target.value })}
                    placeholder="e.g., Courier Company Name"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Admin Note</label>
                  <textarea
                    value={formData.adminNote}
                    onChange={(e) => setFormData({ ...formData, adminNote: e.target.value })}
                    placeholder="Internal notes..."
                    className="input h-20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full btn-primary inline-flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Customer</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium break-all">{order.user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{order.user.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Delivery Address</h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{order.address.fullName}</p>
                  <p className="text-gray-600">{order.address.area}</p>
                  <p className="text-gray-600">{order.address.district}</p>
                </div>
              </div>

              {/* Status & Tracking */}
              <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <h3 className="font-semibold">Update Order</h3>

                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-2 mb-2">
                  {order.status !== "SHIPPED" && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={async () => {
                        setUpdating(true);
                        try {
                          await adminAPI.updateOrder(getOrderId(order), { status: "SHIPPED" });
                          toast.success("Order marked as On the Way");
                          await fetchOrder();
                        } catch (e) {
                          toast.error("Failed to update status");
                        } finally {
                          setUpdating(false);
                        }
                      }}
                      disabled={updating}
                    >
                      Mark as On the Way
                    </button>
                  )}
                  {order.status === "SHIPPED" && (
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={async () => {
                        setUpdating(true);
                        try {
                          await adminAPI.updateOrder(getOrderId(order), { status: "DELIVERED" });
                          toast.success("Order marked as Complete");
                          await fetchOrder();
                        } catch (e) {
                          toast.error("Failed to update status");
                        } finally {
                          setUpdating(false);
                        }
                      }}
                      disabled={updating}
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                    placeholder="e.g., TRK123456"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Delivery Partner</label>
                  <input
                    type="text"
                    value={formData.deliveryPartner}
                    onChange={(e) => setFormData({ ...formData, deliveryPartner: e.target.value })}
                    placeholder="e.g., Courier Company Name"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Admin Note</label>
                  <textarea
                    value={formData.adminNote}
                    onChange={(e) => setFormData({ ...formData, adminNote: e.target.value })}
                    placeholder="Internal notes..."
                    className="input h-20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full btn-primary inline-flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
