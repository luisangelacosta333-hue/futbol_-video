/**
 * config/env.js
 * Carga y valida las variables de entorno. Falla rapido si falta algo obligatorio.
 * En modo test (NODE_ENV=test) no exige variables de DB para permitir smoke tests.
 */
import 'dotenv/config';
import { z } from 'zod';

const isTest = process.env.NODE_ENV === 'test';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: isTest ? z.string().optional() : z.string().min(1, 'DATABASE_URL es obligatoria'),
  DATABASE_SSL: z.enum(['true', 'false']).default('true'),

  SUPABASE_URL: isTest ? z.string().url().optional() : z.string().url('SUPABASE_URL invalida'),
  SUPABASE_ANON_KEY: isTest ? z.string().optional() : z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: isTest ? z.string().optional() : z.string().min(1, 'SERVICE_ROLE_KEY obligatoria (solo backend)'),
  SUPABASE_JWT_SECRET: isTest ? z.string().optional() : z.string().min(32, 'JWT_SECRET demasiado corto'),

  VIDEO_PROVIDER: z.enum(['null', 'mux', 'cloudflare_stream', 'bunny']).default('null'),
  QUEUE_DRIVER: z.enum(['memory', 'redis']).default('memory'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  LIMIT_FREE_VIDEOS_PER_MONTH: z.coerce.number().int().positive().default(5),
  LIMIT_VIDEO_MAX_SIZE_MB: z.coerce.number().int().positive().default(500),
  LIMIT_VIDEO_MAX_DURATION_SEC: z.coerce.number().int().positive().default(600),

  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
});

const parsed = schema.safeParse(process.env);

let envValue;
if (!parsed.success) {
  // En test no abortamos: las variables faltantes se mockean con defaults.
  if (!isTest) {
    console.error('[env] Variables de entorno invalidas:');
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  envValue = schema.parse({ NODE_ENV: 'test', ...process.env });
} else {
  envValue = parsed.data;
}

export const env = envValue;
export const corsOrigins = envValue.CORS_ORIGIN.split(',').map((s) => s.trim());
