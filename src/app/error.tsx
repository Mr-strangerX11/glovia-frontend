'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
            <div className="relative bg-red-100 dark:bg-red-900/30 rounded-full p-4">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
          We apologize for the inconvenience. An unexpected error occurred.
        </p>

        {error.message && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono break-words">
            {error.message}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-6 py-3 transition hover:shadow-lg hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 text-gray-700 font-semibold px-6 py-3 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Still having trouble?
          </p>
          <a
            href="mailto:support@glovia.com.np"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
