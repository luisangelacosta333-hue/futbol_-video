/**
 * lib/roles.js
 * Constantes de roles y permisos. Fuente unica de verdad para autorizacion.
 * TODO FASE 2+: mover permisos a admin_settings (configurables sin codigo).
 */
export const ROLES = Object.freeze({
  PLAYER: 'player',
  GUARDIAN: 'guardian',
  SCOUT: 'scout',
  CLUB: 'club',
  ACADEMY: 'academy',
  AGENT: 'agent',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
});

export const ORG_ROLES = Object.freeze({
  OWNER: 'owner',
  ADMIN: 'admin',
  SCOUT: 'scout',
  STAFF: 'staff',
});

/** Permisos por rol de plataforma. Se amplía en fases posteriores. */
export const PERMISSIONS = Object.freeze({
  'player:edit_own_profile': [ROLES.PLAYER, ROLES.GUARDIAN, ROLES.ADMIN],
  'player:view_private_data': [ROLES.PLAYER, ROLES.GUARDIAN, ROLES.ADMIN, ROLES.MODERATOR],
  'scout:use_tools': [ROLES.SCOUT, ROLES.CLUB, ROLES.ACADEMY, ROLES.AGENT, ROLES.ADMIN],
  'org:manage_members': [ROLES.ADMIN], // mas permisos granulares por organizacion en authorize.js
  'admin:all': [ROLES.ADMIN],
  'moderator:moderate': [ROLES.MODERATOR, ROLES.ADMIN],
});

export function hasPermission(roleSet, permission) {
  const allowed = PERMISSIONS[permission] || [];
  return allowed.some((r) => roleSet.has(r));
}

/** Normaliza la lista de roles del usuario en un Set. */
export function roleSetOf(user) {
  return new Set((user?.roles || []).map((r) => r.role));
}
