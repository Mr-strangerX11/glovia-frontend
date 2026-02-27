"use client";

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home, ShoppingBag } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useInfiniteScroll';

export default function OfflinePage() {
  const isOnline = useOnlineStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    window.location.reload();
  };

  if (isOnline) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-6">
          <WifiOff className="w-10 h-10 text-orange-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You're offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          Please check your internet connection and try again. Some features may not be available until you're back online.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </>
            )}
          </button>

          <div className="flex gap-3">
            <a
              href="/"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </a>
            
            <a
              href="/products"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Products
            </a>
          </div>
        </div>

        {/* Cached Content Message */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2">
            Previously viewed content
          </h3>
          <p className="text-sm text-gray-600">
            Some of your previously viewed products and cart items may still be available.
          </p>
        </div>
      </div>
    </div>
  );
}

