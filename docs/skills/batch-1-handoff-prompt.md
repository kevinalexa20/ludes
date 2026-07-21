# Prompt Batch 1: Phase 1 (Backend Foundation) & Phase 4 (Frontend Foundation)

You are implementing Phase 1 and Phase 4 of the Ludes project. They are independent and can be developed concurrently.

Follow `AGENTS.md` conventions strictly:
- No overengineering. Simple, robust, predictable code.
- Clean error handling, structured logging.
- Use `@ludes/shared` schemas and types.

---

## Task A: Phase 1 — Backend (Hono + Supabase + Auth)

Create a Node.js Hono server under `apps/api/`.

### 1. File Structure
- `apps/api/tsconfig.json`
- `apps/api/package.json`
- `apps/api/src/index.ts`
- `apps/api/src/lib/supabase.ts`
- `apps/api/src/middleware/logger.ts`
- `apps/api/src/middleware/error-handler.ts`
- `apps/api/src/middleware/auth.ts`
- `apps/api/src/routes/auth.routes.ts`

### 2. Dependencies
Use: `hono`, `@supabase/supabase-js`, `@hono/zod-validator`, `dotenv`, `@ludes/shared` (via workspace link).

### 3. Requirements
- **JWT Verification**: Decode/validate JWT bearer tokens from Supabase Auth (`SUPABASE_JWKS_URL`).
- **Auth Routes**:
  - `POST /api/auth/register`: Create user in Supabase auth via client sdk and insert into public `users` table.
  - `POST /api/auth/login`: Authenticate with Supabase, return access token.
  - `GET /api/auth/me`: Decrypt token, query public `users` table, return user profile.
- **Middleware**: Custom request logging (method, path, status, latency) and robust try-catch error handler returning JSON.

---

## Task B: Phase 4 — Frontend Foundation (Vite + TanStack Router + Tailwind)

Create a React Single Page App under `apps/web/`.

### 1. File Structure
- `apps/web/tsconfig.json`
- `apps/web/vite.config.ts`
- `apps/web/index.html`
- `apps/web/src/main.tsx`
- `apps/web/src/App.tsx`
- `apps/web/src/lib/api-client.ts`
- `apps/web/src/features/auth/hooks/use-auth.ts`
- `apps/web/src/features/auth/pages/login-page.tsx`
- `apps/web/src/features/auth/pages/register-page.tsx`
- `apps/web/src/components/layout.tsx`

### 2. Requirements
- **Routing**: Set up TanStack Router with routes: `/` (home), `/login`, `/register`, `/merchant` (lazy loading/guarded).
- **API Client**: Simple fetch wrapper that auto-injects JWT from `localStorage.getItem("token")` and redirects to `/login` on 401.
- **Auth UI**: Simple tailwind forms using UI system styling guidelines:
  - Input fields, focus transitions, CTA button with green theme.
  - Role selection (Merchant vs Consumer).

---

## Verification
- Both api and web workspace build compiles without type errors (`pnpm typecheck`).
- Test API registration and login via curl or simple client script.
