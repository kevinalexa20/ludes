# Ludes — Implementation Plan Tracker

## Overview

This document tracks the implementation of Ludes from zero to deployed MVP. Each phase is self-contained with clear deliverables. Target: 1 day (deadline July 22, 2026 23:59 WIB).

## Phase Summary

| Phase | Name | Est. Time | Dependencies |
|---|---|---|---|
| 0 | Monorepo Skeleton + Shared Package | 30 min | None |
| 1 | Backend Foundation (Hono + Supabase + Auth) | 2 hr | Phase 0 |
| 2 | Database Schema + Migration | 1 hr | Phase 1 |
| 3 | AI Listing Service (Foto → Listing) | 2 hr | Phase 1 |
| 4 | Frontend Foundation (Vite + Router + Auth UI) | 2 hr | Phase 0 |
| 5 | Merchant Flow (Profile + Food CRUD + AI Upload) | 3 hr | Phase 1, 2, 3, 4 |
| 6 | Consumer Flow (Browse + Detail + WA Order) | 2 hr | Phase 2, 4 |
| 7 | UI Polish + Responsive | 1.5 hr | Phase 5, 6 |
| 8 | Deployment (nginx + SSL + go-live) | 1 hr | Phase 7 |
| 9 | QA + Project Brief + Submit | 1.5 hr | Phase 8 |
| **Total** | | **~16 hr** | |

---

## Phase 0: Monorepo Skeleton + Shared Package

**Status:** ✅ DONE
**Estimated:** 30 minutes
**Deliverables:**
- [x] Turborepo + pnpm workspace config
- [x] `packages/shared/` with types, schemas, pricing constants
- [x] Root `tsconfig.json`, `.gitignore`
- [x] `apps/web/` and `apps/api/` directory structure

**Files created:**
- `package.json` (root)
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.json` (root)
- `.gitignore`
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/index.ts`
- `packages/shared/src/types.ts`
- `packages/shared/src/schemas.ts`
- `packages/shared/src/constants.ts`

---

## Phase 1: Backend Foundation (Hono + Supabase + Auth)

**Status:** [ ] TODO
**Estimated:** 2 hours
**Dependencies:** Phase 0

### 1.1 Hono App Setup

- [ ] Initialize `apps/api/package.json` with dependencies:
  - `hono`, `@supabase/supabase-js`, `zod`, `@hono/zod-validator`
- [ ] Create `apps/api/tsconfig.json`
- [ ] Create `apps/api/src/index.ts` — Hono app entry with CORS middleware
- [ ] Create `apps/api/.env` with Supabase + LLM credentials
- [ ] Create request ID middleware (`apps/api/src/middleware/request-id.ts`)
- [ ] Create structured logger middleware (`apps/api/src/middleware/logger.ts`)
- [ ] Create global error handler (`apps/api/src/middleware/error-handler.ts`)

### 1.2 Supabase Client Setup

- [ ] Create `apps/api/src/lib/supabase.ts` — service_role client (server only)
- [ ] Create `apps/api/src/lib/supabase-client.ts` — anon client (for auth verification)

### 1.3 Auth Routes

- [ ] Create `apps/api/src/routes/auth.routes.ts`:
  - `POST /api/auth/register` — register new user via Supabase Auth + create public.users row
  - `POST /api/auth/login` — email/password login, return JWT
  - `POST /api/auth/logout` — invalidate session
  - `GET /api/auth/me` — get current user from JWT
- [ ] Create `apps/api/src/middleware/auth.ts` — JWT verification middleware
- [ ] Create `apps/api/src/routes/auth.validators.ts` — zod validation for auth inputs

### 1.4 CORS Configuration

- [ ] Configure CORS for frontend origin (`http://localhost:5173` in dev, `https://ludes.camuscleansheet.com` in prod)

### Acceptance Criteria

