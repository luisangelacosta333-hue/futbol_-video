/**
 * controllers/orgController.js
 * Organizaciones (club/academia/agente) y membresias.
 */
import { z } from 'zod';
import { createOrganization, getOrganization, listMembers, inviteMember } from '../services/orgService.js';
import { logAudit } from '../services/auditService.js';
import { ORG_ROLES } from '../lib/roles.js';

export const createOrgSchema = z.object({
  type: z.enum(['club', 'academy', 'agent', 'federation', 'other']),
  name: z.string().min(2).max(120),
  country: z.string().max(60).optional(),
  city: z.string().max(80).optional(),
  website: z.string().url().max(300).optional(),
  description: z.string().max(2000).optional(),
}).strict();

export const inviteSchema = z.object({
  user_id: z.string().uuid(),
  role_in_org: z.enum([ORG_ROLES.ADMIN, ORG_ROLES.SCOUT, ORG_ROLES.STAFF]),
}).strict();

export async function postOrganization(req, res, next) {
  try {
    const org = await createOrganization(req.user.id, req.body);
    await logAudit({ actorUserId: req.user.id, action: 'org.create', resourceType: 'organization', resourceId: org.id, req, metadata: { type: org.type } });
    res.status(201).json({ organization: org });
  } catch (err) { next(err); }
}

export async function getOrganizationById(req, res, next) {
  try {
    const org = await getOrganization(req.params.orgId);
    res.json({ organization: org });
  } catch (err) { next(err); }
}

export async function getOrgMembers(req, res, next) {
  try {
    const members = await listMembers(req.params.orgId);
    res.json({ members });
  } catch (err) { next(err); }
}

export async function postInviteMember(req, res, next) {
  try {
    const result = await inviteMember(req.params.orgId, req.user.id, req.body.user_id, req.body.role_in_org);
    await logAudit({ actorUserId: req.user.id, action: 'org.invite_member', resourceType: 'organization', resourceId: req.params.orgId, req, metadata: { target: req.body.user_id, role: req.body.role_in_org } });
    res.status(201).json(result);
  } catch (err) { next(err); }
}
