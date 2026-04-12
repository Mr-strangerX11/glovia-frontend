"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Loader2, Users, Sparkles, Gift, Star, TrendingUp, ChevronRight } from "lucide-react";
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

const TIERS = [
  { name: 'Bronze',   min: 0,    max: 499,   color: 'text-amber-700',  bg: 'bg-amber-50',   ring: 'ring-amber-200',  dark: 'dark:bg-amber-900/10 dark:ring-amber-800/40' },
  { name: 'Silver',   min: 500,  max: 1499,  color: 'text-gray-500',   bg: 'bg-gray-50',    ring: 'ring-gray-200',   dark: 'dark:bg-gray-800/40 dark:ring-gray-700' },
  { name: 'Gold',     min: 1500, max: 4999,  color: 'text-yellow-600', bg: 'bg-yellow-50',  ring: 'ring-yellow-200', dark: 'dark:bg-yellow-900/10 dark:ring-yellow-800/40' },
  { name: 'Platinum', min: 5000, max: Infinity, color: 'text-violet-600', bg: 'bg-violet-50', ring: 'ring-violet-200', dark: 'dark:bg-violet-900/10 dark:ring-violet-800/40' },
];

function getTier(pts: number) {
  return TIERS.find((t) => pts >= t.min && pts <= t.max) ?? TIERS[0];
}

function getNextTier(pts: number) {
  const idx = TIERS.findIndex((t) => pts >= t.min && pts <= t.max);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

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
    return () => { active = false; };
  }, [isAdminView, user]);

  if (isChecking || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  /* ─── Customer View ─── */
  if (!isAdminView) {
    const tier     = getTier(myPoints);
    const nextTier = getNextTier(myPoints);
    const progress = nextTier
      ? Math.min(100, ((myPoints - tier.min) / (nextTier.min - tier.min)) * 100)
      : 100;

    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 pt-14 pb-24">
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-white/8 blur-2xl" />
          <div className="container relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Rewards Program
            </span>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">My Loyalty Points</h1>
                <p className="mt-2 text-orange-100/80 text-sm">Earn points on every purchase, redeem for rewards.</p>
              </div>
              <div className="flex flex-col items-start sm:items-end">
                <p className="text-5xl font-black text-white tabular-nums">{myPoints.toLocaleString()}</p>
                <p className="text-sm font-semibold text-orange-100/70 mt-0.5">points balance</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container relative z-10 -mt-10 pb-16 space-y-6">

          {/* Tier card */}
          <div className={`rounded-2xl border-2 bg-white p-6 shadow-elevation-3 ${tier.ring} ${tier.dark} dark:bg-gray-900`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tier.bg} dark:bg-opacity-10`}>
                  <Award className={`h-6 w-6 ${tier.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Tier</p>
                  <h2 className={`text-xl font-black ${tier.color}`}>{tier.name}</h2>
                </div>
              </div>
              {nextTier && (
                <div className="text-right">
                  <p className="text-xs text-gray-400">Next: <span className="font-semibold text-gray-700 dark:text-gray-300">{nextTier.name}</span></p>
                  <p className="text-xs text-gray-500 mt-0.5">{(nextTier.min - myPoints).toLocaleString()} pts to go</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{tier.name} ({tier.min.toLocaleString()})</span>
                {nextTier && <span>{nextTier.name} ({nextTier.min.toLocaleString()})</span>}
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Star,        label: 'Points Earned', value: myPoints.toLocaleString() },
              { icon: Gift,        label: 'Tier',          value: tier.name },
              { icon: TrendingUp,  label: 'Progress',      value: `${Math.round(progress)}%` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-soft dark:bg-gray-900 dark:border-gray-800">
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
                  <Icon className="h-4.5 w-4.5 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Tier breakdown */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-soft dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-gray-100">All Tiers</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {TIERS.map((t) => {
                const active = t.name === tier.name;
                return (
                  <div key={t.name} className={`flex items-center justify-between px-5 py-3.5 transition-colors ${active ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.bg} dark:bg-opacity-10`}>
                        <Award className={`h-4.5 w-4.5 ${t.color}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${active ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'}`}>{t.name}</p>
                        <p className="text-xs text-gray-400">{t.min.toLocaleString()}+ points</p>
                      </div>
                    </div>
                    {active && (
                      <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        Current
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Admin View ─── */
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 pt-12 pb-20">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="container relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/80 mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Admin View
          </span>
          <h1 className="text-3xl font-bold text-white">Loyalty Points</h1>
          <p className="mt-1.5 text-orange-100/75 text-sm">All users and their loyalty balance.</p>
        </div>
      </section>

      <div className="container relative z-10 -mt-10 pb-16">
        {/* Summary stat */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-elevation-2 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/10">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{rows.length}</p>
                <p className="text-xs text-gray-400">Total Users</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-elevation-2 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
                <Award className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  {rows.reduce((s, r) => s + Number(r.points || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">Total Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-soft dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-600" />
            <h2 className="font-bold text-gray-900 dark:text-gray-100">All Users Points</h2>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Award className="h-10 w-10 text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">No loyalty points found yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-left">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">User</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Email</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Role</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Points</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((item) => {
                    const t = getTier(Number(item.points || 0));
                    return (
                      <tr key={item.userId} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40 group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                              {item.firstName?.[0]}{item.lastName?.[0]}
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {item.firstName} {item.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{item.email}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {item.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                          {Number(item.points || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${t.bg} ${t.color} dark:bg-opacity-10`}>
                            <Award className="h-3 w-3" /> {t.name}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
