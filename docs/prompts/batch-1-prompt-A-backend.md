# Batch 1 — Prompt A: Phase 1 (Backend Foundation)

Kamu masuk ke repo `/home/ubuntu/ludes`, branch `master`.

## Konteks

Ludes adalah surplus food marketplace untuk UMKM Indonesia. Monorepo (pnpm workspaces + Turborepo) dengan frontend React dan backend Hono. Dependencies sudah ter-install (`pnpm install` sudah jalan).

Kamu hanya mengerjakan **backend** di `apps/api/`. Jangan sentuh `apps/web/` sama sekali — ada session lain yang mengerjakan frontend secara paralel.

Baca file-file ini sebelum mulai (WAJIB):
- `/home/ubuntu/ludes/AGENTS.md` — coding style, conventions, architecture
- `/home/ubuntu/ludes/docs/IMPLEMENTATION-PLAN.md` — lihat Phase 1 untuk detail task
- `/home/ubuntu/ludes/docs/skills/auth-flow.md` — auth flow detail
- `/home/ubuntu/ludes/docs/PROJECT-OVERVIEW.md` — full product context

Shared types dan schemas sudah tersedia di `packages/shared/src/` — import dari `@ludes/shared`.

## Task

Implementasi **Phase 1: Backend Foundation** — Hono app dengan Supabase integration dan auth routes.

## Detail Tasks

### 1. Hono App Setup

Buat file-file berikut:

**`apps/api/tsconfig.json`:**
- Extend root `../../tsconfig.json`
- `outDir: ./dist`, `rootDir: ./src`
- Path alias: `@/*` → `./src/*`

**`apps/api/src/index.ts`:**
- Hono app entry point
- Listen on `PORT` env var (default 3001)
- Mount middleware: CORS, request ID, logger, error handler
- Mount routes: `/api/auth/*`, `/api/merchants/*`, `/api/food/*`, `/api/ai/*`
- Health check: `GET /api/health` → `{ status: "ok", timestamp }`

**`apps/api/.env`:**
```
SUPABASE_URL=https://sduynedhiwwsqkfsydyx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdXluZWRoaXd3c3FrZnN5ZHl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY0NjY2MywiZXhwIjoyMTAwMjIyNjYzfQ.gQNyuHvxaSiOWDwlCyoCnQC_pqfNTizVpUzqzMz9s-g
SUPABASE_ANON_KEY=sb_publishable_OMTKaRI3a7tv-W8bOSgxcA_EXiwkvin
LLM_API_BASE_URL=http://127.0.0.1:20128/v1
LLM_API_KEY=sk-ecbf6cc546f7068c-35xjdj-e2e17dee
LLM_MODEL=cheapest
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 2. Middleware

**`apps/api/src/middleware/request-id.ts`:**
- Generate unique request ID (crypto.randomUUID)
- Set `X-Request-Id` response header
- Attach to context: `c.set('requestId', id)`

**`apps/api/src/middleware/logger.ts`:**
- Log every request: method, path, status, duration_ms, request_id
- Structured JSON format (sesuai AGENTS.md LogEntry type)
- Log level: info for 2xx/3xx, warn for 4xx, error for 5xx

**`apps/api/src/middleware/error-handler.ts`:**
- Global error catch
- Log full error + stack trace + request context
- Return generic JSON error to client: `{ error: "Internal server error", request_id }`
- Never expose stack trace to client

### 3. Supabase Client

**`apps/api/src/lib/supabase.ts`:**
- Create Supabase client using `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Export as singleton `supabase`
- Export helper: `createSupabaseClientForUser(accessToken: string)` — creates client scoped to specific user (for RLS)

### 4. Auth Routes

**`apps/api/src/routes/auth.routes.ts`:**

