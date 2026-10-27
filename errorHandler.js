/**
 * middleware/errorHandler.js
 * Centraliza errores. Nunca filtra detalles internos al cliente en produccion.
 */
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  if (status >= 500) {
    logger.error({ err, url: req.url, method: req.method }, 'error no manejado');
  } else {
    logger.warn({ code: err.code, url: req.url }, err.message);
  }
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: status >= 500 && env.NODE_ENV === 'production' ? 'Error interno' : err.message,
      details: err.details,
    },
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Ruta no encontrada: ${req.method} ${req.url}` } });
}
