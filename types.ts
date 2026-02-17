
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

export interface UserAccount {
  points: number;
  level: number;
  correctAnswers: number;
}

export type AppView = 'home' | 'settings' | 'admin' | 'stats' | 'invoice' | 'quiz';
export type TabMode = 'all' | 'changed' | 'fav';

/**
 * Single table structure matching 'drugsfull'
 */
export interface Drug {
  drug_no: string;           
  name_en: string;
  name_ar: string;
  company?: string;
  price_new: number | null;
  price_old: number | null;
  pack_size?: number | null;  
  dosage_form?: string;
  api_updated_at: string | null; 
  fetched_at?: string;           
  id?: string;
  newPrice?: number;
  oldPrice?: number;
  nameEn?: string;
  nameAr?: string;
}

export interface ExternalDrugItem {
  id: string;
  name: string;
  arabic: string;
  price: string;
  oldprice: string;
  Date_updated: string;
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
  name: string;
  price: number;
  company: string;
}

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

export type SyncStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

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
  unitPrice: number; 
  quantity: number;  
  packPrice: number; 
  packSize: number;  
}

export interface TawreedProduct {
  productId: string;
  productName: string;
  stores: any[];
  totalQty: number;
  avgDiscount: number | null;
  bestSale: number | null;
}
