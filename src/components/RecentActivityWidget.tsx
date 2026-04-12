"use client";

import React from "react";
import ActivityFeed from "./ActivityFeed";
import { Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RecentActivityWidgetProps {
  limit?: number;
  actionFilter?: string;
  showHeader?: boolean;
  showViewAll?: boolean;
  className?: string;
}

export default function RecentActivityWidget({
  limit = 5,
  actionFilter,
  showHeader = true,
  showViewAll = true,
  className = "",
}: RecentActivityWidgetProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
        </div>
      )}

      <div className="p-4">
        <ActivityFeed limit={limit} compact={true} actionFilter={actionFilter} />
      </div>

      {showViewAll && (
        <div className="px-4 pb-4 pt-0">
          <Link
            href="/admin/auditlog"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All Activity
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
