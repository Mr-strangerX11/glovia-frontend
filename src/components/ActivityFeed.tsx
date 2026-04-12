"use client";

import React, { useEffect, useState } from "react";
import { auditAPI, type AuditLog } from "@/lib/auditApi";
import {
  Package,
  Tag,
  User,
  Settings,
  Zap,
  Loader2,
  AlertCircle,
  Clock,
  ThumbsUp,
  Edit3,
  Trash2,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
  limit?: number;
  compact?: boolean;
  actionFilter?: string;
  className?: string;
}

/**
 * Get icon for action type
 */
function getActionIcon(action: string) {
  const iconClass = "w-5 h-5";
  switch (action) {
    case "CREATE_PRODUCT":
      return <Package className={`${iconClass} text-blue-500`} />;
    case "UPDATE_PRODUCT":
      return <Edit3 className={`${iconClass} text-blue-400`} />;
    case "DELETE_PRODUCT":
      return <Trash2 className={`${iconClass} text-red-500`} />;
    case "UPDATE_CATEGORY":
      return <Tag className={`${iconClass} text-purple-500`} />;
    case "DELETE_CATEGORY":
      return <Trash2 className={`${iconClass} text-red-500`} />;
    case "UPDATE_BRAND":
      return <Package className={`${iconClass} text-indigo-500`} />;
    case "DELETE_BRAND":
      return <Trash2 className={`${iconClass} text-red-500`} />;
    case "UPDATE_USER_PERMISSIONS":
      return <User className={`${iconClass} text-green-500`} />;
    case "CREATE_PROMO":
      return <Zap className={`${iconClass} text-yellow-500`} />;
    case "UPDATE_PROMO":
      return <Edit3 className={`${iconClass} text-yellow-400`} />;
    case "UPDATE_SETTINGS":
      return <Settings className={`${iconClass} text-gray-600`} />;
    default:
      return <Eye className={`${iconClass} text-gray-400`} />;
  }
}

/**
 * Get color scheme for action
 */
function getActionColor(action: string) {
  switch (action) {
    case "CREATE_PRODUCT":
    case "CREATE_PROMO":
      return "bg-blue-500/10 border-blue-200";
    case "UPDATE_PRODUCT":
    case "UPDATE_CATEGORY":
    case "UPDATE_BRAND":
    case "UPDATE_PROMO":
    case "UPDATE_SETTINGS":
    case "UPDATE_USER_PERMISSIONS":
      return "bg-amber-500/10 border-amber-200";
    case "DELETE_PRODUCT":
    case "DELETE_CATEGORY":
    case "DELETE_BRAND":
      return "bg-red-500/10 border-red-200";
    default:
      return "bg-gray-500/10 border-gray-200";
  }
}

/**
 * Get readable action label
 */
function getActionLabel(action: string): string {
  return action
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default function ActivityFeed({
  limit = 10,
  compact = false,
  actionFilter,
  className = "",
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, [limit, actionFilter]);

  const loadActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let logs: AuditLog[];
      if (actionFilter) {
        logs = await auditAPI.getByAction(actionFilter, limit);
      } else {
        logs = await auditAPI.getRecent(limit);
      }
      setActivities(logs);
    } catch (err) {
      setError("Failed to load activities");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ${className}`}>
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activities yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {activities.map((activity) => (
        <div
          key={activity._id}
          className={`flex gap-3 p-3 rounded-lg border ${getActionColor(activity.action)} transition-all hover:shadow-md`}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">{getActionIcon(activity.action)}</div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {getActionLabel(activity.action)}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {activity.performedByEmail}
                </p>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {!compact && activity.details && (
              <p className="text-xs text-gray-600 mt-1 truncate">
                {typeof activity.details === "object"
                  ? Object.values(activity.details)
                      .filter((v) => v)
                      .join(" • ")
                  : String(activity.details)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
