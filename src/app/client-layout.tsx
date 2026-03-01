"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useOnlineStatus } from '@/hooks/useInfiniteScroll';

// Dynamic imports for heavy components
const OfflinePage = dynamic(() => import('@/app/offline/page'), {
  ssr: false,
  loading: () => null,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker registered:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('New version available');
              }
            });
          }
        });
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  // Show offline page when not online
  if (!isOnline) {
    return <OfflinePage />;
  }

  return <>{children}</>;
}
