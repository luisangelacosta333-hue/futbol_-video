/**
 * middleware/validate.js
 * Valida body/query/params con zod. Devuelve 400 con detalles de campo.
 */
import { BadRequest } from '../lib/errors.js';

export function validate(schema, where = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[where]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        // En modo .strict(), las claves desconocidas vienen en issue.keys con path vacio.
        field: i.path.length ? i.path.join('.') : (i.keys ? i.keys.join(', ') : 'raiz'),
        message: i.message,
      }));
      return next(BadRequest('Datos de entrada invalidos', details));
    }
    req[where] = result.data;
    next();
  };
}
