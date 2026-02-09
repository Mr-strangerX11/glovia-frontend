"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { adminAPI } from "@/lib/api";
import { ArrowLeft, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function OffersPage() {
  const { user, isChecking } = useAuthGuard({ roles: ["SUPER_ADMIN"] });
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discountPercentage: 0,
    code: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOffers();
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      // Replace with actual API endpoint
      // const { data } = await adminAPI.getOffers();
      // setOffers(data);
      setOffers([]); // Placeholder until API is ready
    } catch (error) {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.discountPercentage) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingId) {
        // Update offer
        // await adminAPI.updateOffer(editingId, formData);
        // toast.success("Offer updated successfully");
        // setEditingId(null);
      } else {
        // Create offer
        // await adminAPI.createOffer(formData);
        // toast.success("Offer created successfully");
      }

      setFormData({
        title: "",
        description: "",
        discountPercentage: 0,
        code: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });
      setShowForm(false);
      fetchOffers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save offer");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      setDeleting(id);
      // await adminAPI.deleteOffer(id);
      // toast.success("Offer deleted successfully");
      // fetchOffers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete offer");
    } finally {
      setDeleting(null);
    }
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Offers</h1>
                <p className="text-gray-600 mt-1">Create and manage promotional offers</p>
              </div>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                }}
                className="flex items-center gap-2 btn-primary"
              >
                <Plus className="w-5 h-5" />
                Create Offer
              </button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Offer" : "Create New Offer"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="input"
                      placeholder="e.g., Summer Sale 2024"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Discount Percentage *</label>
                    <input
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPercentage: Math.max(
                            0,
                            Math.min(100, parseFloat(e.target.value) || 0)
                          ),
                        })
                      }
                      className="input"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input min-h-[100px]"
                    placeholder="Describe the offer..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="label">Promo Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      className="input"
                      placeholder="e.g., SUMMER2024"
                    />
                  </div>
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">
                    {editingId ? "Update Offer" : "Create Offer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({
                        title: "",
                        description: "",
                        discountPercentage: 0,
                        code: "",
                        startDate: "",
                        endDate: "",
                        isActive: true,
                      });
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Offers List */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">All Offers ({offers.length})</h2>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
              </div>
            ) : offers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No offers found. Create your first offer to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((offer) => (
                      <tr key={offer.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{offer.title}</p>
                            <p className="text-sm text-gray-500">{offer.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-lg text-primary-600">
                            {offer.discountPercentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {offer.code || "-"}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              offer.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {offer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingId(offer.id);
                                setFormData(offer);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 p-2"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(offer.id)}
                              disabled={deleting === offer.id}
                              className="text-red-600 hover:text-red-700 p-2 disabled:opacity-50"
                            >
                              {deleting === offer.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
