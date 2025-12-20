
/**
 * Single table structure matching 'drugsfull'
 */
export interface Drug {
  drug_no: string;           // Primary Key
  name_en: string;
  name_ar: string;
  company?: string;
  price_new: number | null;
  price_old: number | null;
  api_updated_at: string | null; // timestamptz (ISO string)
  fetched_at?: string;           // Optional audit field
  
  // UI Support Helpers (derived or aliases)
  id?: string;
  newPrice?: number | null;
  oldPrice?: number | null;
  nameEn?: string;
  nameAr?: string;
  updatedAt?: string | null;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'update';
  timestamp: string;
  isRead: boolean;
}

/**
 * Raw drug item structure returned from dwaprices.com API
 */
export interface ExternalDrugItem {
  id: string;
  name: string;
  arabic: string;
  price: string;
  oldprice: string;
  Date_updated?: string; // Numeric string (milliseconds)
}

export type AppView = 'home' | 'settings' | 'admin' | 'stats';
export type TabMode = 'all' | 'changed' | 'fav';

export type SyncStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

export interface SyncMetadata {
  status: SyncStatus;
  lastOffset: number;
  totalFetched: number;
  lastUpdate: string | null;
}

export interface AdminStats {
  totalDrugs: number;
  totalChanged: number;
  lastUpdate: string;
  topGainers: Drug[];
  healthScore: number;
  priceRanges: {
    low: number;
    mid: number;
    high: number;
  };
}

export interface LightDrug {
  n: string; // name
  p: number; // price
  c: string; // company
}

export interface DeepMarketAnalysis {
  reportDate: string;
  marketSentiment: 'bullish' | 'bearish' | 'volatile';
  volatilityScore: number;
  executiveSummary: string;
  buyOpportunities: Array<{ name: string; reason: string; urgency: 'high' | 'medium' }>;
  companyAnalysis: Array<{ name: string; inflationRate: number; strategy: string }>;
  shortageWarnings: Array<{ category: string; riskLevel: string; reason: string }>;
}

export interface TawreedProduct {
  productId: string;
  productName: string;
  stores: any[];
  totalQty: number;
  avgDiscount: number | null;
  bestSale: number | null;
}