/**
 * workers/queue.js
 * Cola de trabajos en memoria para operaciones no bloqueantes (envio de mails,
 * webhooks, procesamiento asincrono). FASE 1: memory. FASE 2+: migrar a
 * Redis/BullMQ sin cambiar la interfaz (add/process).
 *
 * No usar para trabajo que deba sobrevivir a un reinicio en produccion.
 */
import { logger } from '../lib/logger.js';

const queues = new Map();

export function getQueue(name) {
  if (queues.has(name)) return queues.get(name);
  const jobs = [];
  let handler = null;
  let running = false;

  const q = {
    name,
    add(data, opts = {}) {
      const job = { id: Date.now() + Math.random(), data, attempts: opts.attempts || 1, createdAt: new Date() };
      jobs.push(job);
      setImmediate(() => q._drain());
      return job;
    },
    process(fn) { handler = fn; },
    async _drain() {
      if (running || !handler) return;
      running = true;
      while (jobs.length) {
        const job = jobs.shift();
        try {
          await handler(job);
        } catch (err) {
          logger.error({ err, queue: name, jobId: job.id }, '[queue] job fallo');
          if (--job.attempts > 0) jobs.push(job);
        }
      }
      running = false;
    },
    get pending() { return jobs.length; },
  };
  queues.set(name, q);
  return q;
}

// Colas predefinidas (se registran handlers en fases posteriores).
export const emailQueue = getQueue('email');
export const webhookQueue = getQueue('webhook');
export const videoNotificationQueue = getQueue('video_notification');
