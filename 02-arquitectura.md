# Arquitectura propuesta — TalentBridge Football

## Visión general

```
┌─────────────────────────────────────────────────────────────────┐
│  Cliente (PWA: HTML/CSS/JS modular, Android/iOS/escritorio)      │
│  - Supabase Auth (anon key) → obtiene JWT                        │
│  - Nunca toca Postgres directo                                   │
└───────────────┬─────────────────────────────────────────────────┘
                │ HTTPS (JWT Bearer)
┌───────────────▼─────────────────────────────────────────────────┐
│  Backend Express (Node) — /api/v1                                │
│  helmet · cors · rateLimit · pino · validación zod               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ middleware: auth (verifica JWT local con jose) → req.user │  │
│  │             authorize (rol + org + recurso)               │  │
│  └───────────────────────────────────────────────────────────┘  │
│  services: profile · org · audit · videoProvider (interfaz)      │
│  workers:  cola memory → (FASE 2+) Redis/BullMQ                  │
└──────┬──────────────────────┬───────────────────────┬────────────┘
       │ pg (pool)            │ supabase-js           │ HTTP (signed)
       │ service_role         │ (admin Auth/Storage)  │
┌──────▼────────┐    ┌────────▼──────────┐    ┌──────▼──────────────┐
│ PostgreSQL    │    │ Supabase Auth     │    │ Proveedor de video  │
│ (Supabase)    │    │ (registro/login)  │    │ Mux/CF Stream/Bunny │
│ RLS + GRANTs  │    │                   │    │ + CDN propio        │
└───────────────┘    └───────────────────┘    └─────────────────────┘
```

## Decisiones clave

1. **Backend como único punto de entrada a datos.** El cliente usa Supabase solo
   para Auth (JWT). El backend verifica el JWT localmente (HS256, `jose`) y decide
   permisos. RLS en Postgres es defensa en profundidad, no la primera línea.

2. **Identidad separada del perfil deportivo.** `auth.users` (Supabase) →
   `profiles` (datos de identidad extendida, privados) → `player_profiles`
   (ficha deportiva pública, 1:1). Roles en `user_roles` (un usuario puede tener
   varios). Membresías organizacionales en `organization_members`.

3. **Video desacoplado desde el día 1.** `services/videoProvider.js` define una
   interfaz (`issueUploadCredentials`, `getAssetStatus`, `getPlaybackUrl`,
   `verifyWebhookSignature`). FASE 1: `NullVideoProvider`. FASE 3: se implementa
   el proveedor real **leyendo su documentación**; el resto del código no cambia.
   Nunca se almacena video en Postgres ni se proxytea descarga completa.

4. **Migraciones reversibles.** Cada archivo `.sql` tiene bloques `-- UP` y
   `-- DOWN`. `scripts/migrate.js` los aplica en orden y registra en
   `schema_migrations`.

5. **Configuración sin tocar código.** Límites y precios viven en `admin_settings`
   (JSONB) y `plans`; las variables de entorno controlan infraestructura.

6. **Escalabilidad preparada.** Paginación por cursor (se implementa desde FASE 4),
   índices compuestos en filtros de búsqueda, cola de trabajos async, CDN para
   video (proveedor externo), caché de app-shell en service worker.

## Flujo de autenticación (FASE 1, funcionando)

1. Usuario hace signup/login en el cliente vía Supabase Auth (anon key).
2. Cliente recibe JWT y lo envía en `Authorization: Bearer`.
3. Backend verifica firma y expiración localmente (`jose` + `SUPABASE_JWT_SECRET`).
4. Backend carga roles del usuario desde `user_roles` → `req.user.roles`.
5. `requireRole` / `requirePermission` / `requireOrgMember` deciden por recurso.

## Flujo de video futuro (FASE 3, documentado ahora)

1. Cliente pide al backend `POST /api/v1/uploads` (autenticado, con límite por plan).
2. Backend valida cuota, emite credenciales firmadas del proveedor (corta duración).
3. Cliente sube **directo** al proveedor (no pasa por el backend).
4. Proveedor procesa (transcode, thumbnails) y dispara **webhook firmado**.
5. Backend verifica firma del webhook y actualiza `video_assets.status`.
6. Reproducción: backend emite URL de playback firmada; el cliente la usa con el
   player del proveedor (HLS/DASH adaptativo). Nunca se descarga el archivo completo.