- [ ] `POST /api/auth/register` creates user in Supabase Auth + public.users
- [ ] `POST /api/auth/login` returns valid JWT
- [ ] `GET /api/auth/me` returns user data when JWT is valid, 401 when not
- [ ] All endpoints have structured logging with request_id
- [ ] Global error handler catches unhandled errors, returns generic message

---

## Phase 2: Database Schema + Migration

**Status:** [ ] TODO
**Estimated:** 1 hour
**Dependencies:** Phase 1

### 2.1 SQL Migration

- [ ] Create `apps/api/migrations/001_initial_schema.sql`:

```sql
-- Enable PostGIS for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'merchant')),
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Merchant profiles
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT NOT NULL,
  description TEXT,
  picture_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Food listings
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('nasi', 'mie', 'lauk', 'kue', 'minuman', 'snack', 'lainnya')),
  original_price INTEGER NOT NULL CHECK (original_price >= 1000),
  suggested_min_price INTEGER,
  suggested_max_price INTEGER,
  final_price INTEGER NOT NULL CHECK (final_price >= 1000),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  pickup_time TEXT,
  picture_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_food_items_status ON food_items(status) WHERE status = 'available';
CREATE INDEX idx_food_items_merchant ON food_items(merchant_id);
CREATE INDEX idx_food_items_created ON food_items(created_at DESC);
CREATE INDEX idx_merchants_user ON merchants(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;

-- Users can read all, write own
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- Merchants readable by all, writable by owner
CREATE POLICY "merchants_select_all" ON merchants FOR SELECT USING (true);
CREATE POLICY "merchants_insert_own" ON merchants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "merchants_update_own" ON merchants FOR UPDATE USING (auth.uid() = user_id);

-- Food items readable by all, writable by merchant owner
CREATE POLICY "food_items_select_all" ON food_items FOR SELECT USING (true);
CREATE POLICY "food_items_merchant_write" ON food_items FOR ALL
  USING (merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()));
```

- [ ] Present migration to user for manual execution in Supabase SQL editor
- [ ] **DO NOT auto-execute** — user must run it

### Acceptance Criteria

- [ ] Migration SQL is valid
- [ ] All tables created with proper constraints
- [ ] Indexes created for performance
- [ ] RLS policies in place
- [ ] User confirmed migration executed successfully in Supabase dashboard

---

## Phase 3: AI Listing Service (Foto → Listing)

**Status:** [ ] TODO
**Estimated:** 2 hours
**Dependencies:** Phase 1

### 3.1 LLM Client Setup

- [ ] Create `apps/api/src/lib/llm-client.ts`:
  - OpenAI-compatible client pointing to 9router endpoint
  - Model: `cheapest` (Gemini Flash 3)
  - Multimodal support (text + image input)

### 3.2 AI Listing Service

- [ ] Create `apps/api/src/services/ai-listing.service.ts`:
  - `generateListingFromPhoto(imageBase64: string, originalPrice: number): Promise<AIListingResult>`
  - System prompt: Indonesian food expert, return structured JSON
  - Parse LLM response into typed result
  - Apply rule-based pricing suggestion (from `@ludes/shared` constants)
  - Enforce floor price (60% of original)

### 3.3 AI Prompt Design

- [ ] System prompt must instruct LLM to return:
  ```json
  {
    "name": "string (Indonesian food name)",
    "description": "string (appetizing 1-2 sentence description)",
    "category": "nasi | mie | lauk | kue | minuman | snack | lainnya",
    "estimated_portions": "number",
    "freshness_notes": "string"
  }
  ```
- [ ] Pricing suggestion computed server-side using `calculatePricing()` from `@ludes/shared`
- [ ] Marketing caption generated separately for WhatsApp sharing

### 3.4 AI Route

- [ ] Create `apps/api/src/routes/ai.routes.ts`:
  - `POST /api/ai/generate-listing` — accepts image (base64) + original price, returns AI listing
  - Auth required (merchant only)
  - Rate limit: 10 requests per minute per user
