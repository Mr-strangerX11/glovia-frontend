"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProfile } from "@/hooks/useData";
import { mutate } from "swr";
import {
  Loader2, Save, Camera, User, Mail, Phone, MapPin,
  ShoppingBag, Heart, ChevronRight, Shield, CheckCircle2, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { userAPI } from "@/lib/api";
import Link from "next/link";

export default function AccountPage() {
  const { user, isChecking } = useAuthGuard();
  const { user: profile, isLoading } = useProfile();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
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

  const uploadProfilePhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image size must be less than 5MB"); return; }
    const token = Cookies.get("access_token");
    if (!token) { toast.error("Please login first"); return; }
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URLS || "http://localhost:3001";
      let backendUrl = rawBackendUrl.startsWith("http") ? rawBackendUrl : `https://${rawBackendUrl}`;
      backendUrl = backendUrl.replace(/\/+$/, "");
      if (!backendUrl.includes("/api/")) backendUrl = `${backendUrl}/api/v1`;
      const response = await fetch(`${backendUrl}/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      const data = await response.json();
      if (!response.ok || !data?.url) throw new Error(data?.message || "Upload failed");
      setFormData((prev) => ({ ...prev, profileImage: data.url }));
      toast.success("Profile photo updated!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) { toast.error("First name and last name are required"); return; }
    if (!formData.email.trim()) { toast.error("Email is required"); return; }
    if (emailChanged && !isEmailVerifiedForChange) { toast.error("Please verify your new email with OTP before saving"); return; }
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
      toast.success("Account updated successfully!");
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || "Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!emailChanged) { toast.error("Enter a new email to verify"); return; }
    if (!formData.email.trim()) { toast.error("Email is required"); return; }
    try {
      setSendingOtp(true);
      await userAPI.sendEmailChangeOtp(formData.email.trim());
      toast.success("Verification code sent to new email");
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || "Failed to send verification code");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailChanged) { toast.error("Enter a new email to verify"); return; }
    if (!emailOtp.trim()) { toast.error("Enter verification code"); return; }
    try {
      setVerifyingOtp(true);
      await userAPI.verifyEmailChangeOtp(formData.email.trim(), emailOtp.trim());
      setVerifiedEmail(formData.email.trim().toLowerCase());
      toast.success("Email verified! You can now save changes.");
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || "Failed to verify code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (isChecking || !user || !display) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Loading your account…</p>
        </div>
      </div>
    );
  }

  const roleLabel = display.role === 'SUPER_ADMIN' ? 'Super Admin'
    : display.role === 'ADMIN' ? 'Admin'
    : display.role === 'VENDOR' ? 'Vendor'
    : 'Customer';

  const roleColor = display.role === 'SUPER_ADMIN'
    ? 'bg-red-100 text-red-700 border-red-200'
    : display.role === 'ADMIN'
    ? 'bg-violet-100 text-violet-700 border-violet-200'
    : display.role === 'VENDOR'
    ? 'bg-blue-100 text-blue-700 border-blue-200'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  const navItems = [
    { label: "My Profile", icon: User, tab: 'profile' as const },
    { label: "Security", icon: Shield, tab: 'security' as const },
  ];

  const quickLinks = [
    { label: "My Orders", icon: ShoppingBag, href: "/account/orders", desc: "Track & manage orders", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Addresses", icon: MapPin, href: "/account/addresses", desc: "Delivery locations", color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Wishlist", icon: Heart, href: "/wishlist", desc: "Saved items", color: "text-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient hero header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 pt-10 pb-20">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar with camera overlay */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                <img
                  src={formData.profileImage || '/placeholder.jpg'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Change photo"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-pink-500" /> : <Camera className="w-4 h-4 text-gray-600" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadProfilePhoto(file); }}
              />
            </div>
            {/* Name + role */}
            <div className="text-center sm:text-left text-white pb-1">
              <h1 className="text-2xl font-bold tracking-tight">{display.firstName} {display.lastName}</h1>
              <p className="text-pink-200 text-sm mt-0.5">{display.email}</p>
              <span className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full border ${roleColor} bg-white/90`}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content pulled up over hero */}
      <div className="container -mt-10 pb-16">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Nav tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-l-4 ${
                      active
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-pink-500' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-3">Quick Links</p>
              <div className="space-y-1">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`w-9 h-9 ${link.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${link.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{link.label}</p>
                        <p className="text-xs text-gray-400">{link.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Account meta */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Account</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Role</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${roleColor}`}>{roleLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-xs font-semibold flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Update your name, email and contact details.</p>
                </div>
                {isLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                  </div>
                ) : (
                  <div className="p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            className="input pl-9"
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            className="input pl-9"
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          className="input pl-9"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => {
                            const nextEmail = e.target.value;
                            setFormData((p) => ({ ...p, email: nextEmail }));
                            if (nextEmail.trim().toLowerCase() !== verifiedEmail) setEmailOtp('');
                          }}
                        />
                      </div>
                      {emailChanged && (
                        <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                          <div className="flex items-center gap-2 text-amber-700">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p className="text-xs font-medium">Verify your new email before saving</p>
                          </div>
                          <button type="button" onClick={handleSendEmailOtp} className="btn-outline text-sm" disabled={sendingOtp}>
                            {sendingOtp ? <><Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" />Sending…</> : 'Send Verification Code'}
                          </button>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              className="input flex-1"
                              placeholder="Enter OTP code"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value)}
                            />
                            <button type="button" onClick={handleVerifyEmailOtp} className="btn-outline text-sm" disabled={verifyingOtp}>
                              {verifyingOtp ? <><Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" />Verifying…</> : 'Verify Code'}
                            </button>
                          </div>
                          {isEmailVerifiedForChange && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> New email verified — ready to save
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          className="input pl-9"
                          placeholder="+977 98XXXXXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">Changes will be reflected immediately</p>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-60"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Security & Privacy</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Keep your account safe and secure.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Email Verified</p>
                        <p className="text-xs text-gray-500">{display.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Password</p>
                        <p className="text-xs text-gray-500">Keep a strong password</p>
                      </div>
                    </div>
                    <button className="text-xs text-pink-600 font-medium hover:underline" type="button">Change</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
