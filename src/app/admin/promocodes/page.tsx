"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { promoCodesAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Trash2, RefreshCw } from "lucide-react";

type PromoCodeItem = {
  _id?: string;
  id?: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount?: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  createdAt?: string;
};

const getPromoId = (promo: PromoCodeItem) => promo._id || promo.id || "";

export default function AdminPromoCodesPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["SUPER_ADMIN"] });
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPromoCodes = async () => {
    try {
      setIsLoading(true);
      const { data } = await promoCodesAPI.getAllAdmin();
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load promo codes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isChecking && user) {
      loadPromoCodes();
    }
  }, [isChecking, user]);

  const stats = useMemo(() => {
    const now = Date.now();
    const activeCount = promoCodes.filter((item) => item.isActive).length;
    const expiredCount = promoCodes.filter((item) => item.validUntil && new Date(item.validUntil).getTime() < now).length;
    return { total: promoCodes.length, activeCount, expiredCount };
  }, [promoCodes]);

  const handleDelete = async (promo: PromoCodeItem) => {
    const promoId = getPromoId(promo);
    if (!promoId) {
      toast.error("Promo ID missing");
      return;
    }

    if (!confirm(`Delete promo code ${promo.code}?`)) return;

    try {
      setDeletingId(promoId);
      await promoCodesAPI.remove(promoId);
      toast.success("Promo code removed");
      setPromoCodes((prev) => prev.filter((item) => getPromoId(item) !== promoId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove promo code");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatus = (promo: PromoCodeItem) => {
    const now = new Date();
    if (!promo.isActive) return { label: "Inactive", className: "bg-gray-100 text-gray-700" };
    if (promo.validUntil && now > new Date(promo.validUntil)) return { label: "Expired", className: "bg-red-100 text-red-700" };
    if (promo.validFrom && now < new Date(promo.validFrom)) return { label: "Scheduled", className: "bg-yellow-100 text-yellow-700" };
    return { label: "Active", className: "bg-green-100 text-green-700" };
  };

  if (isChecking || !user) {
    return (
      <div className="p-8">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard/superadmin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to SuperAdmin Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Manage Promo Codes</h1>
            <p className="text-gray-600 mt-1">Add, monitor usage, check expiry, and remove promo codes.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={loadPromoCodes} className="btn-outline inline-flex items-center gap-2" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link href="/admin/promocodes/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Promo Code
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-sm text-gray-600">Total Promo Codes</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-700">{stats.activeCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-600">Expired</p>
            <p className="text-2xl font-bold text-red-700">{stats.expiredCount}</p>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-left px-4 py-3">Discount</th>
                  <th className="text-left px-4 py-3">Usage</th>
                  <th className="text-left px-4 py-3">Expiry Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading promo codes...</td>
                  </tr>
                ) : promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No promo codes found.</td>
                  </tr>
                ) : (
                  promoCodes.map((promo) => {
                    const status = getStatus(promo);
                    const usageCount = Number(promo.usageCount || 0);
                    const usageLimit = Number(promo.usageLimit || 0);
                    const usageText = usageLimit > 0 ? `${usageCount}/${usageLimit}` : `${usageCount} (Unlimited)`;
                    const expiryText = promo.validUntil ? new Date(promo.validUntil).toLocaleString() : "N/A";
                    const discountText = promo.discountType === "PERCENTAGE"
                      ? `${promo.discountValue}%${promo.maxDiscount ? ` (max NPR ${promo.maxDiscount})` : ""}`
                      : `NPR ${promo.discountValue}`;

                    return (
                      <tr key={getPromoId(promo) || promo.code} className="border-t">
                        <td className="px-4 py-3">
                          <p className="font-semibold">{promo.code}</p>
                          {promo.description && <p className="text-xs text-gray-500">{promo.description}</p>}
                        </td>
                        <td className="px-4 py-3">{discountText}</td>
                        <td className="px-4 py-3">{usageText}</td>
                        <td className="px-4 py-3">{expiryText}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${status.className}`}>{status.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(promo)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                            disabled={deletingId === getPromoId(promo)}
                          >
                            <Trash2 className="w-4 h-4" />
                            {deletingId === getPromoId(promo) ? "Removing..." : "Remove"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
