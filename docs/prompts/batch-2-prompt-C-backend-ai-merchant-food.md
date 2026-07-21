# Batch 2 — Prompt C: Phase 3 (AI Listing) + Phase 5 Backend (Merchant & Food Routes)

Kamu masuk ke repo `/home/ubuntu/ludes`, branch `master`.

## Konteks

Ludes — surplus food marketplace untuk UMKM Indonesia. Monorepo pnpm + Turborepo. Backend Hono sudah punya foundation (Phase 1 done): auth routes, middleware, Supabase client, stub routes. Database migration sudah dijalankan di Supabase.

Kamu hanya mengerjakan **backend** di `apps/api/`. **JANGAN sentuh `apps/web/`** — ada session paralel yang mengerjakan frontend.

Baca WAJIB sebelum mulai:
- `/home/ubuntu/ludes/AGENTS.md`
- `/home/ubuntu/ludes/docs/IMPLEMENTATION-PLAN.md` (Phase 3 + Phase 5 backend)
- `/home/ubuntu/ludes/docs/skills/ai-listing-flow.md`
- `/home/ubuntu/ludes/docs/skills/smart-pricing.md`
- `/home/ubuntu/ludes/docs/skills/auth-flow.md`
- `/home/ubuntu/ludes/packages/shared/src/types.ts` — shared types
- `/home/ubuntu/ludes/packages/shared/src/constants.ts` — pricing rules + calculatePricing()
- `/home/ubuntu/ludes/packages/shared/src/schemas.ts` — zod schemas

## Existing Backend Files (JANGAN break)

```
apps/api/src/
├── index.ts                    → Hono entry, port 3005
├── lib/
│   ├── env-loader.ts           → env validation
│   └── supabase.ts             → Supabase service_role client
├── middleware/
│   ├── auth.ts                 → JWT verification, sets c.get('user')
│   ├── error-handler.ts        → global error catch
│   ├── logger.ts               → structured JSON logging
│   └── request-id.ts           → X-Request-Id generation
└── routes/
    ├── auth.routes.ts          → register, login, logout, me (DONE)
    ├── ai.routes.ts            → STUB (501) — REPLACE
    ├── merchant.routes.ts      → STUB (501) — REPLACE
    └── food.routes.ts          → STUB (501) — REPLACE
```

Baca file-file existing ini dulu untuk pahami pattern dan conventions yang dipakai.

## Task 1: LLM Client Setup

**`apps/api/src/lib/llm-client.ts`:**

```typescript
/**
 * OpenAI-compatible LLM client pointing to 9router endpoint.
 * Uses fetch (no SDK needed) with model 'cheapest' (Gemini Flash 3, multimodal).
 */
```

