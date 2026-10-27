/**
 * scripts/migrate.js
 * Ejecuta las migraciones SQL de /migrations en orden numerico contra PostgreSQL.
 * Usa una tabla de control `schema_migrations` para registrar las aplicadas.
 * Uso:
 *   npm run migrate            # aplica las pendientes
 *   npm run migrate -- --undo  # revierte la ultima aplicada (si existe down migration)
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

async function main() {
  const undo = process.argv.includes('--undo');
  if (!process.env.DATABASE_URL) {
    console.error('[migrate] Falta DATABASE_URL en el entorno. Copia .env.example a .env.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version   TEXT PRIMARY KEY,
        name      TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const appliedRows = await client.query('SELECT version FROM schema_migrations');
    const applied = new Set(appliedRows.rows.map((r) => r.version));

    if (undo) {
      const last = [...applied].sort().pop();
      if (!last) {
        console.log('[migrate] No hay migraciones para revertir.');
        await client.query('ROLLBACK');
        return;
      }
      const file = files.find((f) => f.startsWith(last));
      if (!file) throw new Error(`No se encontro el archivo de la migracion ${last}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      const down = extractDown(sql);
      if (!down) throw new Error(`La migracion ${file} no tiene bloque DOWN.`);
      console.log(`[migrate] Revirtiendo ${file} ...`);
      await client.query(down);
      await client.query('DELETE FROM schema_migrations WHERE version = $1', [last]);
      await client.query('COMMIT');
      console.log(`[migrate] Revertida: ${last}`);
      return;
    }

    let count = 0;
    for (const file of files) {
      const version = file.split('_')[0];
      if (applied.has(version)) continue;
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      const up = extractUp(sql);
      console.log(`[migrate] Aplicando ${file} ...`);
      await client.query(up);
      await client.query(
        'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
        [version, file],
      );
      count++;
    }
    await client.query('COMMIT');
    console.log(`[migrate] OK. ${count} migracion(es) aplicada(s). Total: ${applied.size + count}.`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[migrate] ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

/** Extrae el bloque entre -- UP y -- DOWN (o fin de archivo). */
function extractUp(sql) {
  const upMatch = sql.split('-- UP')[1]?.split('-- DOWN')[0];
  if (!upMatch) throw new Error('Migracion sin bloque -- UP.');
  return upMatch;
}

/** Extrae el bloque entre -- DOWN y fin. */
function extractDown(sql) {
  const parts = sql.split('-- DOWN');
  return parts.length > 1 ? parts[1] : null;
}

main();
