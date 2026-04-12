'use client';

import React from 'react';
import { Trash2, Edit2, Pause, Play, Copy, AlertCircle } from 'lucide-react';
import { Offer, OfferStatus } from '@/types/offer';

interface OfferCardProps {
  offer: Offer;
  onEdit: (offer: Offer) => void;
  onDelete: (offerId: string) => void;
  onToggle: (offerId: string, status: OfferStatus) => void;
  onDuplicate: (offer: Offer) => void;
}

export default function OfferCard({
  offer,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate,
}: OfferCardProps) {
  const statusColors = {
    ACTIVE: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    EXPIRED: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
    PAUSED: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    DRAFT: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  };

  const typeLabels = {
    PERCENTAGE: '%',
    FLAT: 'Flat',
    BOGO: 'BOGO',
    FLASH_SALE: '⚡ Flash',
  };

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-5 hover:shadow-lg hover:border-purple-200 transition-all dark:bg-gray-900 dark:border-gray-800 dark:hover:border-purple-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{offer.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[offer.status]}`}>
              {offer.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{offer.description}</p>
        </div>
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Type:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">{typeLabels[offer.type]}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Applies To:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">{offer.appliesToType}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Priority:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">#{offer.priority}</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Uses:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">{offer.analytics.totalUses}</span>
        </div>
      </div>

      {/* Date range */}
      <div className="mb-4 p-2 rounded bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Start: {new Date(offer.startDate).toLocaleDateString('en-NP', {month: 'short', day: 'numeric'})}</span>
          <span>End: {new Date(offer.endDate).toLocaleDateString('en-NP', {month: 'short', day: 'numeric'})}</span>
        </div>
      </div>

      {/* Revenue & Conversion */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-2 rounded">
          <p className="text-gray-600 dark:text-gray-400">Revenue</p>
          <p className="font-bold text-green-600 dark:text-green-400">₹{(offer.analytics.revenue / 100).toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-2 rounded">
          <p className="text-gray-600 dark:text-gray-400">Conv. Rate</p>
          <p className="font-bold text-blue-600 dark:text-blue-400">{offer.analytics.conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(offer)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={() => onToggle(offer.id, offer.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 text-sm font-medium"
        >
          {offer.status === 'ACTIVE' || offer.status === 'SCHEDULED' ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Resume
            </>
          )}
        </button>
        <button
          onClick={() => onDuplicate(offer)}
          title="Duplicate this offer"
          className="px-2.5 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(offer.id)}
          title="Delete offer"
          className="px-2.5 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
