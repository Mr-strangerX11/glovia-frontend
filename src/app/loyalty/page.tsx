"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Loader2, Users } from "lucide-react";
import { loyaltyAPI } from "@/lib/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type LoyaltyRow = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  points: number;
};

export default function LoyaltyPage() {
  const { user, isChecking } = useAuthGuard();
  const [loading, setLoading] = useState(true);
  const [myPoints, setMyPoints] = useState(0);
  const [rows, setRows] = useState<LoyaltyRow[]>([]);

  const isAdminView = useMemo(
    () => user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    [user?.role],
  );

  useEffect(() => {
    if (!user) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        if (isAdminView) {
          const { data } = await loyaltyAPI.getAllPoints();
          if (!active) return;
          setRows(Array.isArray(data) ? data : []);
          setMyPoints(0);
          return;
        }

        const { data } = await loyaltyAPI.getMine();
        if (!active) return;
        setMyPoints(Number(data?.points || 0));
      } catch {
        if (!active) return;
        setRows([]);
        setMyPoints(0);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [isAdminView, user]);

  if (isChecking || !user) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAdminView) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-6 h-6 text-amber-600" />
            <h1 className="text-2xl font-bold">My Loyalty Points</h1>
          </div>
          <p className="text-sm text-gray-600 mb-5">Track your current rewards balance.</p>
          <div className="text-4xl font-bold text-amber-700">{myPoints.toLocaleString()} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Points</h1>
        <p className="text-sm text-gray-600 mt-1">Admin view of loyalty points across customers and users.</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">All Users Points</h2>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-gray-600">No loyalty points found yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-4 font-semibold">User</th>
                  <th className="py-2 pr-4 font-semibold">Email</th>
                  <th className="py-2 pr-4 font-semibold">Role</th>
                  <th className="py-2 font-semibold text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.userId} className="border-b last:border-b-0">
                    <td className="py-3 pr-4 font-medium">{item.firstName} {item.lastName}</td>
                    <td className="py-3 pr-4 text-gray-600">{item.email}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {item.role}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-amber-700">{Number(item.points || 0).toLocaleString()} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}