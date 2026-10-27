/**
 * db/pool.js
 * Pool de conexiones PostgreSQL (pg). Conexion lazy: no falla al importar.
 * En test sin DATABASE_URL se exporta un pool nulo que lanza error claro al usarse.
 */
import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (pool) return pool;
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL no configurada. No se puede acceder a la base de datos.');
  }
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  pool.on('error', (err) => {
    console.error('[pg] error inesperado en cliente idle:', err.message);
  });
  return pool;
}

/** Ejecuta una query y devuelve rows. Helper minimalista. */
export async function query(text, params = []) {
  const res = await getPool().query(text, params);
  return res.rows;
}

export async function closePool() {
  if (pool) await pool.end();
  pool = null;
}
