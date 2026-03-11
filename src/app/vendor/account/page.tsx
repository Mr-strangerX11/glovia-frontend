'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, Save, Camera, User, Mail, Phone, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading your account…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 pt-10 pb-20">
        <div className="container max-w-3xl">
          <div className="flex items-start justify-between">
            <div className="text-white">
              <p className="text-violet-200 text-sm font-medium mb-1">Vendor Account</p>
              <h1 className="text-3xl font-bold">{display?.firstName} {display?.lastName}</h1>
              <p className="text-indigo-100 mt-1 text-sm">{display?.email}</p>
            </div>
            <Link
              href="/dashboard/vendor"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors border border-white/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-3xl -mt-10 pb-16">
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {(isLoading && !display) ? (
            <div className="flex justify-center py-14">
              <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Avatar section */}
              <div className="px-8 py-7 border-b border-gray-100 flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <img
                    src={formData.profileImage || '/placeholder.jpg'}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-violet-100"
                  />
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
                    className="absolute bottom-0 right-0 w-7 h-7 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{display?.firstName} {display?.lastName}</p>
                  <p className="text-sm text-gray-500">{display?.email}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">Vendor</span>
                </div>
              </div>

              {/* Form fields */}
              <div className="px-8 py-7 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        className="input pl-9"
                        value={formData.firstName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        className="input pl-9"
                        value={formData.lastName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      className="input pl-9"
                      value={formData.email}
                      onChange={(e) => {
                        const nextEmail = e.target.value;
                        setFormData((prev) => ({ ...prev, email: nextEmail }));
                        if (nextEmail.trim().toLowerCase() !== verifiedEmail) {
                          setEmailOtp('');
                        }
                      }}
                    />
                  </div>
                  {emailChanged && (
                    <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-xs font-medium">Verify your new email before saving</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        className="text-sm font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2"
                        disabled={sendingOtp}
                      >
                        {sendingOtp ? 'Sending…' : 'Send Verification Code'}
                      </button>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="input flex-1"
                          placeholder="Enter 6-digit OTP"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value)}
                          maxLength={6}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
                          disabled={verifyingOtp}
                        >
                          {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                        </button>
                      </div>
                      {isEmailVerifiedForChange && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <p className="text-xs font-medium">New email verified</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="input pl-9"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
