
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

/**
 * جلب الإعدادات العالمية من Supabase
 */
export const getGlobalConfig = async (): Promise<any> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.global_config&select=value`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data[0]?.value || null;
  } catch (e) {
    console.error("Failed to fetch global config", e);
    return null;
  }
};

/**
 * تحديث الإعدادات العالمية في Supabase
 */
export const updateGlobalConfig = async (config: any): Promise<void> => {
  try {
    // محاولة التحديث (PATCH) بناءً على المفتاح global_config
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.global_config`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ value: config })
    });

    // إذا لم يجد السطر (404 أو استجابة فارغة)، نقوم بإنشائه لأول مرة (POST)
    if (response.status === 404 || !response.ok) {
        await fetch(`${SUPABASE_URL}/rest/v1/app_settings`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key: 'global_config', value: config })
        });
    }
  } catch (e) {
    console.error("Failed to sync config with Supabase", e);
  }
};
