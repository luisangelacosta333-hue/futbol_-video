/**
 * middleware/rateLimit.js
 * Limites de solicitudes por IP. Configurables via admin_settings en fases posteriores.
 */
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes, intente mas tarde.' } },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // login/registro: mas estricto contra fuerza bruta
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Demasiados intentos de autenticacion.' } },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20, // uploads por hora
  standardHeaders: true,
  legacyHeaders: false,
});
