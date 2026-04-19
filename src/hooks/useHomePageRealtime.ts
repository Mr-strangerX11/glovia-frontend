'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRealtime } from './useRealtime';
import { mutate } from 'swr';
import { Brand, Banner } from '@/types';

export interface RealtimeHomePageUpdate {
  type: 'brands' | 'banners' | 'flash-deals' | 'featured-vendors' | 'vendors';
  data: any;
  timestamp: string;
}

export function useHomePageRealtime() {
  const realtime = useRealtime({
    autoConnect: true,
    channels: ['products', 'banners', 'brands', 'flash-deals', 'vendors'],
  });

  const [updates, setUpdates] = useState<RealtimeHomePageUpdate[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<RealtimeHomePageUpdate | null>(null);

  // Revalidate all home page SWR caches
  const revalidateHomeData = useCallback(async () => {
    await Promise.all([
      mutate('/banners'),
      mutate('/admin/vendors/featured'),
      mutate('/flash-deals/active'),
      mutate('/brands'),
    ]).catch(() => {});
  }, []);

  useEffect(() => {
    if (!realtime.isConnected) return;

    // Subscribe to specific channels
    realtime.subscribe('banners');
    realtime.subscribe('brands');
    realtime.subscribe('flash-deals');
    realtime.subscribe('products');
    realtime.subscribe('vendors');

    // Listen for banner updates
    const unsubscribeBannerUpdated = realtime.on('banner:updated', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'banners',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    const unsubscribeBannerCreated = realtime.on('banner:created', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'banners',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    const unsubscribeBannerDeleted = realtime.on('banner:deleted', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'banners',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    // Listen for brand/vendor updates
    const unsubscribeBrandUpdated = realtime.on('brand:updated', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'brands',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    const unsubscribeBrandCreated = realtime.on('brand:created', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'brands',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    const unsubscribeBrandDeleted = realtime.on('brand:deleted', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'brands',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    // Listen for flash deal updates
    const unsubscribeFlashDealUpdated = realtime.on('flashdeal:updated', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'flash-deals',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    const unsubscribeFlashDealCreated = realtime.on('flashdeal:created', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'flash-deals',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    const unsubscribeFlashDealDeleted = realtime.on('flashdeal:deleted', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'flash-deals',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    // Listen for vendor updates (featured status or profile changes)
    const unsubscribeVendorUpdated = realtime.on('vendor:updated', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'featured-vendors',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    const unsubscribeVendorFeaturedToggled = realtime.on('vendor:featured-toggled', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'featured-vendors',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    const unsubscribeVendorProfileUpdated = realtime.on('vendor:profile-updated', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'vendors',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
      revalidateHomeData();
    });

    return () => {
      unsubscribeBannerUpdated();
      unsubscribeBannerCreated();
      unsubscribeBannerDeleted();
      unsubscribeBrandUpdated();
      unsubscribeBrandCreated();
      unsubscribeBrandDeleted();
      unsubscribeFlashDealUpdated();
      unsubscribeFlashDealCreated();
      unsubscribeFlashDealDeleted();
      unsubscribeVendorUpdated();
      unsubscribeVendorFeaturedToggled();
      unsubscribeVendorProfileUpdated();
    };
  }, [realtime, revalidateHomeData]);

  return {
    updates,
    latestUpdate,
    isConnected: realtime.isConnected,
    realtime,
  };
}
