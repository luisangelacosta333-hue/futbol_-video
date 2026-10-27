/**
 * controllers/profileController.js
 * Perfiles publicos y edicion del propio perfil.
 */
import { z } from 'zod';
import { getProfileById, updateOwnProfile } from '../services/profileService.js';
import { logAudit } from '../services/auditService.js';
import { Forbidden } from '../lib/errors.js';

export const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(80).optional(),
  avatar_url: z.string().url().max(500).optional(),
  country: z.string().max(60).optional(),
  city: z.string().max(80).optional(),
  privacy_settings: z.record(z.unknown()).optional(),
}).strict();

/** GET /api/v1/profiles/:id — perfil publico (o completo si es el dueño/admin). */
export async function getProfile(req, res, next) {
  try {
    const profile = await getProfileById(req.params.id, req.user || null);
    res.json({ profile });
  } catch (err) { next(err); }
}

/** PATCH /api/v1/profiles/me — edita el propio perfil. */
export async function patchMe(req, res, next) {
  try {
    const profile = await updateOwnProfile(req.user.id, req.body);
    await logAudit({ actorUserId: req.user.id, action: 'profile.update', resourceType: 'profile', resourceId: req.user.id, req });
    res.json({ profile });
  } catch (err) { next(err); }
}

/** GET /api/v1/profiles/me — alias del propio perfil. */
export async function getMeProfile(req, res, next) {
  try {
    const profile = await getProfileById(req.user.id, req.user);
    res.json({ profile });
  } catch (err) { next(err); }
}
