/**
 * tests/validate.test.js
 * Validacion de entradas con zod.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from '../src/middleware/validate.js';
import { updateProfileSchema } from '../src/controllers/profileController.js';
import { createOrgSchema, inviteSchema } from '../src/controllers/orgController.js';

function run(schema, body) {
  const req = { body };
  let err = null, nextCalled = false;
  validate(schema, 'body')(req, {}, (e) => { if (e) err = e; else nextCalled = true; });
  return { err, nextCalled, req };
}

test('updateProfileSchema acepta campos validos y rechaza desconocidos (strict)', () => {
  const { nextCalled } = run(updateProfileSchema, { display_name: 'Lionel M', country: 'Argentina' });
  assert.equal(nextCalled, true);
  const { err } = run(updateProfileSchema, { campo_no_permitido: 1 });
  assert.equal(err?.statusCode, 400);
  assert.ok(Array.isArray(err?.details) && err.details.length > 0, 'debe haber detalles de campo');
});

test('createOrgSchema valida tipo y nombre', () => {
  assert.equal(run(createOrgSchema, { type: 'club', name: 'CA Test' }).nextCalled, true);
  assert.equal(run(createOrgSchema, { type: 'invalido', name: 'X' }).err?.statusCode, 400);
  assert.equal(run(createOrgSchema, { type: 'club', name: '' }).err?.statusCode, 400);
});

test('inviteSchema requiere uuid y rol valido', () => {
  assert.equal(run(inviteSchema, { user_id: '123e4567-e89b-12d3-a456-426614174000', role_in_org: 'scout' }).nextCalled, true);
  assert.equal(run(inviteSchema, { user_id: 'no-es-uuid', role_in_org: 'scout' }).err?.statusCode, 400);
  assert.equal(run(inviteSchema, { user_id: '123e4567-e89b-12d3-a456-426614174000', role_in_org: 'owner' }).err?.statusCode, 400);
});
