import React from 'react';
import { MapPin, Phone, Building2, Navigation2 } from 'lucide-react';

interface AddressDisplayProps {
  address: {
    fullName?: string;
    phone?: string;
    area?: string;
    wardNo?: number;
    municipality?: string;
    district?: string;
    province?: string;
    landmark?: string;
  };
  compact?: boolean;
  showPhone?: boolean;
  className?: string;
}

export function AddressDisplay({
  address,
  compact = false,
  showPhone = true,
  className = '',
}: AddressDisplayProps) {
  if (!address) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        Address not available
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`text-sm text-gray-600 space-y-1 ${className}`}>
        {address.fullName && <p className="font-semibold text-gray-900">{address.fullName}</p>}
        {address.phone && showPhone && <p className="text-gray-600">{address.phone}</p>}
        <p className="text-gray-600">
          {address.area}
          {address.wardNo ? `, Ward ${address.wardNo}` : ''}
        </p>
        <p className="text-gray-600">
          {address.municipality && `${address.municipality}, `}
          {address.district}
          {address.province ? `, ${address.province}` : ''}
        </p>
        {address.landmark && <p className="text-gray-500">📍 Near: {address.landmark}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Name & Phone */}
      <div className="space-y-1.5">
        {address.fullName && (
          <p className="text-base font-bold text-gray-900">{address.fullName}</p>
        )}
        {address.phone && showPhone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-primary-500" />
            {address.phone}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="space-y-1 bg-gray-50 -mx-3 -mb-3 px-3 py-2.5 rounded-b-lg border-t border-gray-100">
        {/* Area & Ward */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-medium">{address.area}</p>
            {address.wardNo && <p className="text-xs text-gray-500">Ward {address.wardNo}</p>}
          </div>
        </div>

        {/* Municipality & District */}
        <div className="flex items-start gap-2">
          <Building2 className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <p className="font-medium">
              {address.municipality}
              {address.municipality && address.district && ', '}
              {address.district}
            </p>
            {address.province && (
              <p className="text-xs text-gray-500">{address.province}</p>
            )}
          </div>
        </div>

        {/* Landmark */}
        {address.landmark && (
          <div className="flex items-start gap-2">
            <Navigation2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <span className="font-medium">Landmark:</span> {address.landmark}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
