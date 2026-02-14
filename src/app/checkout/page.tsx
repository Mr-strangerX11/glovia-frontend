"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAddresses, useCart } from "@/hooks/useData";
import { ordersAPI } from "@/lib/api";
import { PaymentMethod } from "@/types";

const paymentMethods: { value: PaymentMethod; label: string; description: string }[] = [
  {
    value: "CASH_ON_DELIVERY",
    label: "Cash on Delivery",
    description: "Pay when your order is delivered",
  },
  {
    value: "ESEWA",
    label: "eSewa",
    description: "Pay securely using eSewa",
  },
  {
    value: "KHALTI",
    label: "Khalti",
    description: "Pay securely using Khalti",
  },
  {
    value: "IME_PAY",
    label: "IME Pay",
    description: "Pay securely using IME Pay",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
    description: "Transfer to our bank account",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isChecking } = useAuthGuard({ redirectTo: "/auth/login" });
  const { cart, isLoading: cartLoading, mutate: mutateCart } = useCart();
  const { addresses, isLoading: addressesLoading } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;

  const defaultAddressId = useMemo(() => {
    if (!addresses || addresses.length === 0) return "";
    const defaultAddress = addresses.find((address) => address.isDefault);
    return defaultAddress?.id || addresses[0]?.id || "";
  }, [addresses]);

  const effectiveAddressId = selectedAddressId || defaultAddressId;

  const handlePlaceOrder = async () => {
    if (!effectiveAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        addressId: effectiveAddressId,
        items: items.map((item) => ({
          productId: item.product?.id || item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        note: note.trim() || undefined,
        clearCart: true,
      };

      const response = await ordersAPI.create(payload);
      await mutateCart();
      toast.success("Order placed successfully!");
      router.push(`/account/orders/${response.data._id || response.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking || cartLoading || addressesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-10 space-y-6">
        <div>
          <p className="text-sm text-gray-500">Checkout</p>
          <h1 className="text-3xl font-bold">Complete your order</h1>
        </div>

        {items.length === 0 ? (
          <div className="card p-6 space-y-4">
            <p className="text-gray-600">Your cart is empty.</p>
            <Link href="/products" className="btn-primary w-fit">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Delivery Address</h2>

                {addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
                          effectiveAddressId === address.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={effectiveAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <p className="font-semibold">
                            {address.fullName} {address.isDefault && "(Default)"}
                          </p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">
                            {address.area}, Ward {address.wardNo}, {address.municipality}, {address.district},
                            {" "}{address.province}
                          </p>
                          {address.landmark && (
                            <p className="text-sm text-gray-600">Landmark: {address.landmark}</p>
                          )}
                        </div>
                      </label>
                    ))}
                    <Link href="/account/addresses" className="text-primary-600 text-sm font-medium">
                      Manage addresses
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-600">No delivery address found.</p>
                    <Link href="/account/addresses" className="btn-primary w-fit">
                      Add Address
                    </Link>
                  </div>
                )}
              </div>

              <div className="card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
                        paymentMethod === method.value
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-semibold">{method.label}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="card p-6 space-y-4">
                <h2 className="text-lg font-semibold">Order Note (Optional)</h2>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input min-h-[120px]"
                  placeholder="Add any special instructions for delivery..."
                />
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <Image
                        src={item.product?.images?.[0]?.url || "/placeholder.jpg"}
                        alt={item.product?.name || "Product"}
                        fill
                        sizes="56px"
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">NPR {item.product?.price}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items ({items.length})</span>
                  <span>NPR {total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>NPR {total}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary w-full"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? "Placing order..." : "Place Order"}
              </button>
              <Link href="/cart" className="text-sm text-gray-500 text-center">
                Back to Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
