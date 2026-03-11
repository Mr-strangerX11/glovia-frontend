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

  const reloadOnChunkError = () => {
    if (typeof window === 'undefined') return;
    const key = '__chunk_reload_once__';
    if (sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');
    const separator = window.location.search ? '&' : '?';
    window.location.replace(`${window.location.href}${separator}v=${Date.now()}`);
  };

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

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = String(event.reason?.message || event.reason || '').toLowerCase();
      if (
        message.includes('chunkloaderror') ||
        message.includes('loading chunk') ||
        message.includes('failed to fetch dynamically imported module')
      ) {
        reloadOnChunkError();
      }
    };

    const onError = (event: ErrorEvent) => {
      const message = String(event.message || '').toLowerCase();
      if (message.includes('chunkloaderror') || message.includes('loading chunk')) {
        reloadOnChunkError();
      }
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onError);

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onError);
    };
  }, []);

  // Show offline page when not online
  if (!isOnline) {
    return <OfflinePage />;
  }

  return <>{children}</>;
}
