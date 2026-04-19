'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
            404
          </h1>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Don't worry, we can help you get back on track.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-6 py-3 transition hover:shadow-lg hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 text-gray-700 font-semibold px-6 py-3 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Need help? Contact us:
          </p>
          <a
            href="mailto:support@glovia.com.np"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition"
          >
            support@glovia.com.np
          </a>
        </div>
      </div>
    </div>
  );
}
