# TalentBridge Football

Plataforma internacional de descubrimiento y evaluación de talentos futbolísticos.
Conecta jugadores con scouts, clubes, academias y representantes verificados.

**Estado: FASE 1 implementada y probada.**
Arquitectura, autenticación, permisos, migraciones iniciales, API REST versionada,
frontend responsive + PWA, y batería de tests (19/19 verde).

> Fases 2–10 no se implementan hasta que la FASE 1 esté aprobada. Ver `docs/`.

---

## Requisitos

- Node.js >= 20 (desarrollado y probado en v22)
- Un proyecto **Supabase** (Auth + PostgreSQL + Storage). No se crea uno nuevo:
  reutilizá el existente o crealo en el dashboard y completa `.env`.
- Un proveedor de video (FASE 3): Mux / Cloudflare Stream / Bunny.net. En FASE 1
  la capa está desacoplada (`VIDEO_PROVIDER=null`) y no inventa APIs.

## Instalación rápida

```bash
cp .env.example .env          # completa las variables de Supabase
npm install
npm run migrate               # aplica las migraciones SQL contra Supabase
npm run dev:backend           # API en http://localhost:4000
# En otra terminal:
npm run dev:frontend          # frontend en http://localhost:5173
```

En producción el mismo backend sirve el frontend (`frontend/public/`).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev:backend` | API con hot-reload |
| `npm run dev:frontend` | Frontend estático (serve) |
| `npm start` | Producción |
| `npm run migrate` | Aplica migraciones pendientes |
| `npm run migrate:undo` | Revierte la última migración |
| `npm test` | Batería de tests (node:test + supertest) |

## Estructura

```
talentbridge-football/
├── migrations/            # SQL versionado y reversible (UP/DOWN)
├── scripts/               # migrate.js, seed.js
├── backend/src/
│   ├── config/env.js      # validación de variables de entorno (zod)
│   ├── db/                # pool pg + cliente Supabase admin (service_role)
│   ├── middleware/        # auth (JWT), authorize (roles), validate, rateLimit, errorHandler
│   ├── lib/               # roles/permisos, errores, logger
│   ├── services/          # profile, org, audit, videoProvider (interfaz)
│   ├── workers/           # cola de trabajos (memory, migrable a Redis/BullMQ)
│   ├── controllers/
│   ├── routes/v1/         # API REST versionada
│   ├── app.js             # factory Express (para tests)
│   └── index.js           # entry point
├── backend/tests/         # 19 tests (humo, auth, autorización, validación, migraciones)
├── frontend/public/       # HTML/CSS/JS modular + PWA (manifest, service worker)
└── docs/                  # diagnóstico, arquitectura, OpenAPI
```

## Seguridad (decisiones de FASE 1)

- El frontend **nunca** accede directo a Postgres/Supabase. Todo pasa por el backend.
- `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_JWT_SECRET` solo existen en el backend.
- RLS habilitado en todas las tablas + `REVOKE` por defecto a `anon`/`authenticated`.
- Autorización verificada en backend por rol y por recurso. El frontend no decide permisos.
- Datos privados (fecha de nacimiento, email, teléfono) se filtran en `profileService.sanitizeProfile`.
- Rate limiting por IP (API general, auth más estricto, uploads).
- `audit_logs` registra toda operación sensible.
- Menores: `is_minor`, `guardian_user_id`, `parental_consent` ya modelados; los
  controles reforzados se implementan en FASE 7.

## Próximos pasos (FASE 2)

Perfiles deportivos completos, organizaciones y permisos granulares por organización.
