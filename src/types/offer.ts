// Types and interfaces for Offer Management System

export type OfferType = 'PERCENTAGE' | 'FLAT' | 'BOGO' | 'FLASH_SALE';
export type OfferStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'PAUSED' | 'DRAFT';
export type AppliesToType = 'ALL' | 'CATEGORY' | 'VENDOR' | 'PRODUCT';
export type DiscountType = 'PERCENTAGE' | 'FLAT' | 'BOGO';

export interface Offer {
  id: string;
  name: string;
  description: string;
  type: OfferType;
  appliesToType: AppliesToType;
  appliesTo: {
    categoryIds?: string[];
    vendorIds?: string[];
    productIds?: string[];
  };
  discountType: DiscountType;
  discountValue: number;
  maxDiscountLimit?: number;
  bannerImage?: string;
  priority: number;
  status: OfferStatus;
  startDate: Date;
  endDate: Date;
  autoActivate: boolean;
  conditions: {
    minOrderAmount?: number;
    usageLimit?: number;
    perUserLimit?: number;
  };
  flashSale?: {
    countdownTimer: boolean;
    limitedStock: boolean;
    highlightedProducts: string[];
  };
  analytics: {
    totalUses: number;
    revenue: number;
    conversionRate: number;
    impressions: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PromoCode {
  id: string;
  code: string;
  offerId?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountLimit?: number;
  status: OfferStatus;
  expiryDate: Date;
  totalUses: number;
  remainingUses: number;
  perUserLimit: number;
  minOrderAmount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OfferAnalytics {
  offerId: string;
  date: Date;
  impressions: number;
  clicks: number;
  conversions: number;
  revenueGenerated: number;
  avgDiscount: number;
  topProducts: Array<{ productId: string; sales: number }>;
}

export type CreateOfferPayload = Omit<Offer, 'id' | 'analytics' | 'createdAt' | 'updatedAt' | 'createdBy'>;
export type UpdateOfferPayload = Partial<CreateOfferPayload>;
