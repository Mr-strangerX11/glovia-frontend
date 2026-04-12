/**
 * Unified Profile Interface
 * Used across all profile editing pages (customer, vendor, admin)
 * Ensures consistency in data structure and API calls
 */

export interface UserProfile {
  // Basic Info (All users)
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN' | 'EDITOR' | 'MARKETING' | 'AUDITOR';

  // Vendor Info (VENDOR role only)
  vendorType?: 'BEAUTY' | 'PHARMACY' | 'COSMETICS' | 'SKINCARE' | 'FRAGRANCE' | 'WELLNESS' | 'ORGANIC' | 'LUXURY' | 'MEDICAL' | 'OTHER';
  vendorDescription?: string;
  vendorLogo?: string;
  isFrozen?: boolean;
  frozenAt?: string;
  frozenReason?: string;

  // Account Status
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  // Basic Info (All users can update)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;

  // Vendor Info (VENDOR role only)
  vendorType?: string;
  vendorDescription?: string;
  vendorLogo?: string;
}

export interface ProfileFormState extends UpdateProfilePayload {
  // Helper fields for UI - make required
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  vendorType: string;
  vendorDescription: string;
  vendorLogo: string;
}

export const VENDOR_TYPES = [
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'COSMETICS', label: 'Cosmetics' },
  { value: 'SKINCARE', label: 'Skincare' },
  { value: 'FRAGRANCE', label: 'Fragrance' },
  { value: 'WELLNESS', label: 'Wellness' },
  { value: 'ORGANIC', label: 'Organic' },
  { value: 'LUXURY', label: 'Luxury' },
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'OTHER', label: 'Other' },
] as const;
