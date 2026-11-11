/**
 * index.js
 * Handler para Vercel Functions (serverless) en la raíz del proyecto.
 */
import { createApp } from './app.js';

const app = createApp();
export default app;
