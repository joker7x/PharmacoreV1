
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const MASTER_ADMIN_ID = 1541678512;

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
    await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.global_config`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ value: config })
    });
  } catch (e) {}
};

export const syncTelegramUser = async (user: any): Promise<any> => {
  if (!user?.id) return null;
  try {
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${user.id}&select=*`, { headers });
    const existingUsers = await checkRes.json();
    const existingUser = existingUsers[0];

    const isMaster = Number(user.id) === MASTER_ADMIN_ID;
    
    const userData: any = {
      id: user.id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      language_code: user.language_code || "ar",
      last_seen: new Date().toISOString()
    };

    if (existingUser) {
      await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify(userData)
      });
      return { ...existingUser, ...userData, is_admin: existingUser.is_premium || isMaster };
    } else {
      const createRes = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ 
          ...userData, 
          created_at: new Date().toISOString(),
          is_premium: isMaster,
          device_info: { is_blocked: false, items_limit: 100 } // الإعدادات الافتراضية
        })
      });
      const created = await createRes.json();
      return { ...created[0], is_admin: isMaster };
    }
  } catch (e) {
    return { id: user.id, is_admin: Number(user.id) === MASTER_ADMIN_ID };
  }
};

export const getAllUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_users?select=*&order=last_seen.desc`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch (e) { return []; }
};

export const updateUserPermissions = async (userId: number, permissions: { is_blocked?: boolean, items_limit?: number, is_admin?: boolean }): Promise<void> => {
  if (userId === MASTER_ADMIN_ID) return;
  try {
    // جلب البيانات الحالية أولاً للحفاظ على الـ device_info القديم
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${userId}&select=device_info,is_premium`, { headers });
    const data = await res.json();
    const currentInfo = data[0]?.device_info || {};

    const updatedData: any = {};
    
    if (permissions.is_admin !== undefined) {
      updatedData.is_premium = permissions.is_admin;
    }

    updatedData.device_info = {
      ...currentInfo,
      is_blocked: permissions.is_blocked !== undefined ? permissions.is_blocked : currentInfo.is_blocked,
      items_limit: permissions.items_limit !== undefined ? permissions.items_limit : currentInfo.items_limit
    };

    await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(updatedData)
    });
  } catch (e) {
    console.error("Update permissions error:", e);
  }
};
