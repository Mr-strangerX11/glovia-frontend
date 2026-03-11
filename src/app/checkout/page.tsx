"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAddresses, useCart } from "@/hooks/useData";
import { cartAPI, ordersAPI, promoCodesAPI } from "@/lib/api";
import { PaymentMethod } from "@/types";
import { Minus, Plus, ChevronRight, ShieldCheck, Tag } from "lucide-react";

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
  const [promoCode, setPromoCode] = useState("");
  const [promoPreviewDiscount, setPromoPreviewDiscount] = useState(0);
  const [promoValidationMessage, setPromoValidationMessage] = useState<string | null>(null);
  const [isPromoValid, setIsPromoValid] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [validatedSubtotal, setValidatedSubtotal] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trustMessage, setTrustMessage] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;
  const hasPromoCodeInput = !!promoCode.trim();
  const estimatedTotalAfterDiscount = Math.max(0, total - promoPreviewDiscount);

  useEffect(() => {
    if (!isPromoValid || validatedSubtotal === null) return;
    if (total !== validatedSubtotal) {
      setIsPromoValid(false);
      setPromoPreviewDiscount(0);
      setPromoValidationMessage("Cart updated. Please validate promo code again.");
      setValidatedSubtotal(null);
    }
  }, [total, isPromoValid, validatedSubtotal]);

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

    if (hasPromoCodeInput && !isPromoValid) {
      toast.error("Please validate a valid promo code before placing order");
      return;
    }

    try {
      setIsSubmitting(true);
      setTrustMessage(null);
      const payload = {
        addressId: effectiveAddressId,
        items: items.map((item) => ({
          productId: item.product?.id || item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        couponCode: promoCode.trim().toUpperCase() || undefined,
        note: note.trim() || undefined,
        clearCart: true,
      };

      const response = await ordersAPI.create(payload);
      await mutateCart();
      toast.success("Order placed successfully!");
      router.push("/checkout/confirmation");
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.message === 'Insufficient verification to place orders') {
        const missing = Array.isArray(errorData?.missing) ? errorData.missing.join(' & ') : 'email/phone verification';
        const message = `Verify ${missing} to place orders.`;
        setTrustMessage(message);
        toast.error(message);
      } else {
        toast.error(errorData?.message || "Failed to place order");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidatePromoCode = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter promo code");
      return;
    }

    try {
      setIsValidatingPromo(true);
      setPromoValidationMessage(null);

      const { data } = await promoCodesAPI.getByCode(code);
      const minOrderAmount = Number(data?.minOrderAmount || 0);
      const usageLimit = Number(data?.usageLimit || 0);
      const usageCount = Number(data?.usageCount || 0);

      if (minOrderAmount > 0 && total < minOrderAmount) {
        setIsPromoValid(false);
        setPromoPreviewDiscount(0);
        setPromoValidationMessage(`Minimum order NPR ${minOrderAmount.toLocaleString()} required for this code.`);
        toast.error("Order amount does not meet minimum for this promo");
        return;
      }

      if (usageLimit > 0 && usageCount >= usageLimit) {
        setIsPromoValid(false);
        setPromoPreviewDiscount(0);
        setPromoValidationMessage("Promo code usage limit reached.");
        toast.error("Promo code usage limit reached");
        return;
      }

      const discountType = String(data?.discountType || "").toUpperCase();
      const discountValue = Number(data?.discountValue || 0);
      let calculatedDiscount = 0;

      if (discountType === "PERCENTAGE") {
        calculatedDiscount = (total * discountValue) / 100;
        const maxDiscount = Number(data?.maxDiscount || 0);
        if (maxDiscount > 0) {
          calculatedDiscount = Math.min(calculatedDiscount, maxDiscount);
        }
      } else {
        calculatedDiscount = discountValue;
      }

      calculatedDiscount = Math.max(0, Math.min(calculatedDiscount, total));

      setIsPromoValid(true);
      setPromoPreviewDiscount(calculatedDiscount);
      setPromoValidationMessage(`Promo applied. Estimated discount: NPR ${calculatedDiscount.toLocaleString()}`);
      setValidatedSubtotal(total);
      toast.success("Promo code is valid");
    } catch (error: any) {
      setIsPromoValid(false);
      setPromoPreviewDiscount(0);
      setValidatedSubtotal(null);
      setPromoValidationMessage(error?.response?.data?.message || "Invalid promo code");
      toast.error(error?.response?.data?.message || "Invalid promo code");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleClearPromoCode = () => {
    setPromoCode("");
    setIsPromoValid(false);
    setPromoPreviewDiscount(0);
    setPromoValidationMessage(null);
    setValidatedSubtotal(null);
  };

  const handleUpdateQuantity = async (itemId: string, nextQuantity: number) => {
    if (nextQuantity < 1) return;
    try {
      setUpdatingItemId(itemId);
      await cartAPI.update(itemId, nextQuantity);
      await mutateCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (isChecking || cartLoading || addressesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Preparing checkout…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 pt-10 pb-20">
        <div className="container text-white">
          <p className="text-rose-200 text-sm font-medium mb-1">Checkout</p>
          <h1 className="text-3xl font-bold">Complete your order</h1>
          <p className="text-pink-100 mt-1 text-sm">Secure checkout • Verified payment gateways • Fast Nepal delivery</p>
        </div>
      </div>

      <div className="container -mt-10 pb-12 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft px-4 py-3 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 text-gray-700 font-semibold"><span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs">1</span> Address</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="inline-flex items-center gap-1.5 text-gray-700 font-semibold"><span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs">2</span> Payment</span>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <span className="inline-flex items-center gap-1.5 text-gray-700 font-semibold"><span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs">3</span> Confirm</span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-8 space-y-4 text-center">
            <p className="text-gray-600">Your cart is empty.</p>
            <Link href="/products" className="btn-primary w-fit">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {trustMessage && (
                <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4">
                  {trustMessage}
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4">
                <h2 className="text-lg font-semibold">Delivery Address</h2>

                {addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${
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

              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4">
                <h2 className="text-lg font-semibold">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${
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

              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4">
                <h2 className="text-lg font-semibold">Promo Code (Optional)</h2>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs text-primary-700 bg-primary-50 border border-primary-100 rounded-lg px-3 py-1.5">
                    <Tag className="w-3.5 h-3.5" /> Apply promo before placing order
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setIsPromoValid(false);
                        setPromoPreviewDiscount(0);
                        setPromoValidationMessage(null);
                        setValidatedSubtotal(null);
                      }}
                      className="input"
                      placeholder="Enter promo code"
                    />
                    <button
                      type="button"
                      className="btn-outline whitespace-nowrap"
                      onClick={handleValidatePromoCode}
                      disabled={isValidatingPromo || !promoCode.trim()}
                    >
                      {isValidatingPromo ? "Validating..." : "Validate"}
                    </button>
                    <button
                      type="button"
                      className="btn-outline whitespace-nowrap"
                      onClick={handleClearPromoCode}
                      disabled={!promoCode.trim() && !promoValidationMessage}
                    >
                      Clear
                    </button>
                  </div>
                  {promoValidationMessage && (
                    <p className={`text-xs ${isPromoValid ? "text-green-600" : "text-red-600"}`}>
                      {promoValidationMessage}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Validated promo code will be applied when you place order.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4">
                <h2 className="text-lg font-semibold">Order Note (Optional)</h2>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input min-h-[120px]"
                  placeholder="Add any special instructions for delivery..."
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 space-y-4 h-fit sticky top-24">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="inline-flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Your payment details are protected
              </div>
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
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
                          disabled={updatingItemId === item.id || item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-gray-700">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
                          disabled={updatingItemId === item.id}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">NPR {item.product?.price}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium">NPR {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-NPR {promoPreviewDiscount.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-primary-600">NPR {estimatedTotalAfterDiscount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Final amount including delivery will be shown after placing order</p>
              </div>

              <button
                type="button"
                className="btn-primary w-full rounded-xl"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || items.length === 0 || (hasPromoCodeInput && !isPromoValid)}
              >
                {isSubmitting ? "Placing order..." : "Place Order"}
              </button>
              {isPromoValid && hasPromoCodeInput && (
                <div className="w-full text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md py-2 px-3 flex items-center justify-between gap-3">
                  <span>Applied: {promoCode.trim().toUpperCase()} • Saved NPR {promoPreviewDiscount.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={handleClearPromoCode}
                    className="text-green-800 hover:text-green-900 underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <Link href="/cart" className="text-sm text-gray-500 hover:text-gray-700 text-center">
                Back to Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
