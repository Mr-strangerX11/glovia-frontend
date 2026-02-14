"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function SuperAdminDashboardPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["SUPER_ADMIN"] });

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Loading superadmin dashboard...</p>
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Superadmin Dashboard</h1>
        <div className="card p-6 mb-6">
          <p className="text-lg font-semibold mb-2">Welcome, {user.firstName} {user.lastName}!</p>
          <p className="text-gray-600 mb-4">You have full access to all admin and system controls.</p>
          <ul className="list-disc pl-6 text-gray-700">
            <li>View and manage all users, admins, and vendors</li>
            <li>System analytics and platform settings</li>
            <li>Access to all admin features</li>
            <li>Special superadmin-only controls (customize as needed)</li>
          </ul>
        </div>
        <Link href="/admin/settings" className="btn-primary">Platform Settings</Link>
      </div>
    </div>
  );
}
