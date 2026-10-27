/**
 * services/profileService.js
 * Logica de perfiles. Filtra campos privados segun quien consulta.
 * Regla: datos personales (birth_date, email, phone) solo salen para el
 * propio usuario, su tutor o admin/moderador.
 */
import { query } from '../db/pool.js';
import { NotFound, Forbidden } from '../lib/errors.js';
import { ROLES } from '../lib/roles.js';

const PUBLIC_FIELDS = [
  'id', 'display_name', 'avatar_url', 'country', 'city', 'verified_at',
  'created_at', 'updated_at',
];
const PRIVATE_FIELDS = ['birth_date', 'email', 'phone', 'is_minor', 'guardian_user_id', 'parental_consent'];

export function sanitizeProfile(row, viewer) {
  if (!row) return null;
  const isOwner = viewer && String(viewer.id) === String(row.id);
  const isAdmin = viewer?.roles?.some((r) => r.role === ROLES.ADMIN || r.role === ROLES.MODERATOR);
  const isGuardian = viewer && row.guardian_user_id && String(viewer.id) === String(row.guardian_user_id);
  const out = {};
  for (const f of PUBLIC_FIELDS) out[f] = row[f];
  if (isOwner || isAdmin || isGuardian) {
    for (const f of PRIVATE_FIELDS) out[f] = row[f];
    out.privacy_settings = row.privacy_settings;
  }
  return out;
}

export async function getProfileById(id, viewer) {
  const rows = await query(`SELECT * FROM profiles WHERE id = $1`, [id]);
  if (!rows.length) throw NotFound('Perfil no encontrado');
  return sanitizeProfile(rows[0], viewer);
}

/** Actualiza solo campos permitidos. Nunca permite cambiar is_minor ni roles desde aqui. */
const UPDATABLE_FIELDS = ['display_name', 'avatar_url', 'country', 'city', 'privacy_settings'];
export async function updateOwnProfile(userId, patch) {
  const sets = [];
  const values = [];
  let i = 1;
  for (const key of UPDATABLE_FIELDS) {
    if (patch[key] !== undefined) {
      sets.push(`${key} = $${i++}`);
      values.push(typeof patch[key] === 'object' ? JSON.stringify(patch[key]) : patch[key]);
    }
  }
  if (!sets.length) return getProfileById(userId, { id: userId, roles: [] });
  values.push(userId);
  const rows = await query(
    `UPDATE profiles SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values,
  );
  if (!rows.length) throw NotFound('Perfil no encontrado');
  return sanitizeProfile(rows[0], { id: userId, roles: [] });
}

/** Crea el perfil extendido tras el registro en Supabase Auth (webhook o llamada server-side). */
export async function ensureProfile(userId, { display_name, email } = {}) {
  const existing = await query(`SELECT id FROM profiles WHERE id = $1`, [userId]);
  if (existing.length) return existing[0];
  await query(
    `INSERT INTO profiles (id, display_name, email) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO NOTHING`,
    [userId, display_name || null, email || null],
  );
  return { id: userId };
}
