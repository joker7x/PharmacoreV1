
import { SUPABASE_URL, SUPABASE_KEY, MAIN_TABLE, BOT_USERNAME } from '../constants.ts';
import { Drug } from '../types.ts';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json'
};

export const searchDrugs = async (query: string): Promise<Drug[]> => {
  try {
    const encodedQuery = encodeURIComponent(`*${query}*`);
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${MAIN_TABLE}?or=(name_en.ilike.${encodedQuery},name_ar.ilike.${encodedQuery})&limit=20`,
      { headers }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (e) { return []; }
};

export const lookupByBarcode = async (barcode: string): Promise<Drug | null> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${MAIN_TABLE}?drug_no=eq.${barcode}&select=*`,
      { headers }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data[0] || null;
  } catch (e) { return null; }
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
        const err = await response.json();
        console.error("Supabase Save Error:", err);
        return null;
    }
    const data = await response.json();
    return data[0]?.id || id;
  } catch (e) { return null; }
};

export const createSecureShareLink = async (invoiceId: string): Promise<string | null> => {
  try {
    const token = Math.random().toString(36).substring(2, 20);
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    const response = await fetch(`${SUPABASE_URL}/rest/v1/invoice_shares`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        invoice_id: invoiceId,
        token: token,
        expires_at: expiresAt,
        is_used: false
      })
    });

    if (!response.ok) return null;
    return `https://t.me/${BOT_USERNAME}?start=inv_${invoiceId}_${token}`;
  } catch (e) { return null; }
};

export const validateShareToken = async (invoiceId: string, token: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/invoice_shares?invoice_id=eq.${invoiceId}&token=eq.${token}&select=*`,
      { headers }
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      const share = data[0];
      const isExpired = new Date(share.expires_at) < new Date();
      if (!isExpired) return true;
    }
    return false;
  } catch (e) { 
    console.error("Validation Error:", e);
    return false; 
  }
};

export const getInvoice = async (id: string): Promise<any | null> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_invoices?id=eq.${id}&select=*`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    return data[0] || null;
  } catch (e) { return null; }
};

export const getGlobalConfig = async (): Promise<any> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.global_config&select=value`, { headers });
    const data = await response.json();
    return data[0]?.value || null;
  } catch (e) { return null; }
};

export const updateGlobalConfig = async (config: any): Promise<void> => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.global_config`, {
      method: 'PATCH',
      headers: { ...headers },
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

    const userData = {
      id: user.id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      last_seen: new Date().toISOString()
    };

    if (existingUser) {
      await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(userData)
      });
      return { ...existingUser, ...userData };
    } else {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...userData, device_info: { items_limit: 100 } })
      });
      const created = await response.json();
      return created[0];
    }
  } catch (e) { return null; }
};

export const getAllUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_users?select=*&order=last_seen.desc`, { headers });
    return await response.json();
  } catch (e) { return []; }
};

export const updateUserPermissions = async (userId: number, updates: any): Promise<void> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${userId}&select=*`, { headers });
    const users = await res.json();
    const user = users[0];
    if (!user) return;
    const body = { device_info: { ...user.device_info, ...updates } };
    if ('is_admin' in updates) (body as any).is_admin = updates.is_admin;
    if ('is_premium' in updates) (body as any).is_premium = updates.is_premium;
    await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    });
  } catch (e) {}
};
