/**
 * lib/errors.js
 * Errores tipados de la aplicacion. El errorHandler los convierte a HTTP.
 */
export class AppError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const BadRequest = (msg, details) => new AppError(400, 'BAD_REQUEST', msg, details);
export const Unauthorized = (msg = 'No autenticado') => new AppError(401, 'UNAUTHORIZED', msg);
export const Forbidden = (msg = 'Sin permiso para este recurso') => new AppError(403, 'FORBIDDEN', msg);
export const NotFound = (msg = 'Recurso no encontrado') => new AppError(404, 'NOT_FOUND', msg);
export const Conflict = (msg) => new AppError(409, 'CONFLICT', msg);
export const TooManyRequests = (msg = 'Demasiadas solicitudes') => new AppError(429, 'RATE_LIMITED', msg);
