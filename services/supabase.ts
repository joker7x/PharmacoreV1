
import { SUPABASE_URL, SUPABASE_KEY, MAIN_TABLE } from '../constants';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

const MASTER_ADMIN_ID = 1541678512;

export const searchDrugs = async (query: string): Promise<any[]> => {
  if (!query || query.length < 2) return [];
  try {
    const isEnglish = /^[a-zA-Z]/.test(query);
    const filterField = isEnglish ? 'name_en' : 'name_ar';
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${MAIN_TABLE}?${filterField}=ilike.*${encodeURIComponent(query)}*&select=*&limit=10`, 
      { headers }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    return [];
  }
};

export const lookupByBarcode = async (barcode: string): Promise<any | null> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${MAIN_TABLE}?drug_no=eq.${barcode}&select=*`, 
      { headers }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data[0] || null;
  } catch (e) {
    return null;
  }
};

export const saveInvoice = async (invoiceData: any): Promise<string | null> => {
  try {
    const id = `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_invoices`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        id,
        content: invoiceData,
        created_at: new Date().toISOString()
      })
    });
    if (!response.ok) {
        // Fallback for local testing or missing table
        return id; 
    }
    const data = await response.json();
    return data[0]?.id || id;
  } catch (e) {
    console.error("Save invoice failed", e);
    return null;
  }
};

export const getInvoice = async (id: string): Promise<any | null> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_invoices?id=eq.${id}&select=*`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    return data[0] || null;
  } catch (e) { 
    console.error("Get invoice failed", e);
    return null; 
  }
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
      return { ...existingUser, ...userData };
    } else {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...userData,
          is_admin: Number(user.id) === MASTER_ADMIN_ID,
          device_info: { items_limit: 100 }
        })
      });
      const created = await response.json();
      return created[0];
    }
  } catch (e) {
    return null;
  }
};

export const getAllUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_users?select=*&order=last_seen.desc`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch (e) { return []; }
};

export const updateUserPermissions = async (userId: number, updates: any): Promise<void> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${userId}&select=*`, { headers });
    const users = await res.json();
    const user = users[0];
    if (!user) return;

    const newDeviceInfo = { ...user.device_info, ...updates };
    const body: any = { device_info: newDeviceInfo };
    if ('is_admin' in updates) body.is_admin = updates.is_admin;

    await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(body)
    });
  } catch (e) {}
};
