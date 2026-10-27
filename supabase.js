/**
 * db/supabase.js
 * Cliente Supabase con service_role (admin). SOLO backend.
 * Usado para Auth admin (gestion de usuarios) y Storage.
 * Nunca enviar este cliente ni su key al frontend.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let adminClient = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase no configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }
  adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}
