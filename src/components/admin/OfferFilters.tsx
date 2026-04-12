'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { OfferType, OfferStatus } from '@/types/offer';

interface OfferFiltersProps {
  onSearch: (query: string) => void;
  onStatusFilter: (status: OfferStatus | null) => void;
  onTypeFilter: (type: OfferType | null) => void;
  onDateRange: (start: Date | null, end: Date | null) => void;
  searchValue: string;
  selectedStatus: OfferStatus | null;
  selectedType: OfferType | null;
}

export default function OfferFilters({
  onSearch,
  onStatusFilter,
  onTypeFilter,
  onDateRange,
  searchValue,
  selectedStatus,
  selectedType,
}: OfferFiltersProps) {
  const statuses: OfferStatus[] = ['ACTIVE', 'SCHEDULED', 'EXPIRED', 'PAUSED', 'DRAFT'];
  const types: OfferType[] = ['PERCENTAGE', 'FLAT', 'BOGO', 'FLASH_SALE'];

  const statusColors = {
    ACTIVE: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    EXPIRED: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
    PAUSED: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    DRAFT: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search offers by name..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all dark:bg-gray-900 dark:border-gray-800 dark:text-white"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilter(selectedStatus === status ? null : status)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                  selectedStatus === status
                    ? statusColors[status]
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{status}</span>
                  {selectedStatus === status && <div className="w-2 h-2 bg-current rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => onTypeFilter(selectedType === type ? null : type)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                  selectedType === type
                    ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{type === 'FLASH_SALE' ? '⚡ Flash Sale' : type}</span>
                  {selectedType === type && <div className="w-2 h-2 bg-current rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
          <div className="space-y-2">
            <input
              type="date"
              onChange={(e) => onDateRange(e.target.value ? new Date(e.target.value) : null, null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white"
              placeholder="From"
            />
            <input
              type="date"
              onChange={(e) => onDateRange(null, e.target.value ? new Date(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white"
              placeholder="To"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
