'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorAccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect vendor account page to unified account page
    router.replace('/account');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-pink-400/30 border-t-pink-500 rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-300 font-medium">Redirecting to account page…</p>
      </div>
    </div>
  );
}
