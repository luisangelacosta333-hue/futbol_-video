/**
 * services/videoProvider.js
 * Capa de abstraccion del proveedor de video. FASE 1: solo la interfaz y un
 * proveedor nulo que NO inventa endpoints. La integracion real viene en FASE 3
 * una vez identificado el proveedor contratado y leida su documentacion.
 *
 * Cualquier implementacion real debe extender VideoProvider y respetar estos
 * metodos. El backend NUNCA expone claves privadas al navegador: emite URLs
 * firmadas de corta duracion.
 */
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';

export class VideoProvider {
  /** Emite credenciales de carga directa desde el navegador (signed URL o equivalente). */
  async issueUploadCredentials(_ownerId, _metadata) { throw new Error('no implementado'); }
  /** Consulta estado de procesamiento (pendiente/procesando/disponible/error). */
  async getAssetStatus(_externalId) { throw new Error('no implementado'); }
  /** Genera URL de reproduccion autorizada y de corta duracion. */
  async getPlaybackUrl(_externalId, _opts) { throw new Error('no implementado'); }
  /** Valida la firma de un webhook entrante del proveedor. */
  verifyWebhookSignature(_rawBody, _signatureHeader) { throw new Error('no implementado'); }
}

/** Proveedor nulo: usado cuando VIDEO_PROVIDER=null. No simula carga real. */
class NullVideoProvider extends VideoProvider {
  async issueUploadCredentials() {
    throw new AppError(503, 'VIDEO_PROVIDER_NOT_CONFIGURED',
      'Proveedor de video no configurado. Complete VIDEO_PROVIDER en .env (FASE 3).');
  }
  async getAssetStatus() { throw new AppError(503, 'VIDEO_PROVIDER_NOT_CONFIGURED', 'Proveedor de video no configurado.'); }
  async getPlaybackUrl() { throw new AppError(503, 'VIDEO_PROVIDER_NOT_CONFIGURED', 'Proveedor de video no configurado.'); }
  verifyWebhookSignature() { return false; }
}

let instance = null;
export function getVideoProvider() {
  if (instance) return instance;
  // FASE 3: switch (env.VIDEO_PROVIDER) { case 'mux': instance = new MuxProvider(); ... }
  instance = new NullVideoProvider();
  return instance;
}
