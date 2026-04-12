import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import Cookies from 'js-cookie';
import { userAPI, uploadAPI } from '@/lib/api';
import { ProfileFormState, UpdateProfilePayload, UserProfile } from '@/types/profile';

/**
 * Unified Profile Management Hook
 * Handles profile updates, email change OTP verification, image uploads
 * Used by both customer and vendor account pages
 */
export const useProfileManagement = (initialProfile: UserProfile | null | undefined, includeVendorFields: boolean = false) => {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initialFormData: ProfileFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
    vendorType: '',
    vendorDescription: '',
    vendorLogo: '',
  };

  const [formData, setFormData] = useState<ProfileFormState>(initialFormData);

  // Initialize form with profile data
  useEffect(() => {
    if (!initialProfile) return;
    
    const existingEmail = (initialProfile.email || '').trim().toLowerCase();
    setFormData({
      firstName: initialProfile.firstName || '',
      lastName: initialProfile.lastName || '',
      email: initialProfile.email || '',
      phone: initialProfile.phone || '',
      profileImage: initialProfile.profileImage || '',
      vendorType: initialProfile.vendorType || '',
      vendorDescription: initialProfile.vendorDescription || '',
      vendorLogo: initialProfile.vendorLogo || '',
    });
    setVerifiedEmail(existingEmail);
    setEmailOtp('');
  }, [initialProfile]);

  // Email change tracking
  const normalizedCurrentEmail = (initialProfile?.email || '').trim().toLowerCase();
  const normalizedFormEmail = (formData.email || '').trim().toLowerCase();
  const emailChanged = normalizedFormEmail !== normalizedCurrentEmail;
  const isEmailVerifiedForChange = !emailChanged || normalizedFormEmail === verifiedEmail;

  // Upload profile photo
  const uploadProfilePhoto = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file);
      setFormData((prev) => ({ ...prev, profileImage: response.data.url }));
      toast.success('Profile photo uploaded');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to upload photo';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setUploading(false);
    }
  }, []);

  // Send email change OTP
  const sendEmailChangeOtp = useCallback(async () => {
    if (!normalizedFormEmail) {
      toast.error('Email is required');
      return;
    }

    if (normalizedFormEmail === normalizedCurrentEmail) {
      toast.error('Please enter a different email');
      return;
    }

    setSendingOtp(true);
    try {
      await userAPI.sendEmailChangeOtp(normalizedFormEmail);
      toast.success('OTP sent to your new email');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to send OTP';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setSendingOtp(false);
    }
  }, [normalizedFormEmail, normalizedCurrentEmail]);

  // Verify email change OTP
  const verifyEmailChangeOtp = useCallback(async () => {
    if (!emailOtp.trim()) {
      toast.error('Please enter OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      await userAPI.verifyEmailChangeOtp(normalizedFormEmail, emailOtp);
      setVerifiedEmail(normalizedFormEmail);
      setEmailOtp('');
      toast.success('Email verified successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to verify OTP';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setVerifyingOtp(false);
    }
  }, [emailOtp, normalizedFormEmail]);

  // Save profile
  const saveProfile = useCallback(async (onBeforeSave?: () => boolean) => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }

    if (emailChanged && !isEmailVerifiedForChange) {
      toast.error('Please verify your new email with OTP before saving');
      return false;
    }

    if (onBeforeSave && !onBeforeSave()) {
      return false;
    }

    setSaving(true);
    try {
      const payload: UpdateProfilePayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        profileImage: formData.profileImage || undefined,
      };

      // Add vendor fields if applicable
      if (includeVendorFields) {
        payload.vendorType = formData.vendorType || undefined;
        payload.vendorDescription = formData.vendorDescription?.trim() || undefined;
        payload.vendorLogo = formData.vendorLogo || undefined;
      }

      await userAPI.updateProfile(payload);
      await mutate('/users/profile');
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(Array.isArray(message) ? message.join(', ') : message || 'Failed to update profile');
      return false;
    } finally {
      setSaving(false);
    }
  }, [formData, emailChanged, isEmailVerifiedForChange, includeVendorFields]);

  return {
    // State
    formData,
    setFormData,
    emailOtp,
    setEmailOtp,
    verifiedEmail,
    setVerifiedEmail,
    saving,
    uploading,
    sendingOtp,
    verifyingOtp,
    fileInputRef,
    
    // Computed
    emailChanged,
    isEmailVerifiedForChange,
    normalizedCurrentEmail,
    normalizedFormEmail,
    
    // Callbacks
    uploadProfilePhoto,
    sendEmailChangeOtp,
    verifyEmailChangeOtp,
    saveProfile,
  };
};
