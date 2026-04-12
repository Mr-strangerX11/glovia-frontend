"use client";

import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useState, useEffect } from "react";
import { Mail, Download, Eye, Search, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui";
import { newsletterAPI } from "@/lib/api";

interface Subscriber {
  _id: string;
  email: string;
  source: string;
  createdAt: string;
  isActive: boolean;
}

interface SubscriberResponse {
  subscribers: Subscriber[];
  total: number;
  limit?: number;
  skip?: number;
}

export default function SubscribersPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["ADMIN", "SUPER_ADMIN"] });
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    if (user) {
      fetchSubscribers();
    }
  }, [user, page]);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const response = await newsletterAPI.getAllSubscribers(pageSize, (page - 1) * pageSize) as any;
      const data = response.data || response;
      setSubscribers(data.subscribers || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
      setSubscribers([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await newsletterAPI.exportToExcel() as any;

      // Create blob link to download
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `glovia-subscribers-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export subscribers:", error);
      alert("Failed to export subscribers. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.source || 'homepage').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 pt-10 pb-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4">
            <div className="text-white">
              <Link href="/dashboard/admin" className="text-blue-200 text-sm font-medium hover:text-white transition-colors">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold mt-2">Newsletter Subscribers</h1>
              <p className="text-blue-200 mt-1.5 text-sm">
                Manage and download your newsletter subscriber list
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <Button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export to Excel"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Subscribers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Subscribers</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {subscribers.filter((s) => s.isActive).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Quick Actions</p>
                <p className="text-gray-600 text-sm mt-2 space-y-1">
                  <span className="block" onClick={handleExportExcel}>
                    📊 Download Excel
                  </span>
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-sm text-gray-600">
            Found {filteredSubscribers.length} subscribers
          </p>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading subscribers…</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No subscribers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">#</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Email Address</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Source</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Subscribed Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber, index) => (
                      <tr
                        key={subscriber._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-600">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 break-all">
                          {subscriber.email}
                        </td>
                        <td className="px-6 py-4 text-gray-600 capitalize">
                          <span className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            {subscriber.source || "homepage"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(subscriber.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              subscriber.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {subscriber.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages} ({totalCount} total)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-50"
                  >
                    Next
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
