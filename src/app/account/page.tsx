"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProfile } from "@/hooks/useData";

import { mutate } from "swr";
import {
  Loader2, Save, Camera, User, Mail, Phone, MapPin,
  ShoppingBag, Heart, ChevronRight, Shield, CheckCircle2, AlertCircle,
  Lock, Eye, Zap, TrendingUp, Settings, LogOut, Copy, Check, Store, Edit
} from "lucide-react";
import toast from "react-hot-toast";
import { userAPI, uploadAPI } from "@/lib/api";
import Link from "next/link";

function PrefToggle({ label, desc, defaultOn = true }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-colors">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-white/50 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        className={`relative flex-shrink-0 w-11 rounded-full transition-colors duration-200 ${on ? 'bg-pink-500' : 'bg-white/20'}`}
        style={{ height: 24 }}
      >
        <span
          className="absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200"
          style={{ width: 20, height: 20, transform: on ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function PreferencesTab() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-pink-500" /> Notifications
        </h3>
        <div className="space-y-2.5">
          <PrefToggle label="Order Updates" desc="Get notified when your order status changes" />
          <PrefToggle label="Promotional Emails" desc="Receive special offers and discount codes" />
          <PrefToggle label="Product Recommendations" desc="Personalized suggestions based on your activity" defaultOn={false} />
        </div>
      </div>

      <div className="pt-2 border-t border-white/10">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2 mt-4">
          <Eye className="w-4 h-4 text-violet-400" /> Privacy
        </h3>
        <div className="space-y-2.5">
          <PrefToggle label="Allow Personalization" desc="Use my activity to personalize my experience" />
          <PrefToggle label="Show Profile Publicly" desc="Let other users see your profile" defaultOn={false} />
        </div>
      </div>

      <div className="pt-2 border-t border-white/10 space-y-2.5">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3 mt-4 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-red-400" /> Danger Zone
        </h3>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-red-500/8 hover:bg-red-500/15 border border-red-500/25 hover:border-red-500/40 text-red-400 font-semibold rounded-xl transition-all text-sm">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <div className="text-left">
            <p>Logout All Devices</p>
            <p className="text-xs font-normal text-red-400/60 mt-0.5">Sign out from all active sessions</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-red-500/8 hover:bg-red-500/15 border border-red-500/25 hover:border-red-500/40 text-red-400 font-semibold rounded-xl transition-all text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div className="text-left">
            <p>Delete Account Permanently</p>
            <p className="text-xs font-normal text-red-400/60 mt-0.5">This action cannot be undone</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, isChecking } = useAuthGuard();
  const { user: profile, isLoading } = useProfile();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'vendor' | 'preferences'>('profile');
  const [dragActive, setDragActive] = useState(false);
  const [logoDragActive, setLogoDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  const display = useMemo(() => profile || user, [profile, user]);
  const isVendor = display?.role === 'VENDOR' || !!(profile as any)?.vendorType;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: "",
    vendorType: "",
    vendorDescription: "",
    vendorLogo: "",
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!display?.id || isInitialized) return;
    const existingEmail = (display.email || '').trim().toLowerCase();
    setFormData({
      firstName: display.firstName || "",
      lastName: display.lastName || "",
      email: display.email || "",
      phone: display.phone || "",
      profileImage: display.profileImage || "",
      vendorType: (profile as any)?.vendorType || "",
      vendorDescription: (profile as any)?.vendorDescription || "",
      vendorLogo: (profile as any)?.vendorLogo || "",
    });
    setVerifiedEmail(existingEmail);
    setEmailOtp('');
    setIsInitialized(true);
  }, [display?.id, isInitialized, profile]);

  const normalizedCurrentEmail = (display?.email || '').trim().toLowerCase();
  const normalizedFormEmail = formData.email.trim().toLowerCase();
  const emailChanged = normalizedFormEmail !== normalizedCurrentEmail;
  const isEmailVerifiedForChange = !emailChanged || normalizedFormEmail === verifiedEmail;

  // Calculate profile completion percentage
  const baseFields = [
    !!formData.firstName?.trim(),
    !!formData.lastName?.trim(),
    !!formData.email?.trim(),
    !!formData.phone?.trim(),
    !!formData.profileImage,
  ];
  const vendorFields = isVendor ? [
    !!formData.vendorType,
    !!formData.vendorDescription,
    !!formData.vendorLogo,
  ] : [];
  const allFields = [...baseFields, ...vendorFields];
  const profileCompleteFields = allFields.filter(Boolean).length;
  const profileCompletionPercentage = Math.round((profileCompleteFields / allFields.length) * 100);

  const uploadProfilePhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      setFormData((prev) => ({ ...prev, profileImage: response.data.url }));
      toast.success("Profile photo updated!");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to upload photo";
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setUploading(false);
    }
  };

  const uploadStoreLogo = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      setFormData((prev) => ({ ...prev, vendorLogo: response.data.url }));
      toast.success("Store logo uploaded!");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to upload logo";
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleLogoDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setLogoDragActive(true);
    } else if (e.type === "dragleave") {
      setLogoDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      uploadProfilePhoto(files[0]);
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
      toast.error("Please verify your new email with OTP before saving");
      return;
    }

    setSaving(true);
    try {
      const response = await userAPI.updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        profileImage: formData.profileImage || undefined,
        ...(isVendor && {
          vendorType: formData.vendorType || undefined,
          vendorDescription: formData.vendorDescription?.trim() || undefined,
          vendorLogo: formData.vendorLogo || undefined,
        }),
      });

      // Update form data with API response to ensure UI reflects saved data
      if (response?.data) {
        const updatedData = response.data;
        setFormData(prev => ({
          ...prev,
          firstName: updatedData.firstName || prev.firstName,
          lastName: updatedData.lastName || prev.lastName,
          email: updatedData.email || prev.email,
          phone: updatedData.phone || prev.phone,
          profileImage: updatedData.profileImage || prev.profileImage,
          vendorType: updatedData.vendorType || prev.vendorType,
          vendorDescription: updatedData.vendorDescription || prev.vendorDescription,
          vendorLogo: updatedData.vendorLogo || prev.vendorLogo,
        }));
      }

      if (emailChanged) {
        setVerifiedEmail(formData.email.trim().toLowerCase());
        setEmailOtp('');
      }

      await mutate('/users/profile');
      toast.success("Account updated successfully!");
      setIsEditMode(false);
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || "Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!emailChanged) {
      toast.error("Enter a new email to verify");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
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
    if (!emailChanged) {
      toast.error("Enter a new email to verify");
      return;
    }
    if (!emailOtp.trim()) {
      toast.error("Enter verification code");
      return;
    }
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

  const handleCopyUserId = () => {
    if (display?.id) {
      navigator.clipboard.writeText(display.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("User ID copied!");
    }
  };

  if (isChecking || !user || !display) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-400/30 border-t-pink-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-medium">Loading your account…</p>
        </div>
      </div>
    );
  }

  const roleDataMap = {
    'SUPER_ADMIN': { label: 'Super Admin', color: 'from-red-600 to-rose-600', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
    'ADMIN': { label: 'Admin', color: 'from-violet-600 to-purple-600', bgColor: 'bg-violet-500/10', textColor: 'text-violet-400' },
    'VENDOR': { label: 'Vendor', color: 'from-blue-600 to-cyan-600', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
    'USER': { label: 'Customer', color: 'from-emerald-600 to-teal-600', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
  } as const;

  const roleData = roleDataMap[display.role as keyof typeof roleDataMap] || { label: 'Customer', color: 'from-emerald-600 to-teal-600', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' };

  const navItems = [
    { label: "Profile", icon: User, tab: 'profile' as const, desc: "Personal information" },
    ...(isVendor ? [{ label: "Store Details", icon: Store, tab: 'vendor' as const, desc: "Your business" }] : []),
    { label: "Security", icon: Shield, tab: 'security' as const, desc: "Password & verification" },
    ...((!isVendor) ? [{ label: "Preferences", icon: Settings, tab: 'preferences' as const, desc: "App settings" }] : []),
  ];

  const quickLinks = [
    { label: "My Orders", icon: ShoppingBag, href: "/account/orders", desc: "Track & manage", color: "from-blue-500 to-cyan-500" },
    { label: "Addresses", icon: MapPin, href: "/account/addresses", desc: "Shipping locations", color: "from-violet-500 to-purple-500" },
    { label: "Wishlist", icon: Heart, href: "/wishlist", desc: "Saved items", color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${roleData.color} pt-12 pb-32 relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl" />

        <div className="container relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8">
            {/* Avatar Section */}
            <div className="relative flex-shrink-0 group">
              <div
                className={`relative w-28 h-28 rounded-2xl border-4 border-white/20 shadow-2xl overflow-hidden bg-slate-800 transition-all ${dragActive ? 'ring-4 ring-white/50 border-white/50' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <img
                  src={formData.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                {dragActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-xl flex items-center justify-center border-2 border-white hover:shadow-2xl transition-all hover:scale-110"
                title="Change photo"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
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
            </div>

            {/* Name & Role */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {display.firstName} {display.lastName}
              </h1>
              <p className="text-white/70 text-lg mb-4">{display.email}</p>
              <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
                <span className={`${roleData.bgColor} ${roleData.textColor} text-xs font-bold px-4 py-1.5 rounded-full border border-current/20 backdrop-blur-sm`}>
                  {roleData.label}
                </span>
                {isVendor && (
                  <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-400/20 backdrop-blur-sm">
                    {formData.vendorType || 'Vendor'}
                  </span>
                )}
                <span className="text-xs text-white/50 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Email Verified
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isEditMode ? (
                <>
                  <Eye className="w-4 h-4" />
                  View Mode
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Edit Information
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container -mt-24 pb-20 relative z-20">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Completion Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md hover:bg-white/10 transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Profile Complete</p>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{profileCompletionPercentage}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletionPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-white/50">{profileCompleteFields} of {allFields.length} fields complete</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-sm font-medium transition-all border-l-3 ${
                      active
                        ? 'border-pink-500 bg-white/10 text-white'
                        : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${active ? 'text-pink-500' : 'text-white/40'}`} />
                    <div className="text-left">
                      <p>{item.label}</p>
                      <p className="text-xs text-white/40 font-normal">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Quick Access</p>
              <div className="space-y-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-all group"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{link.label}</p>
                        <p className="text-xs text-white/50">{link.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/5 border border-white/10 rounded-xl backdrop-blur-md overflow-hidden shadow-2xl">
                <div className="px-6 py-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold mb-1">Personal Information</h2>
                  <p className="text-sm text-white/60">{isEditMode ? 'Update your basic details and contact information' : 'Your account details'}</p>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-3" />
                    <p className="text-sm text-white/60">Loading your profile...</p>
                  </div>
                ) : isEditMode ? (
                  <form onSubmit={handleSave} className="p-6 space-y-6">
                    {/* Name Fields */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">First Name</label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-pink-500 transition-colors" />
                          <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Last Name</label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-pink-500 transition-colors" />
                          <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-pink-500 transition-colors" />
                        <input
                          type="email"
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => {
                            const nextEmail = e.target.value;
                            setFormData((p) => ({ ...p, email: nextEmail }));
                            if (nextEmail.trim().toLowerCase() !== verifiedEmail) setEmailOtp('');
                          }}
                        />
                      </div>

                      {emailChanged && (
                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-3 animate-in fade-in">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-amber-100">Email Change Verification</p>
                              <p className="text-xs text-amber-200/70 mt-1">Verify your new email address before saving changes</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleSendEmailOtp}
                            disabled={sendingOtp}
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            {sendingOtp ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4" />
                                Send Verification Code
                              </>
                            )}
                          </button>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                              placeholder="Enter 6-digit code"
                              value={emailOtp}
                              onChange={(e) => setEmailOtp(e.target.value)}
                              maxLength={6}
                            />
                            <button
                              type="button"
                              onClick={handleVerifyEmailOtp}
                              disabled={verifyingOtp}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                              {verifyingOtp ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  Verify
                                </>
                              )}
                            </button>
                          </div>

                          {isEmailVerifiedForChange && (
                            <p className="text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Email verified successfully!
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-pink-500 transition-colors" />
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                          placeholder="+977 98XXXXXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                      <p className="text-xs text-white/40 mt-1.5">We'll use this to contact you about your orders</p>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <p className="text-xs text-white/50">Changes update immediately upon save</p>
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-2xl hover:scale-105"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-3.5 h-3.5 text-white/30" />
                          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">First Name</p>
                        </div>
                        <p className="text-base text-white font-semibold">{formData.firstName || <span className="text-white/30 font-normal">Not set</span>}</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-3.5 h-3.5 text-white/30" />
                          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Last Name</p>
                        </div>
                        <p className="text-base text-white font-semibold">{formData.lastName || <span className="text-white/30 font-normal">Not set</span>}</p>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-3.5 h-3.5 text-white/30" />
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Email Address</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-base text-white font-semibold">{formData.email || <span className="text-white/30 font-normal">Not set</span>}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-3.5 h-3.5 text-white/30" />
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Phone Number</p>
                      </div>
                      <p className="text-base text-white font-semibold">{formData.phone || <span className="text-white/30 font-normal">Not set</span>}</p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Information
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white/5 border border-white/10 rounded-xl backdrop-blur-md overflow-hidden shadow-2xl">
                <div className="px-6 py-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold mb-1">Security & Privacy</h2>
                  <p className="text-sm text-white/60">Keep your account safe and secure</p>
                </div>

                <div className="p-6 space-y-3">
                  {/* Email Verification */}
                  <div className="flex items-center gap-4 p-4 bg-emerald-500/8 border border-emerald-500/25 rounded-xl hover:bg-emerald-500/12 transition-colors">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">Email Verified</p>
                      <p className="text-xs text-white/50 mt-0.5 truncate">{display.email}</p>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 flex-shrink-0">
                      Active
                    </span>
                  </div>

                  {/* Password */}
                  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-colors">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">Password</p>
                      <p className="text-xs text-white/50 mt-0.5">Last changed: never</p>
                    </div>
                    <button className="flex-shrink-0 text-xs font-bold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-pink-500/10">
                      <Lock className="w-3.5 h-3.5" /> Change
                    </button>
                  </div>

                  {/* Active Sessions */}
                  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-colors">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">Active Sessions</p>
                      <p className="text-xs text-white/50 mt-0.5">1 device currently signed in</p>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/25 flex-shrink-0">
                      1 Active
                    </span>
                  </div>

                  {/* User ID */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-colors">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2.5">Your User ID</p>
                    <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2.5">
                      <code className="text-xs font-mono text-white/60 flex-1 truncate">{display.id}</code>
                      <button
                        onClick={handleCopyUserId}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                        title="Copy User ID"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white/60" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Tab */}
            {isVendor && activeTab === 'vendor' && (
              <div className="bg-white/5 border border-white/10 rounded-xl backdrop-blur-md overflow-hidden shadow-2xl">
                <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                      <Store className="w-6 h-6 text-pink-500" />
                      Store Information
                    </h2>
                    <p className="text-sm text-white/60">{isEditMode ? 'Manage your vendor business details' : 'Your store details'}</p>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {isEditMode ? (
                    <form onSubmit={handleSave} className="space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-white/80 block mb-2">Vendor Type</label>
                        <select
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                          value={formData.vendorType}
                          onChange={(e) => setFormData((prev) => ({ ...prev, vendorType: e.target.value }))}
                        >
                          <option value="" className="bg-slate-800">— Select Vendor Type —</option>
                          <option value="BEAUTY" className="bg-slate-800">Beauty</option>
                          <option value="PHARMACY" className="bg-slate-800">Pharmacy</option>
                          <option value="COSMETICS" className="bg-slate-800">Cosmetics</option>
                          <option value="SKINCARE" className="bg-slate-800">Skincare</option>
                          <option value="FRAGRANCE" className="bg-slate-800">Fragrance</option>
                          <option value="WELLNESS" className="bg-slate-800">Wellness</option>
                          <option value="ORGANIC" className="bg-slate-800">Organic</option>
                          <option value="LUXURY" className="bg-slate-800">Luxury</option>
                          <option value="MEDICAL" className="bg-slate-800">Medical</option>
                          <option value="OTHER" className="bg-slate-800">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-white/80 block mb-2">Store Description</label>
                        <textarea
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                          value={formData.vendorDescription}
                          onChange={(e) => setFormData((prev) => ({ ...prev, vendorDescription: e.target.value }))}
                          placeholder="Tell customers about your store, your specialty, and what makes you unique..."
                          rows={5}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-white/80 block mb-2">Store Logo</label>
                        <div className="space-y-3">
                          <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                              logoDragActive
                                ? 'border-pink-500 bg-pink-500/10'
                                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                            }`}
                            onDragEnter={handleLogoDrag}
                            onDragLeave={handleLogoDrag}
                            onDragOver={handleLogoDrag}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setLogoDragActive(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) uploadStoreLogo(file);
                            }}
                            onClick={() => {
                              const input = logoFileInputRef.current;
                              if (input) {
                                input.value = '';
                                input.click();
                              }
                            }}
                          >
                            <div className="flex flex-col items-center justify-center space-y-2">
                              {isUploadingLogo ? (
                                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                              ) : (
                                <Camera className="w-8 h-8 text-white/60" />
                              )}
                              <p className="text-sm font-medium text-white">
                                {isUploadingLogo ? 'Uploading...' : 'Drag & drop logo or click to upload'}
                              </p>
                              <p className="text-xs text-white/50">PNG, JPG up to 5MB</p>
                            </div>
                            <input
                              ref={logoFileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadStoreLogo(file);
                              }}
                            />
                          </div>

                          <input
                            type="text"
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-sm"
                            value={formData.vendorLogo}
                            onChange={(e) => setFormData((prev) => ({ ...prev, vendorLogo: e.target.value }))}
                            placeholder="Or paste logo URL"
                          />

                          {formData.vendorLogo && (
                            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                              <p className="text-xs text-white/60 mb-2">Preview</p>
                              <img
                                src={formData.vendorLogo}
                                alt="Store Logo"
                                className="h-20 w-auto mx-auto rounded-lg border border-white/10 object-contain bg-white/5 p-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-semibold text-white/80 block mb-2">Vendor ID</label>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-mono text-pink-400">glo-vendor{display?.id?.substring(display.id.length - 4) || '0000'}</p>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`glo-vendor${display?.id?.substring(display.id.length - 4) || '0000'}`);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                              toast.success("Vendor ID copied!");
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            title="Copy Vendor ID"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-white/40 hover:text-white/60" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-white/80 block mb-2">Vendor Type</label>
                        <p className="text-lg text-white">{formData.vendorType || '—'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-white/80 block mb-2">Store Description</label>
                        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{formData.vendorDescription || '—'}</p>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-white/80 block mb-2">Store Logo</label>
                        {formData.vendorLogo ? (
                          <div className="text-center">
                            <img
                              src={formData.vendorLogo}
                              alt="Store Logo"
                              className="h-24 w-auto mx-auto rounded-lg border border-white/10 object-contain bg-white/5 p-2"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '';
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-white/60">No logo uploaded</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {!isVendor && activeTab === 'preferences' && (
              <div className="bg-white/5 border border-white/10 rounded-xl backdrop-blur-md overflow-hidden shadow-2xl">
                <div className="px-6 py-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold mb-1">Preferences</h2>
                  <p className="text-sm text-white/60">Customize your experience</p>
                </div>

                <PreferencesTab />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