- [ ] Create `apps/api/src/routes/ai.validators.ts` — input validation

### Acceptance Criteria

- [ ] Upload food photo → get name, description, category back
- [ ] Pricing suggestion includes floor price enforcement
- [ ] AI response is in Indonesian
- [ ] Rate limiting works
- [ ] Error handling for LLM timeout/failure

---

## Phase 4: Frontend Foundation (Vite + Router + Auth UI)

**Status:** [ ] TODO
**Estimated:** 2 hours
**Dependencies:** Phase 0

### 4.1 Vite + React Setup

- [ ] Initialize `apps/web/package.json` with dependencies:
  - `react`, `react-dom`, `@tanstack/react-router`, `tailwindcss`, `@tailwindcss/vite`
- [ ] Create `apps/web/vite.config.ts`
- [ ] Create `apps/web/tsconfig.json` with path aliases
- [ ] Create `apps/web/index.html`
- [ ] Create `apps/web/src/main.tsx` — entry point
- [ ] Create `apps/web/src/App.tsx` — root component with TanStack Router
- [ ] Configure Tailwind CSS

### 4.2 API Client

- [ ] Create `apps/web/src/lib/api-client.ts`:
  - Fetch wrapper with JWT token injection
  - Base URL from `VITE_API_BASE_URL`
  - Auto-redirect to login on 401
  - Typed request/response methods

### 4.3 Auth State Management

- [ ] Create `apps/web/src/features/auth/hooks/use-auth.ts`:
  - Login, register, logout functions
  - Current user state
  - JWT token storage (localStorage)
  - Auto-refresh on page load

### 4.4 Auth Pages

- [ ] Create `apps/web/src/features/auth/pages/login-page.tsx`:
  - Email + password form
  - Link to register
  - Error display
- [ ] Create `apps/web/src/features/auth/pages/register-page.tsx`:
  - Name, email, password, role selector (customer/merchant)
  - Phone (optional)
  - Link to login

### 4.5 Routing + Auth Guard

- [ ] Create route tree with TanStack Router:
  - `/` — Home (browse listings)
  - `/login` — Login page
  - `/register` — Register page
  - `/merchant/*` — Merchant pages (auth guard: merchant only)
    - `/merchant/profile` — Create/edit profile
    - `/merchant/food` — Food item management
    - `/merchant/food/new` — Add new food (AI upload)
- [ ] Auth guard: redirect to login if not authenticated
- [ ] Merchant guard: redirect to profile creation if merchant has no profile

### 4.6 Shared Layout

- [ ] Create `apps/web/src/components/layout.tsx`:
  - Navbar with Ludes logo, nav links, auth status
  - Mobile responsive
  - Footer

### Acceptance Criteria

- [ ] Vite dev server runs on localhost:5173
- [ ] Login/register forms work end-to-end with backend
- [ ] Auth guard redirects unauthenticated users
- [ ] Merchant guard redirects merchants without profile
- [ ] Tailwind CSS working, responsive layout
- [ ] Path aliases (`@/`) resolving correctly

---

## Phase 5: Merchant Flow (Profile + Food CRUD + AI Upload)

**Status:** [ ] TODO
**Estimated:** 3 hours
**Dependencies:** Phase 1, 2, 3, 4

### 5.1 Merchant Profile

- [ ] Create `apps/web/src/features/merchant/hooks/use-merchant.ts`:
  - `getProfile()`, `createProfile()`, `updateProfile()`
- [ ] Create `apps/web/src/features/merchant/pages/merchant-profile-page.tsx`:
  - Form: warung name, address, phone, description
  - Map/location picker (simple lat/lng input or use browser geolocation)
  - Photo upload for warung picture
- [ ] Create `apps/api/src/routes/merchant.routes.ts`:
  - `GET /api/merchants/me` — get current merchant profile
  - `POST /api/merchants` — create merchant profile
  - `PUT /api/merchants/me` — update merchant profile

