# Ludes

Hyperlocal surplus food marketplace — connecting UMKM food vendors with budget-conscious consumers. AI-powered listing generation from food photos. Web-based, no app install needed.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run dev servers (frontend + backend)
pnpm dev

# Or individually
pnpm --filter web dev    # Frontend → localhost:5173
pnpm --filter api dev    # Backend → localhost:3001
```

## Environment Setup

### Backend (apps/api/.env)

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWKS_URL=https://xxx.supabase.co/auth/v1/.well-known/jwks.json
LLM_API_BASE_URL=http://127.0.0.1:20128/v1
LLM_API_KEY=sk-...
LLM_MODEL=cheapest
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Frontend (apps/web/.env)

```
VITE_API_BASE_URL=http://localhost:3001
```

## Database

Run migration SQL in Supabase SQL editor. Migration file: `apps/api/migrations/001_initial_schema.sql`

**DO NOT auto-execute migrations.** Always present to user for manual execution.

## Build

```bash
pnpm build
```

Frontend outputs to `apps/web/dist/`. Backend outputs to `apps/api/dist/`.

## Deployment

All-in VPS deployment. See `docs/skills/deployment.md` for full guide.

```bash
# Build
pnpm build

# Restart backend
pm2 restart ludes-api
```

## Project Structure

```
ludes/
├── apps/
│   ├── web/       → React + Vite + TanStack Router (frontend)
│   └── api/       → Hono (backend API)
├── packages/
│   └── shared/    → @ludes/shared (types, schemas, constants)
└── docs/          → Documentation, decisions, plans, skills
```

## Documentation

- `AGENTS.md` — AI agent guidance (read this first in new sessions)
- `docs/PROJECT-OVERVIEW.md` — Full product context
- `docs/IMPLEMENTATION-PLAN.md` — Phase-by-phase tracker
- `docs/decisions.md` — Decision log (append-only)
- `docs/project-status.md` — Current status + checklist
- `docs/skills/` — Domain knowledge files

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | React 19, Vite, TanStack Router, Tailwind CSS |
| Backend | Hono (Node.js) |
| Database | Supabase (PostgreSQL + Auth) |
| AI | 9router / Gemini Flash 3 (multimodal) |
| Deploy | VPS + nginx + certbot |
