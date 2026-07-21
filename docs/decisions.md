# Ludes — Decision Log

Append-only log of architectural and product decisions made during development.

---

## 2026-07-21 — Rewrite from WarungHemat to Ludes

**Context:** Existing WarungHemat Flutter mobile app built for IBM Mini-Hackathon. Need to submit to IDCamp Developer Challenge (deadline July 22, 2026 23:59).

**Choice:** Full rewrite from Flutter mobile app to web app (React + Hono). Rebrand from "WarungHemat" to "Ludes."

**Rationale:**
- Challenge requires Gen AI integration — original app had none
- Web app easier to deploy live (bonus points) vs mobile app requiring APK/playstore
- Target market (UMKM kaki lima) more accessible via web (no app install) than mobile
- "WarungHemat" name too generic, "Ludes" is catchy, memorable, creates urgency/FOMO

**Impact:** Complete rebuild, but same business concept (surplus food marketplace for UMKM).

---

## 2026-07-21 — Tech Stack: pnpm (not Bun)

**Context:** Initially planned to use Bun as runtime. User requested switch to pnpm.

**Choice:** pnpm workspaces + Turborepo, Node.js runtime.

**Rationale:** User preference. pnpm is well-established, fast, disk-efficient. No Bun-specific features needed.

**Impact:** Use pnpm commands (`pnpm install`, `pnpm dev`, `pnpm --filter`). No Bun APIs.

---

## 2026-07-21 — AI Features: 2 of 4 for MVP

**Context:** 4 AI features proposed:
1. Photo → Listing (AI generates name, description, category from food photo)
2. Surplus Prediction (AI predicts daily surplus from sales history)
3. Smart Pricing (rule-based pricing suggestion)
4. WhatsApp Chatbot (AI answers stock inquiries via WA)

**Choice:** Ship features 1 + 3 for MVP. Feature 2 as "Coming Soon" placeholder. Feature 4 deferred to post-challenge.

**Rationale:**
- Feature 1 + 3 bundle into one seamless flow (upload → AI generates listing + pricing)
- Feature 2 requires historical data that doesn't exist yet
- Feature 4 (WA chatbot) requires Meta Business Verification (1-2 weeks) — deadline risk
- 1-day build window, must prioritize demo-worthy features

**Impact:** MVP has strong AI demo (30-second photo upload flow). Post-challenge roadmap clear.

---

## 2026-07-21 — Smart Pricing: Rule-Based, Not ML

**Context:** Concern that AI pricing could exploit UMKM by suggesting prices too low.

**Choice:** Rule-based heuristic pricing suggestion. AI (LLM) only used for listing content generation, not pricing. Pricing logic is server-side rules.

**Rationale:**
- No training data available for ML model
- Rule-based is predictable, testable, debuggable
- Floor price (60% of original) hardcoded in server — AI cannot override
- Merchant always has final control over price

**Impact:** Pricing logic in `@ludes/shared` constants. Category-based max discount + time multiplier. Floor price enforcement.

**Pricing Rules:**
- Nasi/Mie/Lauk: max 40% discount
- Kue/Minuman/Snack: max 50% discount
- Time multiplier: closer to closing = higher discount
- Floor price: 60% of original price (hardcoded, server-enforced)

---

## 2026-07-21 — Order Flow: WhatsApp Redirect (No In-App Payment)

**Context:** 1-day deadline. Payment integration (Midtrans/Xendit) adds 4-6 hours.

**Choice:** Order via WhatsApp redirect with pre-filled message. No payment integration.

**Rationale:**
- Target market (UMKM kaki lima) familiar with WA, not digital payments
- WA redirect = zero backend complexity for orders
- Transaction happens between consumer and merchant directly
- Fits "cash on pickup" culture of street food vendors

**Impact:** No order table in DB. No payment gateway. Order state managed in WA chat.

---

## 2026-07-21 — Auth: Email/Password, Merchant Only

**Context:** UMKM target users often don't have email. But OTP (SMS/WA) requires gateway setup + cost + time.

**Choice:** Email/password for merchants only. Consumers browse without login.

**Rationale:**
- Merchants more tech-literate than consumers (they manage online stores)
- Consumers don't need accounts to browse food
- OTP adds too much complexity for 1-day deadline
- Order happens in WA anyway, no need for consumer auth

**Impact:** Auth routes: register, login, logout, me. Consumer pages are public.

---

## 2026-07-21 — Deployment: All-in VPS, No Vercel

**Context:** LLM endpoint is on Tailscale private network (`http://127.0.0.1:20128/v1`). Vercel can't reach it.

**Choice:** All-in deployment on VPS (43.129.58.137). Frontend static + Hono backend behind nginx.

**Rationale:**
- VPS is already on Tailscale network, can reach LLM endpoint
- nginx already installed and configured for other sites
- certbot available for SSL
- Single deployment target = simpler

**Impact:** nginx reverse proxy config. Static frontend at root, API at `/api/*`.

---

## 2026-07-21 — Brand Name: Ludes

**Context:** "WarungHemat" too generic. Needed 1-word, catchy, memorable name.

**Choice:** "Ludes" (Indonesian for "completely gone, sold out").

**Rationale:**
- Creates FOMO — food will LUDES if you don't buy now
- Positive framing for both sides: merchant (dagangan ludes) + consumer (dapat murah)
- Unique — no existing brand uses this name
- 2 syllables, easy to pronounce
- Natural in Indonesian conversation

**Impact:** All branding, subdomain (`ludes.camuscleansheet.com`), and UI copy reference "Ludes."

---

## 2026-07-21 — Competitive Positioning: Budget Surplus.id

**Context:** Surplus.id exists as the closest competitor.

**Choice:** Position Ludes as the budget/UMKM version of Surplus.id.

**Rationale:**
- Surplus.id serves cafes, bakeries, hotels (mid-up market)
- Surplus.id does NOT serve kaki lima, warteg, rumah makan kecil
- This underserved segment is massive (millions of vendors)
- Different enough from Surplus.id to score on "Innovation"

**Impact:** All marketing copy and challenge brief emphasize UMKM kaki lima focus.

---

## 2026-07-21 — Frontend Image Persistence Strategy: localStorage Cache

**Context:** The backend database schema accepts a `picture_url` field, but it validates as a URL, and there is no file storage bucket configured yet.
**Choice:** Store the base64-compressed image locally in the browser's `localStorage` (key: `ludes_img_<item_id>`) upon successful food item creation, while passing `picture_url: ""` to the backend database.
**Rationale:**
- Keeps image uploads working for local demo/hackathon purposes without setting up an external storage bucket or modifying the database/shared package schemas.
- Meets the Zod schemas constraint where `picture_url` must be `z.string().url()` (which base64 data URLs fail) by omitting it in the payload.
- Fallback in `FoodCard` and `FoodDetailPage` checks for `localStorage` items when `picture_url` is empty.

**Impact:** Merchant images persist and display on the user's browser, giving a complete, fully functional visual experience for the hackathon demo.

---

## 2026-07-21 — AI Flow Design: Collect Original Price in Step 1

**Context:** The Hono backend `POST /api/ai/generate-listing` requires `original_price` to calculate dynamic pricing recommendations, but the draft UI flow collected this price in Step 3.
**Choice:** Collect both the photo upload and the normal (original) price in Step 1 of the multi-step form.
**Rationale:**
- Satisfies the backend validator which requires the normal price upfront.
- Simplifies the final step (Step 3) where the user only needs to set the final discount price, porsi quantity, and pickup times based on the AI's suggestions.

**Impact:** Seamless wizard flow that works natively with the backend endpoints without validation errors.
