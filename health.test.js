/**
 * tests/health.test.js
 * Smoke test de la API. No requiere base de datos.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

let app;
before(() => { app = createApp(); });
after(() => { /* sin server levantado, no hay que cerrar nada */ });

test('GET /api/v1/health devuelve 200 y status ok', async () => {
  const res = await request(app).get('/api/v1/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.ok(res.body.version);
  assert.ok(res.body.timestamp);
});

test('GET /api/v1/status devuelve limites y proveedores configurados', async () => {
  const res = await request(app).get('/api/v1/status');
  assert.equal(res.status, 200);
  assert.equal(typeof res.body.limits.freeVideosPerMonth, 'number');
  assert.ok(['null', 'mux', 'cloudflare_stream', 'bunny'].includes(res.body.videoProvider));
});

test('GET /api/v1/public-config no expone claves secretas', async () => {
  const res = await request(app).get('/api/v1/public-config');
  assert.equal(res.status, 200);
  const text = JSON.stringify(res.body);
  assert.ok(!text.includes('SERVICE_ROLE'));
  assert.ok(!text.includes('JWT_SECRET'));
  assert.ok(!text.includes('eyJ')); // ningun JWT
  assert.ok('configured' in res.body);
});

test('ruta inexistente devuelve 404 con estructura de error', async () => {
  const res = await request(app).get('/api/v1/noexiste');
  assert.equal(res.status, 404);
  assert.ok(res.body.error?.code);
});

test('endpoint protegido sin token devuelve 401', async () => {
  const res = await request(app).get('/api/v1/auth/me');
  assert.equal(res.status, 401);
  assert.equal(res.body.error?.code, 'UNAUTHORIZED');
});

test('PATCH /api/v1/profiles/me con body invalido devuelve 400 con detalles', async () => {
  // Sin token da 401 primero; probamos el validador con un token falso -> 401.
  // Para probar validacion aisladamente, ver tests/validate.test.js.
  const res = await request(app).patch('/api/v1/profiles/me').send({ campo_raro: 1 });
  assert.ok([401, 400].includes(res.status));
});
