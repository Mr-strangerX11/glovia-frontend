'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRealtime } from './useRealtime';
import { Brand, Banner } from '@/types';

export interface RealtimeHomePageUpdate {
  type: 'brands' | 'banners' | 'flash-deals' | 'featured-vendors';
  data: any;
  timestamp: string;
}

export function useHomePageRealtime() {
  const realtime = useRealtime({
    autoConnect: true,
    channels: ['products', 'banners', 'brands', 'flash-deals'],
  });

  const [updates, setUpdates] = useState<RealtimeHomePageUpdate[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<RealtimeHomePageUpdate | null>(null);

  useEffect(() => {
    if (!realtime.isConnected) return;

    // Subscribe to specific channels
    realtime.subscribe('banners');
    realtime.subscribe('brands');
    realtime.subscribe('flash-deals');
    realtime.subscribe('products');

    // Listen for banner updates
    const unsubscribeBannerUpdated = realtime.on('banner:updated', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'banners',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
    });

    const unsubscribeBannerCreated = realtime.on('banner:created', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'banners',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
    });

    const unsubscribeBannerDeleted = realtime.on('banner:deleted', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'banners',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
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
    });

    const unsubscribeBrandCreated = realtime.on('brand:created', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'brands',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
    });

    const unsubscribeBrandDeleted = realtime.on('brand:deleted', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'brands',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
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
    });

    const unsubscribeFlashDealCreated = realtime.on('flashdeal:created', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'flash-deals',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
    });

    const unsubscribeFlashDealDeleted = realtime.on('flashdeal:deleted', (data) => {
      const update: RealtimeHomePageUpdate = {
        type: 'flash-deals',
        data,
        timestamp: new Date().toISOString(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 49)]);
      setLatestUpdate(update);
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
    };
  }, [realtime.isConnected]);

  return {
    updates,
    latestUpdate,
    isConnected: realtime.isConnected,
    realtime,
  };
}
