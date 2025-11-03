import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);

export const supabase =
  hasSupabaseConfig
    ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;

if (supabase) {
  console.log('[Supabase] Client initialized for', config.supabaseUrl);
} else {
  console.warn('[Supabase] Service role key or URL not provided. Falling back to file/in-memory store.');
}
