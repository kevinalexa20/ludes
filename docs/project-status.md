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
- [x] Hono app setup (entry, CORS, middleware)
- [x] Supabase client (service_role)
- [x] Auth routes (register, login, logout, me)
- [x] JWT verification middleware
- [x] Error handling middleware
- [x] Structured logging middleware

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
- [x] Vite + React + TanStack Router setup
- [x] Tailwind CSS configuration
- [x] API client (fetch wrapper)
- [x] Auth hooks + state
- [x] Login page
- [x] Register page
- [x] Route tree + auth guard
- [x] Layout (navbar, footer)

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

**Phase 0, 1, and 4 COMPLETE. Documentation phase COMPLETE.**

Monorepo skeleton, shared package, full documentation suite, Backend Foundation (Phase 1), and Frontend Foundation (Phase 4) ready.

**Next:** Phase 2 (Database Schema) and Phase 3 (AI Listing Service).

## Next Steps

1. User to execute the SQL database migration in Supabase editor (`apps/api/migrations/001_initial_schema.sql`).
2. Implement Phase 3 (AI Listing Service) using the 9router LLM cheapest model endpoint.
3. Implement Phase 5 (Merchant Flow) and Phase 6 (Consumer Flow).
