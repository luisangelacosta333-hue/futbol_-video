# Despliegue: GitHub + Vercel

## 1. Variables de entorno a cargar en Vercel (Project Settings → Environment Variables)

Cargarlas para **Production, Preview y Development**. Las marcadas 🔐 son secretas
(no usar en el frontend).

| Variable | Valor | Nota |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `4000` | (no usado en serverless, pero esperado por el código) |
| `LOG_LEVEL` | `info` | |
| `SUPABASE_URL` | `https://drpjcmznauposqlhaveo.supabase.co` | pública |
| `SUPABASE_ANON_KEY` | `sb_publishable_...` | pública |
| `SUPABASE_SERVICE_ROLE_KEY` 🔐 | dashboard Supabase → API → service_role | solo backend |
| `SUPABASE_JWT_SECRET` 🔐 | dashboard Supabase → API → JWT Settings | solo backend |
| `DATABASE_URL` 🔐 | dashboard Supabase → Database → Connection string (URI) | solo backend |
| `DATABASE_SSL` | `true` | |
| `VIDEO_PROVIDER` | `null` | cambiar en FASE 3 |
| `QUEUE_DRIVER` | `memory` | |
| `CORS_ORIGIN` | `https://tu-dominio.vercel.app` | tu URL de Vercel |
| `LIMIT_FREE_VIDEOS_PER_MONTH` | `5` | |
| `LIMIT_VIDEO_MAX_SIZE_MB` | `500` | |
| `LIMIT_VIDEO_MAX_DURATION_SEC` | `600` | |

> El frontend obtiene `SUPABASE_URL` y `SUPABASE_ANON_KEY` del endpoint
> `/api/v1/public-config` — no hace falta hardcodearlas.

## 2. Subir a GitHub (una sola vez)

```bash
cd talentbridge-football
# (ya esta inicializado y commiteado)
# Opcion A: con GitHub CLI
gh repo create talentbridge-football --private --source=. --push

# Opcion B: manual
# Crear el repo vacio en github.com, luego:
git remote add origin https://github.com/TU_USUARIO/talentbridge-football.git
git branch -M main
git push -u origin main
```

## 3. Conectar con Vercel

1. En vercel.com → Add New → Project → importar el repo de GitHub.
2. Framework Preset: **Other** (no es Next.js).
3. Root Directory: `./` (raíz).
4. Build Command: ya está en `vercel.json` (no hace falta tocar).
5. Output Directory: `frontend/public` (ya está en `vercel.json`).
6. Pegar las variables de entorno de la tabla anterior.
7. Deploy.

## 4. Ejecutar las migraciones (una sola vez, después del primer deploy)

Vercel no ejecuta migraciones automáticamente. Opciones:

**Opción A (recomendada): localmente, una sola vez.**
```bash
# En tu maquina, con DATABASE_URL cargada:
vercel env pull .env.local   # baja las variables de Vercel
cp .env.local .env           # o edita .env a mano
npm run migrate
```

**Opción B:** desde Vercel CLI: `vercel dev` y luego `npm run migrate` con las
variables cargadas.

Verificar: en el SQL Editor de Supabase deben aparecer las tablas `profiles`,
`user_roles`, `player_profiles`, `organizations`, etc.

## 5. Verificar el despliegue

```
GET https://tu-dominio.vercel.app/api/v1/health  → {"status":"ok",...}
GET https://tu-dominio.vercel.app/                → landing de TalentBridge
```

## 6. Seguridad post-deploy

- En Supabase → Storage: pasar los buckets `perfiles` y `comprobantes` a **privados**
  y crear políticas de acceso (no dejar públicos documentos de verificación).
- En Supabase → Authentication → Email: decidir confirmación de email.
- Rotar `ADMIN_BOOTSTRAP_EMAIL` después de crear el primer admin.
