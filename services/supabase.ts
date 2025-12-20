
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

/**
 * مزامنة مستخدم التليجرام مع قاعدة البيانات
 * يتم التعامل مع المالك برقم تليجرام 1541678512 كأدمن مطلق
 */
export const syncTelegramUser = async (user: any): Promise<any> => {
  if (!user?.id) return null;
  try {
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${user.id}&select=*`, { headers });
    const existingUsers = await checkRes.json();
    const existingUser = existingUsers[0];

    const isMaster = Number(user.id) === MASTER_ADMIN_ID;
    
    // البيانات الأساسية المتوافقة مع هيكل جدول المستخدم
    const userData = {
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
      // نرجع الـ is_admin الحقيقي من الداتا أو نعتمد على الـ ID للمالك
      return { ...existingUser, ...userData, is_admin: existingUser.is_premium || isMaster };
    } else {
      const createRes = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ 
          ...userData, 
          created_at: new Date().toISOString(),
          is_premium: isMaster // نستخدم is_premium كعلامة للأدمن للمالك في حال غياب حقل is_admin
        })
      });
      const created = await createRes.json();
      const newUser = created[0];
      return { ...newUser, is_admin: isMaster };
    }
  } catch (e) {
    console.error("User sync error:", e);
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

export const toggleUserAdminStatus = async (userId: number, status: boolean): Promise<void> => {
  if (userId === MASTER_ADMIN_ID) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/app_users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ is_premium: status }) // نستخدم is_premium كبديل مؤقت للأدمن
    });
  } catch (e) {}
};
