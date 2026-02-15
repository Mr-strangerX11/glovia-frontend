
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ordersAPI } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (params.orderId) fetchOrder();
    // eslint-disable-next-line
  }, [params.orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await ordersAPI.getById(params.orderId as string);
      setOrder(data);
    } catch (error) {
      toast.error("Failed to load order details");
      router.push("/account/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await ordersAPI.cancel(order.id || order._id);
      toast.success("Order cancelled");
      fetchOrder();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="container py-12 text-center">Loading...</div>;
  }
  if (!order) {
    return <div className="container py-12 text-center">Order not found.</div>;
  }

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
      <p className="text-gray-600 mb-4">Placed on {new Date(order.createdAt).toLocaleString()}</p>
      <div className="mb-4">
        <span className="font-semibold">Status:</span> {order.status}
        {order.status === "CANCELLED" && <span className="ml-2 text-red-600">(Cancelled)</span>}
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Items</h2>
        <ul className="space-y-2">
          {order.items?.map((item: any) => (
            <li key={item.id || item._id} className="flex justify-between border-b pb-2">
              <span>{item.product?.name} x {item.quantity}</span>
              <span>NPR {item.total}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Delivery Address</h2>
        <div className="text-gray-700">
          {order.address?.fullName}<br />
          {order.address?.district}, {order.address?.area}
        </div>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">NPR {order.subtotal?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Charge</span>
            <span className="font-medium">NPR {order.deliveryCharge?.toLocaleString()}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Discount</span>
              <span>-NPR {order.discount?.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-primary-600">NPR {order.total?.toLocaleString()}</span>
          </div>
        </div>
      </div>
      {order.status !== "CANCELLED" && (
        <button
          className="btn-outline text-red-600"
          onClick={handleCancel}
          disabled={cancelling}
        >
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      )}
      <div className="mt-8">
        <Link href="/account/orders" className="btn-primary">Back to My Orders</Link>
      </div>
    </div>
  );
}
