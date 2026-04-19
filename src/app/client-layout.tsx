"use client";

import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { useOnlineStatus } from '@/hooks/useInfiniteScroll';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/common/AnnouncementBar';

// Lazy load Header to ensure router context is ready
const Header = dynamic(() => import('@/components/layout/Header').then(mod => ({ default: mod.Header })), {
  ssr: true,
  loading: () => null,
});

// Dynamic imports for heavy components
const OfflinePage = dynamic(() => import('@/app/offline/page'), {
  ssr: false,
  loading: () => null,
});

const FlashDealsModal = dynamic(() => import('@/components/FlashDealsModal'), {
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
    // Suppress React DevTools warning in development
    const originalWarn = console.warn;
    console.warn = function(...args) {
      const message = String(args[0] || '');
      if (message.includes('Download the React DevTools') || message.includes('reactjs.org/link/react-devtools')) {
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

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

  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(17, 24, 39, 0.12)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AnnouncementBar />
        <Header />
        <FlashDealsModal />
        <main className="min-h-screen pb-16 md:pb-0 animate-in" id="main-content">
          {children}
        </main>
        <Footer />
    </ErrorBoundary>
  );
}

