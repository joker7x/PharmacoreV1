
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
  pack_size?: number | null;  // Added for unit price calculation
  dosage_form?: string;
  api_updated_at: string | null; // timestamptz (ISO string)
  fetched_at?: string;           // Optional audit field
  
  // UI Support Helpers
  id?: string;

  // Stats/Sync support fields (used in StatsView.tsx)
  newPrice?: number;
  oldPrice?: number;
  nameEn?: string;
  nameAr?: string;
}

// Fix for missing Exported member 'ExternalDrugItem' in services/api.ts
export interface ExternalDrugItem {
  id: string;
  name: string;
  arabic: string;
  price: string;
  oldprice: string;
  Date_updated: string;
}

// Fix for missing Exported member 'AdminStats' in services/api.ts and components/StatsView.tsx
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

// Fix for missing Exported member 'LightDrug' in services/ai.ts
export interface LightDrug {
  name: string;
  price: number;
  company: string;
}

// Fix for missing Exported member 'DeepMarketAnalysis' in services/ai.ts
export interface DeepMarketAnalysis {
  reportDate: string;
  marketSentiment: string;
  volatilityScore: number;
  executiveSummary: string;
  buyOpportunities: Array<{
    name: string;
    reason: string;
    urgency: string;
  }>;
  companyAnalysis: any;
  shortageWarnings: string[];
}

// Fix for missing Exported member 'SyncStatus' in services/sync.ts
export type SyncStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

// Fix for missing Exported member 'SyncMetadata' in services/sync.ts
export interface SyncMetadata {
  status: SyncStatus;
  lastOffset: number;
  totalFetched: number;
  lastUpdate: string | null;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'update';
  timestamp: string;
  isRead: boolean;
}

export interface InvoiceItem {
  id: string; 
  drug_no?: string; 
  name: string;
  name_ar?: string;
  unitPrice: number; // Calculated: price_new / pack_size
  quantity: number;  // In units (not packs)
  packPrice: number; // For reference
  packSize: number;  // For reference
}

export type AppView = 'home' | 'settings' | 'admin' | 'stats' | 'invoice';
export type TabMode = 'all' | 'changed' | 'fav';

export interface TawreedProduct {
  productId: string;
  productName: string;
  stores: any[];
  totalQty: number;
  avgDiscount: number | null;
  bestSale: number | null;
}
