# Ludes — Project Status

## Initial Ask

Rewrite WarungHemat (Flutter mobile app) into a Gen AI-powered web app called Ludes. Target: IDCamp Developer Challenge submission. Deadline: July 22, 2026 23:59 WIB. Must deploy live at `ludes.camuscleansheet.com`.

## Tech Decisions

- Monorepo: pnpm workspaces + Turborepo
- Frontend: React 19 + Vite + TanStack Router + Tailwind CSS
- Backend: Hono on Node.js
- Database: Supabase (Postgres + Auth)
- AI: 9router (Gemini Flash 3, multimodal, local endpoint)
- Deploy: All-in VPS + nginx + certbot

## MVP Features

1. Merchant auth (email/password)
2. AI photo-to-listing (upload photo → AI generates name, description, category)
3. Smart pricing suggestion (rule-based, floor price enforced, merchant controls final price)
4. Browse food items (home page, filter, sort)
5. WhatsApp order redirect (pre-filled message)
6. Coming soon placeholder (surplus prediction)

## Checklist

### Phase 0: Monorepo Skeleton
- [x] Turborepo + pnpm workspace config
- [x] Shared package (types, schemas, pricing constants)
- [x] Directory structure

### Phase 1: Backend Foundation
- [ ] Hono app setup (entry, CORS, middleware)
- [ ] Supabase client (service_role)
- [ ] Auth routes (register, login, logout, me)
- [ ] JWT verification middleware
- [ ] Error handling middleware
- [ ] Structured logging middleware

### Phase 2: Database Schema
- [ ] SQL migration file (users, merchants, food_items, indexes, RLS)
- [ ] User executes migration in Supabase dashboard

### Phase 3: AI Listing Service
- [ ] LLM client setup (9router endpoint)
- [ ] AI listing service (photo → name, description, category)
- [ ] AI route (POST /api/ai/generate-listing)
- [ ] Pricing suggestion integration
- [ ] Rate limiting

### Phase 4: Frontend Foundation
- [ ] Vite + React + TanStack Router setup
- [ ] Tailwind CSS configuration
- [ ] API client (fetch wrapper)
- [ ] Auth hooks + state
- [ ] Login page
- [ ] Register page
- [ ] Route tree + auth guard
- [ ] Layout (navbar, footer)

### Phase 5: Merchant Flow
- [ ] Merchant profile page (create/edit)
- [ ] Merchant API routes (CRUD)
- [ ] Food item list page (merchant's items)
- [ ] Food API routes (CRUD)
- [ ] AI upload flow (photo → AI → form → submit)
- [ ] Coming soon placeholder

### Phase 6: Consumer Flow
- [ ] Home page (food grid, filter, sort)
- [ ] Food detail page
- [ ] WhatsApp order URL generator
- [ ] Geolocation with fallback

### Phase 7: UI Polish
- [ ] Color palette + typography
- [ ] Mobile responsive (375px → 1440px)
- [ ] Loading states (skeleton, spinner)
- [ ] Toast notifications
- [ ] Empty states

### Phase 8: Deployment
- [ ] Build both apps
- [ ] SSL certificate (certbot)
- [ ] nginx config
- [ ] Backend process manager (PM2 or systemd)
- [ ] Environment variables
- [ ] Full flow verification

### Phase 9: QA + Submit
- [ ] Manual QA checklist (all flows)
- [ ] Project brief document
- [ ] Submit to Dicoding challenge

## Documentation Phase

- [x] AGENTS.md — AI agent guidance (adapted from selaras-asia pattern)
- [x] README.md — Project README (no IBM references)
- [x] docs/PROJECT-OVERVIEW.md — Full product context
- [x] docs/IMPLEMENTATION-PLAN.md — Phase-by-phase tracker (mini PRD)
- [x] docs/UI-DESIGN-SYSTEM.md — Design system, animation, copywriting, page specs
- [x] docs/decisions.md — Decision log (8 decisions)
- [x] docs/project-status.md — This file
- [x] docs/skills/auth-flow.md — Auth flow documentation
- [x] docs/skills/ai-listing-flow.md — AI listing generation flow
- [x] docs/skills/smart-pricing.md — Pricing rules and safety net
- [x] docs/skills/wa-order-flow.md — WhatsApp order redirect
- [x] docs/skills/deployment.md — Deployment guide

## Current Status

**Phase 0 COMPLETE. Documentation phase COMPLETE.**

Monorepo skeleton + shared package + full documentation suite ready.

**Next:** Phase 1 (Backend Foundation) and Phase 4 (Frontend Foundation) — these are independent and can be done in parallel.

## Next Steps

1. Initialize `apps/api/` — Hono app with Supabase + auth
2. Initialize `apps/web/` — Vite + React + TanStack Router
3. Run both dev servers, verify communication
4. Implement auth flow end-to-end
5. Continue with Phase 2 (DB schema) → Phase 3 (AI) → Phase 5 (Merchant) → Phase 6 (Consumer)
