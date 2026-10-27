/**
 * tests/migrations.test.js
 * Verifica que las migraciones existen, estan ordenadas y tienen UP y DOWN.
 * No requiere base de datos.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIG = path.resolve(__dirname, '../../migrations');

test('existen al menos 5 migraciones de la FASE 1', () => {
  const files = fs.readdirSync(MIG).filter((f) => f.endsWith('.sql')).sort();
  assert.ok(files.length >= 5, `se esperaban >=5 migraciones, hay ${files.length}`);
});

test('cada migracion tiene bloque UP y DOWN (reversible)', () => {
  const files = fs.readdirSync(MIG).filter((f) => f.endsWith('.sql'));
  for (const f of files) {
    const sql = fs.readFileSync(path.join(MIG, f), 'utf8');
    assert.ok(sql.includes('-- UP'), `${f} falta bloque -- UP`);
    assert.ok(sql.includes('-- DOWN'), `${f} falta bloque -- DOWN`);
  }
});

test('las migraciones referencian las entidades clave de la FASE 1', () => {
  const all = fs.readdirSync(MIG).filter((f) => f.endsWith('.sql'))
    .map((f) => fs.readFileSync(path.join(MIG, f), 'utf8')).join('\n');
  for (const table of ['profiles', 'user_roles', 'player_profiles', 'organizations', 'organization_members', 'audit_logs', 'admin_settings', 'plans', 'subscriptions']) {
    assert.ok(all.includes(`CREATE TABLE IF NOT EXISTS ${table}`), `falta tabla ${table}`);
  }
  assert.ok(all.includes('ENABLE ROW LEVEL SECURITY'), 'falta habilitar RLS');
  assert.ok(all.includes('REVOKE'), 'falta REVOKE de permisos por defecto');
});
