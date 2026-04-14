
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY, MAIN_TABLE, BOT_USERNAME } from '../constants.ts';
import { Drug } from '../types.ts';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const logSession = async (userId: string, duration: number, deviceType: string) => {
  const { error } = await supabase.from('user_sessions').insert({
    user_id: userId,
    duration_seconds: duration,
    device_type: deviceType,
    created_at: new Date().toISOString()
  });
  return !error;
};

export const reportUser = async (targetUserId: string, reportedBy: string, reason: string) => {
  const { error } = await supabase.from('moderation_logs').insert({
    user_id: targetUserId,
    reported_by: reportedBy,
    reason,
    action_taken: 'report'
  });
  return !error;
};

export const banUser = async (targetUserId: string, adminId: string, reason: string) => {
  const { error } = await supabase.from('moderation_logs').insert({
    user_id: targetUserId,
    reported_by: adminId,
    reason,
    action_taken: 'ban'
  });
  return !error;
};

export const logActivity = async (userId: string, type: string, points: number = 0, targetId?: string) => {
  const { error } = await supabase.from('user_activities').insert({
    user_id: userId,
    activity_type: type,
    points_earned: points,
    target_id: targetId
  });
  return !error;
};

export const searchDrugs = async (query: string): Promise<Drug[]> => {
  try {
    const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return [];

    let queryBuilder = supabase.from(MAIN_TABLE).select('*');
    
    terms.forEach(t => {
      const normalizedTerm = t
        .replace(/[أإآا]/g, '_')
        .replace(/[ىي]/g, '_')
        .replace(/[ةه]/g, '_');
      
      queryBuilder = queryBuilder.or(`name_en.ilike.%${normalizedTerm}%,name_ar.ilike.%${normalizedTerm}%`);
    });

    const { data, error } = await queryBuilder.limit(20);
    if (error) throw error;
    return data || [];
  } catch (e) { return []; }
};

export const lookupByBarcode = async (barcode: string): Promise<Drug | null> => {
  const { data, error } = await supabase
    .from(MAIN_TABLE)
    .select('*')
    .eq('drug_no', barcode)
    .single();
  
  if (error) return null;
  return data;
};

export const saveInvoice = async (invoiceData: any): Promise<string | null> => {
  const id = `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const { data, error } = await supabase
    .from('app_invoices')
    .insert({
      id,
      content: invoiceData,
      created_at: new Date().toISOString()
    })
    .select();
    
  if (error) return null;
  return data ? data[0]?.id : id;
};

export const createSecureShareLink = async (invoiceId: string): Promise<string | null> => {
  const token = Math.random().toString(36).substring(2, 20);
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

  const { error } = await supabase
    .from('invoice_shares')
    .insert({
      invoice_id: invoiceId,
      token: token,
      expires_at: expiresAt,
      is_used: false
    });

  if (error) return null;
  return `https://t.me/${BOT_USERNAME}?start=inv_${invoiceId}_${token}`;
};

export const validateShareToken = async (invoiceId: string, token: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('invoice_shares')
    .select('*')
    .eq('invoice_id', invoiceId)
    .eq('token', token);
    
  if (error || !data || data.length === 0) return false;
  
  const share = data[0];
  return new Date(share.expires_at) > new Date();
};

export const getInvoice = async (id: string): Promise<any | null> => {
  const { data, error } = await supabase
    .from('app_invoices')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return null;
  return data;
};

export const getGlobalConfig = async (): Promise<any> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'global_config');
    
  if (error || !data || data.length === 0) return null;
  return data[0].value;
};

export const updateGlobalConfig = async (config: any): Promise<void> => {
  await supabase
    .from('app_settings')
    .update({ value: config })
    .eq('key', 'global_config');
};

export const syncTelegramUser = async (user: any): Promise<any> => {
  if (!user?.id) return null;
  
  const { data: existingUser } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', user.id)
    .single();

  const userData = {
    id: user.id,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    username: user.username || "",
    last_seen: new Date().toISOString()
  };

  if (existingUser) {
    await supabase.from('app_users').update(userData).eq('id', user.id);
    return { ...existingUser, ...userData };
  } else {
    const { data, error } = await supabase.from('app_users').insert({ ...userData, device_info: { items_limit: 100 } }).select();
    return error ? null : data[0];
  }
};

export const getAllUsers = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('last_seen', { ascending: false });
    
  return error ? [] : data;
};

export const updateUserPermissions = async (userId: number, updates: any): Promise<void> => {
  const { data: user } = await supabase.from('app_users').select('*').eq('id', userId).single();
  if (!user) return;
  
  const body = { device_info: { ...user.device_info, ...updates } };
  if ('is_admin' in updates) (body as any).is_admin = updates.is_admin;
  if ('is_premium' in updates) (body as any).is_premium = updates.is_premium;
  
  await supabase.from('app_users').update(body).eq('id', userId);
};

export const getDrugsByIds = async (ids: number[]): Promise<Drug[]> => {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from(MAIN_TABLE).select('*').in('id', ids);
  return error ? [] : data;
};

