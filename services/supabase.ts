
import { SUPABASE_URL, SUPABASE_KEY } from '../constants';

/**
 * Simple client for Supabase REST API to manage global app settings
 */
export const getFeatureFlag = async (key: string): Promise<boolean> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.${key}&select=value`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!response.ok) return true;
    const data = await response.json();
    // Use the specific key value from the response
    return data[0]?.value ?? true;
  } catch (e) {
    console.error("Failed to fetch feature flag", e);
    return true;
  }
};

export const updateFeatureFlag = async (key: string, value: boolean): Promise<void> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/app_settings?key=eq.${key}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ value })
    });
    if (!response.ok) throw new Error("Update failed");
  } catch (e) {
    console.error("Failed to update flag", e);
  }
};
