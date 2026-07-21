# Ludes — Project Overview

## What is Ludes?

Ludes is a hyperlocal surplus food marketplace that connects small-scale Indonesian food vendors (kaki lima, warteg, rumah makan kecil) with budget-conscious consumers. Vendors list their surplus food at discounted prices before it goes to waste. Consumers find affordable meals nearby and order via WhatsApp.

## Problem Statement

### Food Waste in Indonesia

- Indonesia wastes 23-48 million tons of food annually
- Economic losses: Rp 213-551 trillion per year
- 23-48 million meals wasted daily
- 39 billion items go to waste every year

### UMKM Pain Points

- 64+ million UMKM in Indonesia, contributing 60% of national GDP
- Only 12% successfully integrated technology into operations
- 44% don't understand digital advertising
- 60% complain about unfair price competition on marketplaces
- Manual record-keeping, word-of-mouth marketing, intuition-based management
- Surplus food = lost revenue for small vendors who operate on thin margins

### Why Existing Solutions Don't Reach UMKM

**Surplus.id** (the closest competitor) serves mid-to-upper market:
- 10,000+ partner merchants — but mostly cafes, bakeries, hotels, catering
- Mobile app only (Android + iOS) — install friction
- Flat 50% discount — no flexibility for different food categories
- No AI-powered content creation
- Does NOT serve: pedagang kaki lima, warteg, rumah makan kecil

### Ludes Fills the Gap

Ludes targets the underserved segment that Surplus.id doesn't reach:
- **Kaki lima** — street food vendors with zero digital presence
- **Warteg** — small warungs with surplus rice and side dishes daily
- **Rumah makan kecil** — small family restaurants with unpredictable demand
- Web-based (no app install) — accessible on any smartphone with browser
- AI-powered listing — vendors just take a photo, AI does the rest
- Flexible pricing — AI suggests, vendor decides
- WhatsApp ordering — familiar to target market, no payment integration needed

## Business Model

### Phase 1 (MVP — Challenge Submission)

- Free for both merchants and consumers
- Merchants: register → upload food photos → AI generates listing → manage inventory
- Consumers: browse nearby deals → order via WhatsApp redirect
- No payment integration — cash on pickup or WA-based payment agreement

### Phase 2 (Post-Challenge, If Funded)

- Premium merchant features (analytics, promoted listings)
- Mobile app (React Native)
- In-app ordering and payment
- WhatsApp Business API chatbot

## Target Users

### Merchants (Supply Side)

- **Demographics:** Small food vendors, age 30-55, lower-middle income
- **Tech literacy:** Low — familiar with WhatsApp, maybe Tokopedia/Shopee
- **Pain point:** Surplus food goes to waste daily, no way to sell it at discount
- **Motivation:** Recover some revenue from would-be waste

### Consumers (Demand Side)

- **Demographics:** Students, young workers, families, age 18-40
- **Tech literacy:** Moderate — smartphone users, familiar with food delivery apps
- **Pain point:** Want affordable meals, especially during economic pressure
- **Motivation:** Get good food at 20-50% discount

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Fast builds, shared types, clean separation |
| Frontend | React 19 + Vite + TanStack Router | Modern SPA, fast HMR, type-safe routing |
| Backend | Hono (Node.js) | Lightweight, fast, TypeScript-first |
| Database | Supabase (PostgreSQL) | Auth built-in, PostGIS for location, free tier |
| AI/LLM | 9router (Gemini Flash 3) | Multimodal (photo → text), cheap, fast |
| Styling | Tailwind CSS | Utility-first, responsive, fast development |
| Deployment | VPS + nginx + certbot | All-in-one, SSL, subdomain |
| Package Manager | pnpm | Fast, disk-efficient, workspace support |

### Architecture: Full BFF (Backend for Frontend)

```
Consumer Browser
       │
       ▼
  nginx (reverse proxy, SSL)
       │
       ├──── Static files (Vite build)
       │
       └──── /api/* → Hono Backend
                         │
                         ├──── Supabase (Auth + DB)
                         │
                         └──── 9router LLM API (AI listing)
```

Frontend has ZERO Supabase dependency. All data flows through Hono. This means:
- Security: Supabase keys never exposed to browser
- Flexibility: Can swap Supabase for any DB later
- Debugging: All requests logged at one point

## Core Features (MVP)

### 1. Merchant Authentication

- Email/password registration and login
- Role-based: merchant (can list food) vs customer (browse only)
- Merchant must create profile (warung name, address, phone, location) before listing

### 2. AI-Powered Food Listing (Foto → Listing Instan)

**The star feature. Demo in 30 seconds: photo → complete listing.**

Flow:
1. Merchant uploads food photo
2. Backend sends photo to LLM (Gemini Flash 3, multimodal)
3. LLM returns: name, description, category, pricing suggestion, marketing caption
4. Merchant reviews and edits if needed
5. Merchant sets final price manually (AI only suggests)
6. Submit → listing goes live

### 3. Smart Pricing (Rule-Based Suggestion)

