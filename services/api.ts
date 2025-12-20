
import { MEDHOME_API_URL } from '../constants';
import { Drug, ExternalDrugItem, AdminStats } from '../types';

/**
 * تحويل البيانات القادمة من API medhome إلى واجهة Drug المستخدمة في التطبيق
 */
const mapExternalToDrug = (item: ExternalDrugItem): Drug => {
  const pNew = item.price ? parseFloat(item.price) : null;
  const pOld = item.oldprice ? parseFloat(item.oldprice) : null;
  
  // تحويل التاريخ من ميلي ثانية إلى ISO string
  let apiDate = null;
  if (item.Date_updated) {
    const ms = parseInt(item.Date_updated, 10);
    const correctedMs = ms < 10000000000 ? ms * 1000 : ms;
    apiDate = new Date(correctedMs).toISOString();
  }

  return {
    drug_no: item.id,
    name_en: item.name || "Unknown",
    name_ar: item.arabic || "",
    price_new: pNew,
    price_old: pOld,
    api_updated_at: apiDate,
    fetched_at: new Date().toISOString()
  };
};

/**
 * جلب دفعة من البيانات (100 صنف) من API medhome مباشرة
 */
export const fetchDrugBatchFromAPI = async (offset: number): Promise<Drug[]> => {
  try {
    const response = await fetch(MEDHOME_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      },
      body: `lastpricesForFlutter=${offset}`
    });

    if (!response.ok) return [];
    const data: ExternalDrugItem[] = await response.json();
    
    if (Array.isArray(data)) {
      return data.map(mapExternalToDrug);
    }
    return [];
  } catch (e) {
    console.error("API Fetch Error:", e);
    return [];
  }
};

/**
 * حساب إحصائيات لوحة التحكم
 * Fix for: Error in file components/StatsView.tsx on line 6: Module '"../services/api.ts"' has no exported member 'fetchAdminStats'.
 */
export const fetchAdminStats = (drugs: Drug[]): AdminStats => {
  const totalDrugs = drugs.length;
  const totalChanged = drugs.filter(d => d.price_new !== null && d.price_old !== null && d.price_new !== d.price_old).length;
  
  const priceRanges = {
    low: drugs.filter(d => (d.price_new || 0) < 50).length,
    mid: drugs.filter(d => (d.price_new || 0) >= 50 && (d.price_new || 0) <= 200).length,
    high: drugs.filter(d => (d.price_new || 0) > 200).length,
  };

  const topGainers = [...drugs]
    .filter(d => d.price_new !== null && d.price_old !== null && d.price_old > 0)
    .sort((a, b) => {
      const pNewA = Number(a.price_new || 0);
      const pOldA = Number(a.price_old || 1);
      const pNewB = Number(b.price_new || 0);
      const pOldB = Number(b.price_old || 1);
      const gainA = (pNewA - pOldA) / pOldA;
      const gainB = (pNewB - pOldB) / pOldB;
      return gainB - gainA;
    })
    .slice(0, 5);

  return {
    totalDrugs,
    totalChanged,
    lastUpdate: new Date().toISOString(),
    topGainers,
    healthScore: 100,
    priceRanges
  };
};
