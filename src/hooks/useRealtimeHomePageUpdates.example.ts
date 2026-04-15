/**
 * Example: How to integrate real-time updates into HomeContent.client.tsx
 * 
 * Add this hook at the top of your HomeContent component and use it to refresh data
 * whenever real-time events are received.
 */

import { useHomePageRealtime } from '@/hooks/useHomePageRealtime';
import { useEffect, useState } from 'react';
import { bannersAPI, adminAPI, flashDealsAPI } from '@/lib/api';

// Add this implementation to HomeContent component:

export function useRealtimeHomePageUpdates() {
  const { latestUpdate, isConnected } = useHomePageRealtime();
  const [updateNotification, setUpdateNotification] = useState<string | null>(null);

  // Handle banner updates
  useEffect(() => {
    if (latestUpdate?.type === 'banners') {
      // Auto-refresh banners from API
      bannersAPI
        .getAll()
        .then((res) => {
          const banners = res.data?.data || res.data || [];
          window.dispatchEvent(
            new CustomEvent('bannersUpdated', {
              detail: banners,
            })
          );
          showNotification('Banners updated');
        })
        .catch(console.error);
    }
  }, [latestUpdate?.data?.id, latestUpdate?.type]);

  // Handle brand/vendor updates
  useEffect(() => {
    if (latestUpdate?.type === 'brands') {
      adminAPI
        .getFeaturedVendors()
        .then((res) => {
          const vendors = res.data?.data || [];
          window.dispatchEvent(
            new CustomEvent('vendorsUpdated', {
              detail: vendors,
            })
          );
          showNotification('Vendors updated');
        })
        .catch(console.error);
    }
  }, [latestUpdate?.data?.id, latestUpdate?.type]);

  // Handle flash deal updates
  useEffect(() => {
    if (latestUpdate?.type === 'flash-deals') {
      flashDealsAPI
        .getActive()
        .then((res) => {
          const deals = res.data?.data || [];
          window.dispatchEvent(
            new CustomEvent('flashDealsUpdated', {
              detail: deals,
            })
          );
          showNotification('Flash deals updated');
        })
        .catch(console.error);
    }
  }, [latestUpdate?.data?.id, latestUpdate?.type]);

  function showNotification(message: string) {
    setUpdateNotification(message);
    setTimeout(() => setUpdateNotification(null), 3000);
  }

  return {
    isConnected,
    updateNotification,
  };
}

// Usage in HomeContent:
/*
export default function HomeContent({ brands, banners }: HomeContentProps) {
  // ... existing state and logic ...
  
  const { isConnected, updateNotification } = useRealtimeHomePageUpdates();
  
  // Listen to custom events
  useEffect(() => {
    const handleBannersUpdate = (e: Event) => {
      const newBanners = (e as CustomEvent).detail;
      setOfferBanners(newBanners.filter((b: any) => b.image && b.isActive !== false).slice(0, 10));
    };

    const handleVendorsUpdate = (e: Event) => {
      const newVendors = (e as CustomEvent).detail;
      setFeaturedVendorsList(
        newVendors.map((v: any) => ({
          id: v._id,
          name: `${v.firstName} ${v.lastName}`,
          slug: v.email,
          logo: v.vendorLogo,
          description: v.vendorDescription,
        })).slice(0, 8)
      );
    };

    const handleFlashDealsUpdate = (e: Event) => {
      const newDeals = (e as CustomEvent).detail;
      setFlashDeals(newDeals);
      // Recalculate timers
    };

    window.addEventListener('bannersUpdated', handleBannersUpdate);
    window.addEventListener('vendorsUpdated', handleVendorsUpdate);
    window.addEventListener('flashDealsUpdated', handleFlashDealsUpdate);

    return () => {
      window.removeEventListener('bannersUpdated', handleBannersUpdate);
      window.removeEventListener('vendorsUpdated', handleVendorsUpdate);
      window.removeEventListener('flashDealsUpdated', handleFlashDealsUpdate);
    };
  }, []);

  return (
    <div>
      {isConnected && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-sm text-sm">
          🔴 Live updates enabled
        </div>
      )}

      {updateNotification && (
        <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg shadow-sm text-sm animate-pulse">
          ✨ {updateNotification}
        </div>
      )}

      {/* Rest of component */}
    </div>
  );
}
*/
