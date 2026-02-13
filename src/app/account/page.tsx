"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProfile } from "@/hooks/useData";

export default function AccountPage() {
  const { user, isChecking } = useAuthGuard();
  const { user: profile, isLoading } = useProfile();

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Loading account...</p>
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const display = profile || user;

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-10 space-y-6">
        <div>
          <p className="text-sm text-gray-500">Account</p>
          <h1 className="text-3xl font-bold">Hi, {display.firstName}</h1>
          <p className="text-gray-600">Manage your profile and addresses.</p>
        </div>

        {isLoading && <p className="text-gray-600">Loading profile...</p>}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-2">
            <h3 className="text-lg font-semibold">Profile</h3>
            <p className="text-sm text-gray-600">Name: {display.firstName} {display.lastName}</p>
            <p className="text-sm text-gray-600">Email: {display.email}</p>
            {display.phone && <p className="text-sm text-gray-600">Phone: {display.phone}</p>}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Role:</span>
              {display.role === 'SUPER_ADMIN' ? (
                <>
                  <span className="inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">Super Admin</span>
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Admin</span>
                </>
              ) : (
                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                  {display.role.charAt(0) + display.role.slice(1).toLowerCase().replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          <div className="card p-6 space-y-2">
            <h3 className="text-lg font-semibold">Orders</h3>
            <p className="text-sm text-gray-600">Go to your orders list to track deliveries.</p>
            <a href="/account/orders" className="btn-outline inline-flex w-fit">View Orders</a>
          </div>
        </div>
      </div>
    </div>
  );
}
