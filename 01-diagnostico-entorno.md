# Diagnóstico del entorno — FASE 1

Inspección realizada el 2026-10-27 sobre el entorno de desarrollo proporcionado.

## 1. Hallazgos

| Componente | Estado |
|---|---|
| Proyecto TalentBridge existente | **No existe**. El workspace contiene proyectos no relacionados (BuggyIA, PediloYa, delivery, etc.). |
| Repositorio git del proyecto | **No existe**. |
| Proyecto Supabase configurado | **No hay credenciales en variables de entorno** ni archivos `.env` del proyecto. Solo un `.env` ajeno en `boliche-control/`. |
| Proveedor de video contratado | **No configurado**. No hay keys de Mux / Cloudflare Stream / Bunny / etc. |
| Node.js | v22.23.2 (cumple >=20) |
| npm | v10.9.8 |
| git | Disponible |
| `psql` / Supabase CLI / Docker | **No instalados**. Las migraciones se aplican via `pg` desde Node (`scripts/migrate.js`), sin necesidad de CLI. |
| Acceso a npm registry | OK (se instaló el stack completo). |
| PostgreSQL local | No disponible; se usa el pool `pg` contra el Supabase remoto. |

## 2. Conclusión

No hay infraestructura existente que reutilizar. Se construye el proyecto desde cero
con una arquitectura que **no depende** de credenciales para arrancar en modo
desarrollo/test:

- Sin `DATABASE_URL`: los endpoints de salud y el frontend funcionan; los endpoints
  que tocan DB devuelven error claro y accionable.
- Sin proveedor de video: `NullVideoProvider` devuelve `503 VIDEO_PROVIDER_NOT_CONFIGURED`
  con mensaje explicativo. No se simula carga ni se inventan endpoints.

## 3. Acciones requeridas del usuario para pasar a staging/producción

1. Crear (o indicar) el proyecto Supabase y completar en `.env`:
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `SUPABASE_JWT_SECRET`, `DATABASE_URL`.
2. Ejecutar `npm run migrate`.
3. Contratar un proveedor de video y setear `VIDEO_PROVIDER` + sus credenciales
   (FASE 3 se implementa la integración leyendo su documentación oficial).
4. Definir la entidad comercial y el país de facturación para elegir proveedor de
   pagos (FASE 8).
