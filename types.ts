// This file contains a subset of types from the main application,
// required for the admin panel's backend API service to map data correctly.

export interface User {
  id: string;
  telegramId?: number;
  name: string;
  avatarUrl: string;
  headerImageUrl?: string;
  rating: number;
  following: string[];
  balance: number;
  commissionOwed: number;
  verificationLevel: 'NONE' | 'PRO';
  affiliateId?: string;
  phoneNumber?: string;
  defaultShippingAddress?: any; 
  businessInfo?: any;
  tonWalletAddress?: string;
}

export type AuthenticationStatus =
  | 'NONE'
  | 'PENDING'
  | 'AUTHENTICATED'
  | 'REJECTED';
  
export interface VariantAttribute {
  name: string;
  options: string[];
}

export interface ProductVariant {
  id: string;
  attributes: Record<string, string>;
  price: number;
  salePrice?: number;
  stock: number;
  sku?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price?: number;
  salePrice?: number;
  imageUrls: string[];
  videoUrl?: string;
  category: string;
  seller: User;
  dynamicAttributes: Record<string, string | number>;
  isPromoted?: boolean;
  uniqueness?: 'ONE_OF_A_KIND' | 'LIMITED_EDITION' | 'MADE_TO_ORDER';
  giftWrapAvailable?: boolean;
  giftWrapPrice?: number;
  purchaseCost?: number;
  weight?: number; // grams
  productType?: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
  digitalFileUrl?: string;
  isB2BEnabled?: boolean;
  b2bMinQuantity?: number;
  b2bPrice?: number;
  isAuction?: boolean;
  auctionEnds?: number;
  startingBid?: number;
  currentBid?: number;
  bidders?: string[];
  winnerId?: string;
  finalPrice?: number;
  variants?: ProductVariant[];
  variantAttributes?: VariantAttribute[];
  isAuthenticationAvailable?: boolean;
  authenticationStatus?: AuthenticationStatus;
  authenticationReportUrl?: string;
  nftTokenId?: string;
  nftContractAddress?: string;
}