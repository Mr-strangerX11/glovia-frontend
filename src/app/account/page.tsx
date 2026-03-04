"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProfile } from "@/hooks/useData";
import { mutate } from "swr";
import { Loader2, Save, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { userAPI } from "@/lib/api";

export default function AccountPage() {
  const { user, isChecking } = useAuthGuard();
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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  useEffect(() => {
    if (!display) return;
    const existingEmail = (display.email || '').trim().toLowerCase();
    setFormData({
      firstName: display.firstName || "",
      lastName: display.lastName || "",
      email: display.email || "",
      phone: display.phone || "",
      profileImage: display.profileImage || "",
    });
    setVerifiedEmail(existingEmail);
    setEmailOtp('');
  }, [display]);

  const normalizedCurrentEmail = (display?.email || '').trim().toLowerCase();
  const normalizedFormEmail = formData.email.trim().toLowerCase();
  const emailChanged = normalizedFormEmail !== normalizedCurrentEmail;
  const isEmailVerifiedForChange = !emailChanged || normalizedFormEmail === verifiedEmail;

  if (isChecking || !user || !display) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Loading account...</p>
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const uploadProfilePhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const rawBackendUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_URLS ||
        "http://localhost:3001";
      let backendUrl = rawBackendUrl.startsWith("http")
        ? rawBackendUrl
        : `https://${rawBackendUrl}`;
      backendUrl = backendUrl.replace(/\/+$/, "");
      if (!backendUrl.includes("/api/")) {
        backendUrl = `${backendUrl}/api/v1`;
      }

      const response = await fetch(`${backendUrl}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error(data?.message || "Upload failed");
      }

      setFormData((prev) => ({ ...prev, profileImage: data.url }));
      toast.success("Profile photo uploaded");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (emailChanged && !isEmailVerifiedForChange) {
      toast.error('Please verify your new email with OTP before saving');
      return;
    }

    setSaving(true);
    try {
      await userAPI.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        profileImage: formData.profileImage || undefined,
      });
      await mutate('/users/profile');
      toast.success("Account updated successfully");
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || "Failed to update account");
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-10 space-y-6">
        <div>
          <p className="text-sm text-gray-500">Account</p>
          <h1 className="text-3xl font-bold">Hi, {display.firstName}</h1>
          <p className="text-gray-600">Manage your profile and addresses.</p>
        </div>

        {isLoading && <p className="text-gray-600">Loading profile...</p>}

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <form onSubmit={handleSave} className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Profile</h3>

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
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Last Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
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

            <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>

          <div className="card p-6 space-y-3">
            <h3 className="text-lg font-semibold">Account Info</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Role:</span>
              {display.role === 'SUPER_ADMIN' ? (
                <>
                  <span className="inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold">Super Admin</span>
                  <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Admin</span>
                </>
              ) : (
                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                  {display.role.charAt(0) + display.role.slice(1).toLowerCase().replace('_', ' ')}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold">Orders</h3>
            <p className="text-sm text-gray-600">Go to your orders list to track deliveries.</p>
            <a href="/account/orders" className="btn-outline inline-flex w-fit">View Orders</a>
          </div>
        </div>
      </div>
    </div>
  );
}
