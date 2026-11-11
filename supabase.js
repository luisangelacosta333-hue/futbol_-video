/**
 * supabase.js
 * Cliente Supabase con service_role (admin) apuntando al esquema aislado talentbridge.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let adminClient = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.SUPABASE_URL || env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase no configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }

  adminClient = createClient(url, key, {
    db: { schema: 'talentbridge' },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return adminClient;
}