- Base URL from env: `LLM_API_BASE_URL` (http://127.0.0.1:20128/v1)
- API key from env: `LLM_API_KEY`
- Model from env: `LLM_MODEL` (default: "cheapest")
- Method: `chatCompletion(messages, options?)` — POST to `/chat/completions`
- Support image input via base64 data URLs in content array
- Timeout: 30 seconds
- Return typed response

Test endpoint exists dan works:
```bash
curl http://127.0.0.1:20128/v1/models -H "Authorization: Bearer sk-ecbf6cc546f7068c-35xjdj-e2e17dee"
```

## Task 2: AI Listing Service

**`apps/api/src/services/ai-listing.service.ts`:**

Core function: `generateListingFromPhoto(imageBase64: string, originalPrice: number): Promise<AIListingResult>`

System prompt (Indonesian, instructs JSON output):
```
Kamu adalah ahli makanan Indonesia. Analisis foto makanan ini dan berikan informasi dalam format JSON berikut:

{
  "name": "Nama makanan dalam bahasa Indonesia (singkat, jelas, menggugah selera)",
  "description": "Deskripsi 1-2 kalimat yang menggugah selera dalam bahasa Indonesia",
  "category": "Salah satu dari: nasi, mie, lauk, kue, minuman, snack, lainnya",
  "estimated_freshness_hours": "Perkiraan berapa jam makanan ini masih layak dikonsumsi (number)"
}

Aturan:
- Nama harus spesifik (bukan "makanan" atau "hidangan")
- Deskripsi harus menggugah selera dan informatif
- Kategori harus akurat berdasarkan jenis makanan
- Jawab HANYA JSON, tanpa teks tambahan
```

After LLM returns:
1. Parse JSON response (handle parse errors — retry once)
2. Calculate pricing using `calculatePricing()` from `@ludes/shared`:
   ```typescript
   import { calculatePricing } from "@ludes/shared";
   const pricing = calculatePricing(originalPrice, category, 2); // default 2 hours before close
   ```
3. Generate marketing caption (can be part of same LLM call or separate)
4. Return `AIListingResult` type from `@ludes/shared`

Error handling:
- LLM timeout → throw with message "AI sedang sibuk, coba lagi"
- Invalid JSON from LLM → retry once, then throw
- Image too large → throw with guidance

## Task 3: Replace AI Route Stub

**`apps/api/src/routes/ai.routes.ts`** — REPLACE the 501 stub:

```
POST /api/ai/generate-listing
  Auth required (merchant only — check user.role === 'merchant')
  Body: { image: string (base64), original_price: number }
  Validate with zod
  Rate limit: 10 requests per minute per user (simple in-memory counter)
  Call generateListingFromPhoto()
  Return: { name, description, category, pricing: { suggested_min, suggested_max, discount_pct, floor_price }, marketing_caption }
```

Also create `apps/api/src/routes/ai.validators.ts` with zod schemas for input validation.

## Task 4: Replace Merchant Routes Stub

**`apps/api/src/routes/merchant.routes.ts`** — REPLACE the 501 stub:

```
GET /api/merchants/me
  Auth required
  Get merchant profile by user_id from context
  If no profile → 404 { error: "Belum punya profil warung" }
  Return: merchant profile data

POST /api/merchants
  Auth required (role must be 'merchant')
  Body: { name, address, phone, description?, latitude, longitude }
  Validate with merchantSchema from @ludes/shared
  Check if profile already exists (user_id unique) → 409 if exists
  Insert into merchants table
  Return: created merchant profile

PUT /api/merchants/me
  Auth required
  Body: partial merchant fields
  Update merchant profile for current user
  Return: updated merchant profile
```

Create `apps/api/src/routes/merchant.validators.ts`.

## Task 5: Replace Food Routes Stub

**`apps/api/src/routes/food.routes.ts`** — REPLACE the 501 stub:

```
GET /api/food
  Public (no auth required)
  Query params: ?category=&sort=distance|price|date&limit=&offset=&lat=&lng=
  Default sort: created_at DESC
  Join with merchants table to include merchant info
  Only return status='available' items
  Paginate (default limit 20, max 100)
  Return: { data: FoodItem[], total: number }

GET /api/food/my
  Auth required (merchant)
  Get all food items for current merchant (including sold_out)
  Order by created_at DESC
  Return: { data: FoodItem[] }

GET /api/food/:id
  Public
  Get single food item with merchant join
  404 if not found

POST /api/food
  Auth required (merchant)
  Body: FoodItemInput (from @ludes/shared foodItemSchema) + merchant_id (from user's profile)
  Server-side validation: final_price >= floor_price (60% of original_price)
  Insert into food_items table
  Return: created food item

PUT /api/food/:id
  Auth required (merchant, own items only)
  Body: partial food item fields
  Verify ownership (merchant_id matches user's profile)
  Re-validate floor price if original_price or final_price changed
  Return: updated food item

DELETE /api/food/:id
  Auth required (merchant, own items only)
  Verify ownership
  Delete from food_items
  Return: { message: "Food item deleted" }

PATCH /api/food/:id/status
  Auth required (merchant, own items only)
  Body: { status: 'available' | 'sold_out' }
  Verify ownership
  Update status
  Return: updated food item
```

Create `apps/api/src/routes/food.validators.ts`.

## Task 6: Register Routes in index.ts

Update `apps/api/src/index.ts` to use the real route implementations instead of stubs. Make sure all route groups are properly mounted:

```
app.route('/api/auth', authRoutes)
app.route('/api/merchants', merchantRoutes)
app.route('/api/food', foodRoutes)
app.route('/api/ai', aiRoutes)
```

## Constraints

- **JANGAN sentuh `apps/web/`** — session paralel mengerjakan frontend
- **JANGAN modify `packages/shared/`** — shared types sudah final
- **JANGAN modify root config files**
- **JANGAN jalankan `pnpm install`** — dependencies sudah ter-install
- **JANGAN kill existing processes** di port lain
- **JANGAN commit**
- Follow AGENTS.md coding style — English comments, semantic naming, TypeScript strict
- Backend runs on **port 3005**
- All error messages in Bahasa Indonesia for user-facing messages, English for logs

## Acceptance Criteria

1. `pnpm --filter api typecheck` — no TypeScript errors
2. `pnpm --filter api build` — builds without error (or at least typecheck passes)
3. Dev server starts on port 3005
4. `GET /api/health` → 200 OK
5. Auth routes still work (register, login, me)
6. `POST /api/ai/generate-listing` with valid base64 image + price → returns AI listing result
7. `POST /api/merchants` with valid body → creates merchant profile
8. `GET /api/merchants/me` → returns created profile
9. `POST /api/food` with valid body → creates food item
10. `GET /api/food` → returns food items list
11. `GET /api/food/my` (with merchant auth) → returns merchant's food items
12. `PUT /api/food/:id` → updates food item
13. `PATCH /api/food/:id/status` → toggles status
14. `DELETE /api/food/:id` → deletes food item
15. Floor price validation rejects final_price < 60% of original_price
16. Rate limiting works on AI endpoint

## Report Back

- Files created/modified (complete list)
- Test results (curl commands + responses)
- Typecheck result
- Blockers or issues found
- Recommendations for next batch
