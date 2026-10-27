/**
 * scripts/seed.js
 * Datos iniciales. Los planes ya los inserta la migracion 0005.
 * Aqui: si ADMIN_BOOTSTRAP_EMAIL esta definido y el usuario existe en Supabase,
 * le otorga el rol admin (una sola vez). Rotar/quitar la variable despues.
 * Uso: npm run seed
 */
import 'dotenv/config';
import { getPool, query } from '../backend/src/db/pool.js';
import { getSupabaseAdmin } from '../backend/src/db/supabase.js';
import { logger } from '../backend/src/lib/logger.js';

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!email) {
    logger.info('ADMIN_BOOTSTRAP_EMAIL no definido. No se crea admin. Los planes ya fueron insertados por la migracion 0005.');
    process.exit(0);
  }
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.auth.admin.listUsers();
  if (error) throw error;
  const user = data.users.find((u) => u.email === email);
  if (!user) throw new Error(`No existe el usuario ${email} en Supabase Auth. Registralo primero.`);

  await query(`INSERT INTO profiles (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [user.id, email]);
  await query(
    `INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')
     ON CONFLICT (user_id, role, organization_id) DO NOTHING`,
    [user.id],
  );
  logger.info(`Rol admin otorgado a ${email} (${user.id}). IMPORTANTE: quitar ADMIN_BOOTSTRAP_EMAIL de .env.`);
}

main().catch((err) => { logger.error(err); process.exit(1); }).finally(() => getPool().end());
