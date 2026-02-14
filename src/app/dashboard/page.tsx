"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardRouterPage() {
  const router = useRouter();
  const { user, isChecking } = useAuthGuard();

  useEffect(() => {
    if (isChecking || !user) return;


    if (user.role === "SUPER_ADMIN") {
      router.replace("/dashboard/superadmin");
      return;
    }
    if (user.role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }

    if (user.role === "VENDOR") {
      router.replace("/dashboard/vendor");
      return;
    }

    router.replace("/dashboard/customer");
  }, [isChecking, router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">Checking your account...</p>
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}
