import React from "react";
import Link from "next/link";

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Your order has been successfully confirmed.</h1>
      <p className="mb-6 text-gray-700 max-w-xl">
        We’re preparing it now and will notify you once it’s out for delivery.<br />
        Thank you for shopping with us!
      </p>
      <Link href="/account/orders" className="btn-primary">
        View My Orders
      </Link>
    </div>
  );
}
