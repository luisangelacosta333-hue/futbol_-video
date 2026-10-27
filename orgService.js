/**
 * services/orgService.js
 * Organizaciones y membresias. El creador se convierte en owner automaticamente.
 */
import { query } from '../db/pool.js';
import { NotFound, Forbidden, Conflict } from '../lib/errors.js';

export async function createOrganization(userId, data) {
  const rows = await query(
    `INSERT INTO organizations (type, name, country, city, website, description)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.type, data.name, data.country || null, data.city || null, data.website || null, data.description || null],
  );
  const org = rows[0];
  // Creador = owner activo.
  await query(
    `INSERT INTO organization_members (organization_id, user_id, role_in_org, status, invited_by, joined_at)
     VALUES ($1, $2, 'owner', 'active', $2, now())`,
    [org.id, userId],
  );
  return org;
}

export async function getOrganization(orgId) {
  const rows = await query(`SELECT * FROM organizations WHERE id = $1`, [orgId]);
  if (!rows.length) throw NotFound('Organizacion no encontrada');
  return rows[0];
}

export async function listMembers(orgId) {
  return query(
    `SELECT om.user_id, om.role_in_org, om.status, om.joined_at, p.display_name, p.avatar_url
     FROM organization_members om
     LEFT JOIN profiles p ON p.id = om.user_id
     WHERE om.organization_id = $1
     ORDER BY om.created_at`,
    [orgId],
  );
}

export async function inviteMember(orgId, inviterUserId, targetUserId, roleInOrg) {
  const existing = await query(
    `SELECT status FROM organization_members WHERE organization_id = $1 AND user_id = $2`,
    [orgId, targetUserId],
  );
  if (existing.length && existing[0].status !== 'removed') throw Conflict('El usuario ya es miembro o tiene una invitacion pendiente');
  await query(
    `INSERT INTO organization_members (organization_id, user_id, role_in_org, status, invited_by)
     VALUES ($1, $2, $3, 'invited', $4)
     ON CONFLICT (organization_id, user_id)
     DO UPDATE SET status = 'invited', role_in_org = EXCLUDED.role_in_org, invited_by = EXCLUDED.invited_by`,
    [orgId, targetUserId, roleInOrg, inviterUserId],
  );
  return { ok: true, status: 'invited' };
}
