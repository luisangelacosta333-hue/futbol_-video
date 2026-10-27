/**
 * lib/logger.js
 * Logger estructurado (pino). En desarrollo usa pretty output.
 */
import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'talentbridge-api' },
  // En desarrollo: pipear `npm run dev:backend | npx pino-pretty` para logs legibles.
});
