'use client';

import { useState, useEffect } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { adminAPI } from '@/lib/api';
import { ArrowLeft, Loader2, Star, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Vendor {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isFeatured: boolean;
  profileImage?: string;
  vendorLogo?: string;
  vendorDescription?: string;
  createdAt?: string;
}

export default function FeaturedVendorsPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['ADMIN', 'SUPER_ADMIN'] });
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'featured' | 'not-featured'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVendors();
    }
  }, [user]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAllVendors();
      setVendors(data?.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (vendorId: string) => {
    setTogglingId(vendorId);
    try {
      const { data } = await adminAPI.toggleVendorFeatured(vendorId);
      
      setVendors(vendors.map(v => 
        v._id === vendorId ? { ...v, isFeatured: !v.isFeatured } : v
      ));
      
      toast.success(data?.message || 'Vendor status updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vendor status');
    } finally {
      setTogglingId(null);
    }
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = `${vendor.firstName} ${vendor.lastName} ${vendor.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    
    if (filterBy === 'featured') return matchesSearch && vendor.isFeatured;
    if (filterBy === 'not-featured') return matchesSearch && !vendor.isFeatured;
    return matchesSearch;
  });

  const featuredCount = vendors.filter(v => v.isFeatured).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pt-8 pb-6">
        <div className="container">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard/admin"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Featured Vendors</h1>
              <p className="text-blue-100 mt-1">Manage which vendors appear on your storefront</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Total Vendors</p>
              <p className="text-3xl font-bold mt-1">{vendors.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Featured Vendors</p>
              <p className="text-3xl font-bold mt-1">{featuredCount}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-blue-100 text-sm">Not Featured</p>
              <p className="text-3xl font-bold mt-1">{vendors.length - featuredCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendors by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'featured', 'not-featured'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterBy(filter)}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  filterBy === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filter === 'all' ? 'All Vendors' : filter === 'featured' ? 'Featured' : 'Not Featured'}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg">No vendors found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor._id}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vendor.firstName} {vendor.lastName}
                      </h3>
                      {vendor.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                          <Star className="w-3.5 h-3.5" />
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{vendor.email}</p>
                    {vendor.vendorDescription && (
                      <p className="text-sm text-gray-600 mt-2">{vendor.vendorDescription}</p>
                    )}
                    {vendor.createdAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Joined: {new Date(vendor.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleFeatured(vendor._id)}
                    disabled={togglingId === vendor._id}
                    className={`ml-4 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      vendor.isFeatured
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:bg-yellow-100'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-200'
                    }`}
                  >
                    {togglingId === vendor._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className="w-4 h-4" />
                    )}
                    {vendor.isFeatured ? 'Remove' : 'Feature'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