export const searchDrugsSupabase = async (query: string): Promise<any[]> => {
  try {
    const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
    if (terms.length === 0) return [];

    let queryBuilder = supabase.from(MAIN_TABLE).select('*');
    
    terms.forEach(t => {
      const normalizedTerm = t
        .replace(/[أإآا]/g, '_')
        .replace(/[ىي]/g, '_')
        .replace(/[ةه]/g, '_');
      
      queryBuilder = queryBuilder.or(`name_en.ilike.%${normalizedTerm}%,name_ar.ilike.%${normalizedTerm}%`);
    });

    const { data, error } = await queryBuilder.limit(10);
    return error ? [] : data;
  } catch (e) { return []; }
};

export const getStock = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('pharmacy_stock')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error fetching stock:", error);
    return [];
  }
  return data || [];
};

export const deleteStockItem = async (id: number, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pharmacy_stock')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return !error;
};

export const addStockItem = async (item: any, userId: string): Promise<any> => {
  const { data, error } = await supabase
    .from('pharmacy_stock')
    .insert({ ...item, user_id: userId })
    .select();
  return error ? null : (Array.isArray(data) ? data[0] : data);
};

export const getPosts = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .not('content', 'ilike', '__COMMENT__%')
    .not('content', 'ilike', '__LIKE__%')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data || [];
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const addPost = async (post: any, userId: string): Promise<any> => {
  const id = generateUUID();
  const created_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('posts')
    .insert({ 
      id,
      ...post, 
      user_id: userId,
      created_at
    })
    .select();
  
  if (error) {
    console.error("Error adding post:", error);
    return null;
  }
  return data ? (Array.isArray(data) ? data[0] : data) : { id, ...post, user_id: userId, created_at };
};

export const deletePost = async (id: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return !error;
};

export const deleteComment = async (id: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  return !error;
};

export const addComment = async (postId: string, content: string, userId: string, parentId?: string): Promise<any> => {
  const id = generateUUID();
  const created_at = new Date().toISOString();
  // Format: __COMMENT__postId__parentId__reactionsJson__content
  const reactions = JSON.stringify({});
  const prefixedContent = `__COMMENT__${postId}__${parentId || 'root'}__${reactions}__${content}`;
  
  const { error } = await supabase
    .from('posts')
    .insert({
      id,
      user_id: userId,
      content: prefixedContent,
      created_at
    });
  
  if (error) {
    console.error("Error adding comment to posts table:", error);
    return null;
  }
  
  return { 
    id, 
    post_id: postId, 
    parent_id: parentId,
    user_id: userId, 
    content: content, 
    reactions: {},
    created_at 
  };
};

export const getComments = async (postId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .ilike('content', `__COMMENT__${postId}__%`)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error("Error fetching comments from posts table:", error);
    return [];
  }
  
  return (data || []).map(item => {
    const prefix = `__COMMENT__${postId}__`;
    const contentWithParentAndReactions = item.content.replace(prefix, '');
    
    // Split: parentId__reactionsJson__content
    const parts = contentWithParentAndReactions.split('__');
    let parentId = parts[0];
    let reactions = {};
    let content = "";

    try {
      // Try parsing assuming new format: parentId__reactionsJson__content
      if (parts.length >= 3) {
        reactions = JSON.parse(parts[1]);
        content = parts.slice(2).join('__');
      } else {
        // Fallback for old format: parentId__content
        content = parts.slice(1).join('__');
      }
    } catch (e) {
      // If JSON.parse fails, assume it's an old format or invalid data
      reactions = {};
      content = parts.slice(1).join('__');
    }
    
    return {
      id: item.id,
      post_id: postId,
      parent_id: parentId === 'root' ? undefined : parentId,
      user_id: item.user_id,
      content: content,
      reactions: reactions,
      created_at: item.created_at
    };
  });
};

export const updateCommentReactions = async (commentId: string, reactions: Record<string, number>): Promise<boolean> => {
  // Fetch current post to get full content
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('content')
    .eq('id', commentId)
    .single();

  if (fetchError || !post) return false;

  const contentParts = post.content.split('__');
  // Reconstruct with new reactions
  contentParts[3] = JSON.stringify(reactions);
  const newContent = contentParts.join('__');

  const { error } = await supabase
    .from('posts')
    .update({ content: newContent })
    .eq('id', commentId);
    
  return !error;
};

export const addLike = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const id = generateUUID();
    const created_at = new Date().toISOString();
    const { error } = await supabase
      .from('posts')
      .insert({ 
        id,
        post_id: postId, // Keeping this for schema compatibility if it exists, but primary is content
        user_id: userId,
        content: `__LIKE__${postId}`,
        created_at
      });
    
    if (error) {
      console.error("addLike error details:", JSON.stringify(error));
      return false;
    }
    return true;
  } catch (e) {
    console.error("addLike exception:", e);
    return false;
  }
};

export const removeLike = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId)
      .eq('content', `__LIKE__${postId}`);
    
    if (error) {
      console.error("removeLike error details:", JSON.stringify(error));
      return false;
    }
    return true;
  } catch (e) {
    console.error("removeLike exception:", e);
    return false;
  }
};

export const getLikesCount = async (postId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('content', `__LIKE__${postId}`);
  return error ? 0 : count || 0;
};

export const getCommentsCount = async (postId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .ilike('content', `__COMMENT__${postId}__%`);
  return error ? 0 : count || 0;
};

export const getIsLiked = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId)
      .eq('content', `__LIKE__${postId}`)
      .maybeSingle();
    return !!data && !error;
  } catch (e) {
    return false;
  }
};
