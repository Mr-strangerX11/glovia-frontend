'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Save } from 'lucide-react';
import { mutate } from 'swr';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/hooks/useData';
import { userAPI } from '@/lib/api';

export default function VendorAccountPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['VENDOR'] });
  const { user: profile, isLoading } = useProfile();
  const [saving, setSaving] = useState(false);

  const display = useMemo(() => profile || user, [profile, user]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (!display) return;
    setFormData({
      firstName: display.firstName || '',
      lastName: display.lastName || '',
      phone: display.phone || '',
    });
  }, [display]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    try {
      setSaving(true);
      await userAPI.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      });
      await mutate('/users/profile');
      toast.success('Account updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update account');
    } finally {
      setSaving(false);
    }
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vendor Account</h1>
            <p className="text-gray-600">Update your account information.</p>
          </div>
          <Link href="/dashboard/vendor" className="btn-outline">
            Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSave} className="card p-6 space-y-5">
          {(isLoading && !display) ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">First Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Last Name</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Email</label>
                <input type="email" className="input bg-gray-100" value={display?.email || ''} disabled />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Phone</label>
                <input
                  type="text"
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
