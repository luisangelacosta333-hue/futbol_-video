/**
 * api/index.js
 * Handler para Vercel Functions (serverless). Reutiliza la misma app Express.
 * En Vercel, toda ruta /api/* se reescribe aqui (ver vercel.json -> rewrites).
 * NO llamar a listen() — Vercel inyecta req/res.
 */
import { createApp } from '../backend/src/app.js';

const app = createApp();
export default app;
