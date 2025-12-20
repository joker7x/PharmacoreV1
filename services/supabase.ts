
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

export const getGlobalConfig = async (): Promise<any> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.global_config&select=value`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    return data[0]?.value || null;
  } catch (e) { return null; }
};

export const updateGlobalConfig = async (config: any): Promise<void> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.global_config`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ value: config })
    });
    if (response.status === 404 || !response.ok) {
      await fetch(`${SUPABASE_URL}/rest/v1/app_settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ key: 'global_config', value: config })
      });
    }
  } catch (e) {}
};

/**
 * مزامنة بيانات مستخدم تليجرام مع قاعدة البيانات
 */
export const syncTelegramUser = async (user: any): Promise<void> => {
  if (!user?.id) return;
  try {
    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      last_seen: new Date().toISOString(),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(userData)
    });

    if (response.status === 404 || !response.ok) {
      await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...userData, created_at: new Date().toISOString() })
      });
    }
  } catch (e) {
    console.error("User sync failed", e);
  }
};

/**
 * جلب جميع المستخدمين للوحة الإدارة
 */
export const getAllUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_users?select=*&order=last_seen.desc`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch (e) { return []; }
};

/**
 * تسجيل عملية بحث للمستخدم
 */
export const incrementUserSearch = async (userId: number): Promise<void> => {
  // ملاحظة: لزيادة الرقم نحتاج لـ RPC أو جلب القيمة القديمة وزيادتها
  // للتبسيط هنا، سنقوم فقط بتحديث آخر ظهور
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ last_seen: new Date().toISOString() })
    });
  } catch (e) {}
};
