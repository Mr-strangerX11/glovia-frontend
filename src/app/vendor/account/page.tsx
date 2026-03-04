'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Save, Upload } from 'lucide-react';
import { mutate } from 'swr';
import Cookies from 'js-cookie';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useProfile } from '@/hooks/useData';
import { userAPI } from '@/lib/api';

export default function VendorAccountPage() {
  const { user, isChecking } = useAuthGuard({ roles: ['VENDOR'] });
  const { user: profile, isLoading } = useProfile();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const display = useMemo(() => profile || user, [profile, user]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
  });

  useEffect(() => {
    if (!display) return;
    const existingEmail = (display.email || '').trim().toLowerCase();
    setFormData({
      firstName: display.firstName || '',
      lastName: display.lastName || '',
      email: display.email || '',
      phone: display.phone || '',
      profileImage: display.profileImage || '',
    });
    setVerifiedEmail(existingEmail);
    setEmailOtp('');
  }, [display]);

  const normalizedCurrentEmail = (display?.email || '').trim().toLowerCase();
  const normalizedFormEmail = formData.email.trim().toLowerCase();
  const emailChanged = normalizedFormEmail !== normalizedCurrentEmail;
  const isEmailVerifiedForChange = !emailChanged || normalizedFormEmail === verifiedEmail;

  const uploadProfilePhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const token = Cookies.get('access_token');
    if (!token) {
      toast.error('Please login first');
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const rawBackendUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_URLS ||
        'http://localhost:3001';
      let backendUrl = rawBackendUrl.startsWith('http') ? rawBackendUrl : `https://${rawBackendUrl}`;
      backendUrl = backendUrl.replace(/\/+$/, '');
      if (!backendUrl.includes('/api/')) {
        backendUrl = `${backendUrl}/api/v1`;
      }

      const response = await fetch(`${backendUrl}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.message || 'Upload failed');
      }

      setFormData((prev) => ({ ...prev, profileImage: data.url }));
      toast.success('Profile photo uploaded');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (emailChanged && !isEmailVerifiedForChange) {
      toast.error('Please verify your new email with OTP before saving');
      return;
    }

    try {
      setSaving(true);
      await userAPI.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        profileImage: formData.profileImage || undefined,
      });
      await mutate('/users/profile');
      toast.success('Account updated successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || 'Failed to update account');
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!emailChanged) {
      toast.error('Enter a new email to verify');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setSendingOtp(true);
      await userAPI.sendEmailChangeOtp(formData.email.trim());
      toast.success('Verification code sent to new email');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || 'Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailChanged) {
      toast.error('Enter a new email to verify');
      return;
    }

    if (!emailOtp.trim()) {
      toast.error('Enter verification code');
      return;
    }

    try {
      setVerifyingOtp(true);
      await userAPI.verifyEmailChangeOtp(formData.email.trim(), emailOtp.trim());
      setVerifiedEmail(formData.email.trim().toLowerCase());
      toast.success('Email verified. You can now save changes.');
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || 'Failed to verify code');
    } finally {
      setVerifyingOtp(false);
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
              <div className="flex items-center gap-4">
                <img
                  src={formData.profileImage || '/placeholder.jpg'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadProfilePhoto(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-outline inline-flex items-center gap-2"
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Change Photo'}
                  </button>
                </div>
              </div>

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
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => {
                    const nextEmail = e.target.value;
                    setFormData((prev) => ({ ...prev, email: nextEmail }));
                    if (nextEmail.trim().toLowerCase() !== verifiedEmail) {
                      setEmailOtp('');
                    }
                  }}
                />
                {emailChanged && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        className="btn-outline"
                        disabled={sendingOtp}
                      >
                        {sendingOtp ? 'Sending...' : 'Send Verification Code'}
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        className="input"
                        placeholder="Enter OTP code"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        className="btn-outline"
                        disabled={verifyingOtp}
                      >
                        {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                    <p className={`text-xs ${isEmailVerifiedForChange ? 'text-green-600' : 'text-amber-600'}`}>
                      {isEmailVerifiedForChange ? 'New email verified' : 'Verify new email before saving'}
                    </p>
                  </div>
                )}
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
