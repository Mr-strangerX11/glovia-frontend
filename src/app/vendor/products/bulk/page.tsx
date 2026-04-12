'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { vendorAPI } from '@/lib/api';
import BulkProductUpload from '@/components/BulkProductUpload';
import Link from 'next/link';
import { ArrowLeft, PackagePlus } from 'lucide-react';

export default function VendorBulkUploadPage() {
  useAuthGuard({ roles: ['VENDOR', 'SUPER_ADMIN'] });

  const handleSubmit = async (products: Record<string, string>[]) => {
    const { data } = await vendorAPI.bulkCreateProducts(products);
    return data;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="container py-4">
          <Link
            href="/vendor/products"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Products
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <PackagePlus className="h-5 w-5 text-primary-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary-900">Bulk Product Upload</h1>
              <p className="text-sm text-secondary-500">Import multiple products at once via CSV</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="mx-auto max-w-5xl">
          <BulkProductUpload onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
