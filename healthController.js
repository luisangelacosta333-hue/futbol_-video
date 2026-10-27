/**
 * controllers/healthController.js
 * Endpoints de salud. No tocan la DB (para que el smoke test pase sin infra).
 */
import { env } from '../config/env.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8'));
const version = pkg.version;

export function getHealth(req, res) {
  res.json({ status: 'ok', service: 'talentbridge-api', version, env: env.NODE_ENV, timestamp: new Date().toISOString() });
}

export function getStatus(req, res) {
  res.json({
    status: 'ok',
    version,
    uptimeSec: Math.round(process.uptime()),
    videoProvider: env.VIDEO_PROVIDER,
    queueDriver: env.QUEUE_DRIVER,
    limits: {
      freeVideosPerMonth: env.LIMIT_FREE_VIDEOS_PER_MONTH,
      videoMaxSizeMb: env.LIMIT_VIDEO_MAX_SIZE_MB,
      videoMaxDurationSec: env.LIMIT_VIDEO_MAX_DURATION_SEC,
    },
  });
}