AI does NOT set prices. AI suggests, merchant decides.

**How it works (no ML, no training data):**

```
Input:
- Original price (merchant provides)
- Food category (nasi/mie/lauk/kue/minuman/snack/lainnya)
- Current time vs closing time

Rule-based logic:
- Each category has max discount %:
  - Nasi/Mie/Lauk: max 40% (thin margins)
  - Kue/Minuman/Snack: max 50%
- Time multiplier: closer to closing = higher discount
- FLOOR PRICE: 60% of original (hardcoded in server, not controlled by AI)

Output:
- Suggested price range: "Rp 9.000 - Rp 12.000 (diskon 20-40%)"
- Merchant types final price themselves
```

**Why this is safe:**
- Floor price prevents exploitation — merchant can never be forced below 60%
- AI is an assistant, not a decision-maker
- Merchant always has final control

### 4. Browse & Discovery

- Consumer sees available food items nearby
- Sort by distance (using browser geolocation)
- Filter by category, price range
- Each listing shows: photo, name, original price, discount price, merchant name, distance

### 5. WhatsApp Order Redirect

- Consumer clicks "Order via WhatsApp" on a listing
- System generates pre-filled message:
  ```
  Halo [nama warung], saya mau pesan [item] ([quantity]x)
  seharga Rp [harga]. Saya pickup jam [waktu].
  Order ID: [id]
  ```
- Opens WhatsApp with merchant's phone number
- Transaction happens entirely in WA between consumer and merchant

### 6. Coming Soon Placeholder

- Merchant dashboard shows "Predictions" tab with coming soon message
- Future feature: AI predicts daily surplus based on sales history

## Database Schema

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'merchant')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Merchant profiles
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT NOT NULL,
  description TEXT,
  picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Food listings
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('nasi', 'mie', 'lauk', 'kue', 'minuman', 'snack', 'lainnya')),
  original_price INTEGER NOT NULL,
  suggested_min_price INTEGER,
  suggested_max_price INTEGER,
  final_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  pickup_time TEXT,
  picture_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold_out')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_food_items_status ON food_items(status);
CREATE INDEX idx_food_items_merchant ON food_items(merchant_id);
CREATE INDEX idx_food_items_created ON food_items(created_at DESC);
CREATE INDEX idx_merchants_user ON merchants(user_id);
```

## Challenge Context

### IDCamp Developer Challenge

- **Theme:** Build Generative AI solution for Indonesian UMKM pain points
- **Deadline:** July 22, 2026, 23:59 WIB
- **Evaluation criteria:**
  - AI Utilization (30%) — relevance and effectiveness of AI
  - Theme Fit (30%) — relevance to UMKM pain points
  - Benefit for Indonesian Society (25%) — impact scale
  - Design & Usability (25%) — attractive UI, easy to use
- **Bonus points:** Live website, real-time data, real UMKM partner
- **Submission:** App name + deployed link + project brief document

### Why Ludes Can Win

1. **AI is core, not bolted on** — photo-to-listing is the primary merchant workflow
2. **Real pain point** — food waste + UMKM financial vulnerability (validated by Surplus.id's existence)
3. **Underserved market** — Surplus.id doesn't serve kaki lima, we do
4. **Live deployment** — web app at ludes.camuscleansheet.com
5. **Demo-friendly** — upload photo → AI generates listing in seconds

## Deployment

### Infrastructure

- **VPS:** Public IP `43.129.58.137`, Tailscale connected
- **Domain:** `ludes.camuscleansheet.com` (A record → VPS IP)
- **Reverse proxy:** nginx with SSL (certbot/Let's Encrypt)
- **Frontend:** Vite build served as static files via nginx
- **Backend:** Hono running on port 3001, proxied by nginx at `/api/*`
- **LLM:** Local 9router endpoint at `http://127.0.0.1:20128/v1` (Tailscale network)

### Nginx Config Plan

```
server {
    listen 443 ssl;
    server_name ludes.camuscleansheet.com;
    # SSL certs from certbot

    root /var/www/ludes/dist;  # Vite build output
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM API downtime | Medium | High (core feature broken) | Cache last 5 listing templates as fallback |
| LLM generates bad content | Medium | Low | Merchant reviews before submit |
| Geolocation denied by browser | Medium | Medium | Default to city center, allow manual location |
| Merchant doesn't understand AI pricing | Low | Medium | Clear UI: "Suggestion only, you decide" |
| WhatsApp link doesn't work | Low | Low | Fallback: show phone number for manual copy |
| VPS goes down | Low | High | Out of scope for MVP |

## Future Roadmap (Post-Challenge)

1. **WhatsApp chatbot** — AI-powered stock inquiry bot
2. **Surplus prediction** — AI predicts daily surplus from sales history
3. **Mobile app** — React Native for better push notifications
4. **Payment integration** — In-app payment via Midtrans/Xendit
5. **Rating & reviews** — Build trust between consumers and merchants
6. **Merchant analytics** — Sales trends, popular items, waste reduction metrics
