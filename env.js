/**
 * env.js
 * Carga y valida las variables de entorno sin tumbar Vercel Serverless.
 */
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('production'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Opcionales para no tumbar el servidor si se usa el cliente de Supabase
  DATABASE_URL: z.string().optional().default(''),
  DATABASE_SSL: z.enum(['true', 'false']).default('true'),

  SUPABASE_URL: z.string().url().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_JWT_SECRET: z.string().optional().default('secret-fallback-minimo-de-32-caracteres-ok'),
  SUPABASE_SCHEMA: z.string().default('talentbridge'),

  VIDEO_PROVIDER: z.enum(['null', 'mux', 'cloudflare_stream', 'bunny']).default('null'),
  QUEUE_DRIVER: z.enum(['memory', 'redis']).default('memory'),
  CORS_ORIGIN: z.string().default('*'),

  LIMIT_FREE_VIDEOS_PER_MONTH: z.coerce.number().int().positive().default(5),
  LIMIT_VIDEO_MAX_SIZE_MB: z.coerce.number().int().positive().default(500),
  LIMIT_VIDEO_MAX_DURATION_SEC: z.coerce.number().int().positive().default(600),

  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
});

const parsed = schema.safeParse(process.env);

let envValue;
if (!parsed.success) {
  console.warn('[env] Advertencia en variables de entorno (usando valores por defecto):');
  for (const issue of parsed.error.issues) {
    console.warn(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  // Nunca llamar a process.exit(1) en Vercel Serverless (causa Error 500)
  envValue = schema.parse({});
} else {
  envValue = parsed.data;
}

export const env = envValue;
export const corsOrigins = envValue.CORS_ORIGIN === '*' 
  ? '*' 
  : envValue.CORS_ORIGIN.split(',').map((s) => s.trim());