### 5.2 Food Item CRUD

- [ ] Create `apps/web/src/features/merchant/hooks/use-food-items.ts`:
  - `getFoodItems()`, `createFoodItem()`, `updateFoodItem()`, `deleteFoodItem()`
- [ ] Create `apps/web/src/features/merchant/pages/food-list-page.tsx`:
  - Grid/list of merchant's food items
  - Status badge (available/sold out)
  - Quick actions: edit, toggle status, delete
- [ ] Create `apps/api/src/routes/food.routes.ts`:
  - `GET /api/food` — list all available food (public, with merchant join)
  - `GET /api/food/my` — list current merchant's food (auth required)
  - `GET /api/food/:id` — get single food item
  - `POST /api/food` — create food item (merchant auth)
  - `PUT /api/food/:id` — update food item (merchant auth, own items only)
  - `DELETE /api/food/:id` — delete food item (merchant auth, own items only)
  - `PATCH /api/food/:id/status` — toggle status (merchant auth)

### 5.3 AI Upload Flow

- [ ] Create `apps/web/src/features/merchant/pages/create-food-page.tsx`:
  - Step 1: Upload photo (drag & drop or click)
  - Step 2: Show loading spinner while AI processes
  - Step 3: Pre-fill form with AI results (name, description, category)
  - Step 4: Show pricing suggestion banner:
    ```
    💡 Rekomendasi harga: Rp 9.000 - Rp 12.000 (diskon 20-40%)
    Harga lantai: Rp 6.000 (tidak boleh di bawah ini)
    ```
  - Step 5: Merchant inputs: original price, final price, quantity, pickup time
  - Step 6: Preview → Submit
- [ ] Image compression before upload (max 2MB, resize to 1024px)

### 5.4 Coming Soon Section

- [ ] Add "Predictions" tab in merchant dashboard
- [ ] Show placeholder: "Fitur prediksi surplus harian akan segera hadir! AI akan menganalisis pola penjualan Anda dan memprediksi surplus besok."
- [ ] Disabled/grayed out, clearly marked as coming soon

### Acceptance Criteria

- [ ] Merchant can create profile with name, address, phone, location
- [ ] Merchant can create food listing with AI photo upload
- [ ] AI generates name, description, category from photo
- [ ] Pricing suggestion displayed but merchant controls final price
- [ ] Merchant can edit/update/delete food items
- [ ] Merchant can toggle food status (available/sold out)
- [ ] Coming soon placeholder visible in dashboard

---

## Phase 6: Consumer Flow (Browse + Detail + WA Order)

**Status:** [ ] TODO
**Estimated:** 2 hours
**Dependencies:** Phase 2, 4

### 6.1 Home Page (Browse)

- [ ] Create `apps/web/src/features/browse/pages/home-page.tsx`:
  - Hero section: "Makanan murah, dekat kamu. Selamatkan makanan, hemat dompet."
  - Food grid: cards with photo, name, price, discount %, merchant name, distance
  - Category filter pills: Semua, Nasi, Mie, Lauk, Kue, Minuman
  - Sort: Terdekat, Termurah, Terbaru
  - Search bar (by name)
- [ ] Request browser geolocation on load (with graceful fallback)
- [ ] Create `apps/web/src/features/browse/components/food-card.tsx`:
  - Photo, name, original price (strikethrough), final price, discount badge
  - Merchant name + distance
  - Status indicator

### 6.2 Food Detail Page

- [ ] Create `apps/web/src/features/browse/pages/food-detail-page.tsx`:
  - Full photo
  - Name, description, category
  - Original price vs final price with discount percentage
  - Merchant info: name, address, phone
  - Quantity available
  - Pickup time
  - "Order via WhatsApp" button (prominent, green)
  - Map/location of merchant (static or link to Google Maps)

### 6.3 WhatsApp Order Flow

