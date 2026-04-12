'use client';

import React from 'react';
import { TrendingUp, Clock, CheckCircle, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient,
}: StatsCardProps) {
  return (
    <div className={`rounded-xl ${gradient} p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-white/20 backdrop-blur-sm">
          <div className="text-white opacity-90">{icon}</div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
            trend.isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            {trend.isPositive ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium opacity-90 mb-1">{title}</h3>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-xs opacity-75 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
