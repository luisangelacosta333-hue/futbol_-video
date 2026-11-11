/**
 * pool.js
 * Pool de conexiones PostgreSQL (pg) con soporte para esquema aislado talentbridge.
 */
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (pool) return pool;
  const connString = process.env.DATABASE_URL || env.DATABASE_URL;
  if (!connString) {
    throw new Error('DATABASE_URL no configurada. No se puede acceder a la base de datos.');
  }
  pool = new Pool({
    connectionString: connString,
    ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 5,
    idleTimeoutMillis: 30000,
    // Apunta automáticamente al esquema aislado talentbridge sin tocar public
    options: '-c search_path=talentbridge,public',
  });
  pool.on('error', (err) => {
    console.error('[pg] error inesperado en cliente idle:', err.message);
  });
  return pool;
}

/** Ejecuta una query