- [ ] Create `apps/web/src/lib/wa-order.ts`:
  - `generateWAOrderUrl(foodItem: FoodItem, quantity: number): string`
  - Generates URL: `https://wa.me/[phone]?text=[encoded message]`
  - Message template:
    ```
    Halo [merchant name]! 👋

    Saya mau pesan dari Ludes:
    🍽️ [food name]
    📦 [quantity] porsi
    💰 Rp [final_price * quantity]
    🕐 Pickup: [pickup_time or "secepatnya"]

    Terima kasih!
    ```
- [ ] Button opens WA in new tab
- [ ] Fallback: if WA doesn't open, show phone number for manual copy

### Acceptance Criteria

- [ ] Home page shows available food items in grid
- [ ] Category filter works
- [ ] Sort by distance/price/date works
- [ ] Geolocation requested with fallback
- [ ] Food detail page shows all info
- [ ] "Order via WhatsApp" generates correct pre-filled message
- [ ] WA link opens with merchant's phone number

---

## Phase 7: UI Polish + Responsive

**Status:** [ ] TODO
**Estimated:** 1.5 hours
**Dependencies:** Phase 5, 6

### 7.1 Design System

- [ ] Define color palette:
  - Primary: Green (trust, freshness) — `#22C55E` family
  - Accent: Orange/Yellow (appetizing, CTA) — `#F59E0B` family
  - Background: Warm white — `#FAFAF9`
  - Text: Dark gray — `#1C1917`
- [ ] Typography: `Plus Jakarta Sans` (Google Fonts) for body, `Lexend` for headings
- [ ] Consistent spacing scale (Tailwind default)
- [ ] Consistent border radius, shadow tokens

### 7.2 Mobile Responsive

- [ ] All pages responsive: 320px → 1440px
- [ ] Touch-friendly buttons (min 44px tap targets)
- [ ] Mobile nav: hamburger menu
- [ ] Food grid: 1 column mobile, 2 tablet, 3-4 desktop

### 7.3 Loading States

- [ ] Skeleton loaders for food grid
- [ ] Spinner for AI listing generation
- [ ] Toast notifications for success/error
- [ ] Empty states with illustration/message

### 7.4 Accessibility Basics

- [ ] Semantic HTML
- [ ] Alt text on images
- [ ] Form labels
- [ ] Focus indicators
- [ ] Color contrast WCAG AA

### Acceptance Criteria

- [ ] All pages look good on 375px (iPhone SE)
- [ ] All pages look good on 1440px (desktop)
- [ ] Touch targets >= 44px on mobile
- [ ] Loading states exist for all async operations
- [ ] No layout shift on image load

---

## Phase 8: Deployment

**Status:** [ ] TODO
**Estimated:** 1 hour
**Dependencies:** Phase 7

### 8.1 Build

- [ ] `pnpm build` from root — both apps build successfully
- [ ] Frontend outputs to `apps/web/dist/`
- [ ] Backend ready for production on port 3001

### 8.2 SSL Certificate

- [ ] `sudo certbot --nginx -d ludes.camuscleansheet.com`
- [ ] Verify SSL working

### 8.3 Nginx Configuration

- [ ] Create `/etc/nginx/sites-available/ludes.camuscleansheet.com`:
  ```nginx
  server {
      listen 80;
      server_name ludes.camuscleansheet.com;
      return 301 https://$host$request_uri;
  }

  server {
      listen 443 ssl;
      server_name ludes.camuscleansheet.com;

      ssl_certificate /etc/letsencrypt/live/ludes.camuscleansheet.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/ludes.camuscleansheet.com/privkey.pem;

      root /home/ubuntu/ludes/apps/web/dist;
      index index.html;

      location / {
          try_files $uri $uri/ /index.html;
      }

      location /api/ {
          proxy_pass http://127.0.0.1:3001;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```