`POST /api/auth/register`:
- Input: `{ name, email, password, role, phone? }` — validate with `registerSchema` from `@ludes/shared`
- Call `supabase.auth.admin.createUser({ email, password, email_confirm: true })`
- Insert into `public.users` table: `{ id: authUser.id, name, email, role, phone }`
- Sign in with `supabase.auth.signInWithPassword` to get session
- Return: `{ user, token: session.access_token }`
- Error: email sudah terdaftar → 409

`POST /api/auth/login`:
- Input: `{ email, password }` — validate with `loginSchema` from `@ludes/shared`
- Call `supabase.auth.signInWithPassword({ email, password })`
- Fetch user from `public.users` by id
- Return: `{ user, token: session.access_token }`

`POST /api/auth/logout`:
- Requires auth middleware
- Placeholder (client-side token removal handles most of it)
- Return: `{ message: "Logged out" }`

`GET /api/auth/me`:
- Requires auth middleware
- Get user from context
- If user is merchant, also fetch merchant profile from `merchants` table
- Return: `{ user, merchant_profile: ... | null }`

### 5. Auth Middleware

**`apps/api/src/middleware/auth.ts`:**
- Extract `Authorization: Bearer <token>` from header
- Use `supabase.auth.getUser(token)` to verify
- If invalid → 401 `{ error: "Unauthorized" }`
- Fetch full user from `public.users` table by auth user id
- Set `c.set('user', userRow)` on context
- Export `authMiddleware` for use on protected routes

### 6. Merchant Routes (stub)

**`apps/api/src/routes/merchant.routes.ts`:**
- Stub routes yang akan diisi nanti di Phase 5:
- `GET /api/merchants/me` → placeholder 501
- `POST /api/merchants` → placeholder 501
- `PUT /api/merchants/me` → placeholder 501

### 7. Food Routes (stub)

**`apps/api/src/routes/food.routes.ts`:**
- Stub routes:
- `GET /api/food` → placeholder 501
- `GET /api/food/:id` → placeholder 501
- `POST /api/food` → placeholder 501
- `PUT /api/food/:id` → placeholder 501
- `DELETE /api/food/:id` → placeholder 501

### 8. AI Routes (stub)

**`apps/api/src/routes/ai.routes.ts`:**
- Stub route:
- `POST /api/ai/generate-listing` → placeholder 501

### 9. Database Migration File

**`apps/api/migrations/001_initial_schema.sql`:**
- Buat file SQL migration sesuai yang ada di `docs/IMPLEMENTATION-PLAN.md` Phase 2
- **JANGAN EXECUTE** — hanya tulis file-nya

## Constraints

- **JANGAN sentuh `apps/web/`** — ada session paralel yang kerjain frontend
- **JANGAN modify `packages/shared/`** — shared types sudah final
- **JANGAN modify root config files** (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`)
- **JANGAN jalankan `pnpm install`** — dependencies sudah ter-install
- **JANGAN execute SQL migration** — tulis file saja
- **JANGAN commit** — user yang commit
- Ikuti coding style di `AGENTS.md` — English comments, semantic naming, TypeScript strict
- Semua komentar code dalam English

## Acceptance Criteria

1. `cd /home/ubuntu/ludes && pnpm --filter api dev` — server start tanpa error di port 3001
2. `curl http://localhost:3001/api/health` → returns `{ status: "ok" }`
3. `POST /api/auth/register` dengan body valid → creates user, returns token
4. `POST /api/auth/login` dengan credentials valid → returns token
5. `GET /api/auth/me` dengan valid Bearer token → returns user data
6. `GET /api/auth/me` tanpa token → returns 401
7. Stub routes return 501
8. Migration SQL file exists di `apps/api/migrations/001_initial_schema.sql`
9. Structured logging output visible di console saat requests masuk
10. `pnpm --filter api typecheck` — no TypeScript errors

## Report Back

Setelah selesai, laporkan:
- Files yang dibuat/diubah (list lengkap)
- Hasil test manual (curl commands + responses)
- TypeScript typecheck result
- Issues/blockers yang ditemukan
- Anything yang perlu diperhatikan session berikutnya