- [ ] Enable site: `ln -s /etc/nginx/sites-available/ludes.camuscleansheet.com /etc/nginx/sites-enabled/`
- [ ] `nginx -t` then `systemctl reload nginx`

### 8.4 Backend Process Manager

- [ ] Use PM2 or systemd to keep Hono running:
  ```bash
  cd /home/ubuntu/ludes/apps/api
  pm2 start "node dist/index.js" --name ludes-api
  pm2 save
  ```
- [ ] Or systemd service file

### 8.5 Environment Variables

- [ ] Set production env vars for backend:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWKS_URL`
  - `LLM_API_BASE_URL`
  - `LLM_API_KEY`
  - `LLM_MODEL`
  - `PORT`
- [ ] Set frontend env var:
  - `VITE_API_BASE_URL=https://ludes.camuscleansheet.com/api`

### 8.6 Verification

- [ ] `https://ludes.camuscleansheet.com` loads frontend
- [ ] `https://ludes.camuscleansheet.com/api/auth/me` returns 401 (not authenticated)
- [ ] SSL certificate valid
- [ ] Register → Login → Create Profile → Upload Food → Browse → Order via WA — full flow works

### Acceptance Criteria

- [ ] Site accessible at `https://ludes.camuscleansheet.com`
- [ ] SSL valid (no browser warning)
- [ ] Frontend loads and renders correctly
- [ ] Backend API responds through nginx proxy
- [ ] Full flow works: register → login → profile → upload → browse → order

---

## Phase 9: QA + Project Brief + Submit

**Status:** [ ] TODO
**Estimated:** 1.5 hours
**Dependencies:** Phase 8

### 9.1 Manual QA Checklist

- [ ] Register as merchant — works
- [ ] Login as merchant — works
- [ ] Create merchant profile — works
- [ ] Upload food photo — AI generates listing — works
- [ ] Pricing suggestion displayed correctly — works
- [ ] Set final price manually — works
- [ ] Edit food item — works
- [ ] Toggle food status (available/sold out) — works
- [ ] Delete food item — works
- [ ] Coming soon placeholder visible — works
- [ ] Register as customer — works
- [ ] Browse home page — food items visible
- [ ] Filter by category — works
- [ ] Sort by distance/price/date — works
- [ ] Click food detail — all info shown
- [ ] Order via WhatsApp — correct pre-filled message
- [ ] Mobile responsive — tested on phone
- [ ] Logout — works

### 9.2 Project Brief Document

- [ ] Create Google Doc with project brief (template from challenge)
- [ ] Include: problem statement, solution, tech stack, AI integration, screenshots, demo video link
- [ ] Share to "Anyone with the link"

### 9.3 Submission

- [ ] Go to `https://www.dicoding.com/challenges/973`
- [ ] Fill form:
  - App ID: (leave blank for web)
  - Nama Aplikasi: Ludes
  - Link Aplikasi: `https://ludes.camuscleansheet.com`
  - Komentar: Link to project brief Google Doc
- [ ] Double-check all fields
- [ ] Submit before 23:59 WIB

### Acceptance Criteria

- [ ] All QA items pass
- [ ] Project brief document complete and shared
- [ ] Submission form filled correctly
- [ ] Submitted before deadline

---

## Quick Reference: Environment Variables

### Backend (apps/api/.env)
```
SUPABASE_URL=https://sduynedhiwwsqkfsydyx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_JWKS_URL=https://sduynedhiwwsqkfsydyx.supabase.co/auth/v1/.well-known/jwks.json
LLM_API_BASE_URL=http://127.0.0.1:20128/v1
LLM_API_KEY=sk-ecbf6cc546f7068c-35xjdj-e2e17dee
LLM_MODEL=cheapest
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Frontend (apps/web/.env)
```
VITE_API_BASE_URL=http://localhost:3001
```

### Production Frontend
```
VITE_API_BASE_URL=https://ludes.camuscleansheet.com/api
```
