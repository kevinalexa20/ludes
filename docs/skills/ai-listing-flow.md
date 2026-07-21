# Skill: AI Listing Generation (Foto → Listing)

**Context:** The core AI feature. Merchant uploads a food photo, LLM (Gemini Flash 3 via 9router) generates listing content. This is the primary demo feature for the challenge.

## Key Rules

1. LLM call happens server-side only (Hono). Frontend sends base64 image, never calls LLM directly.
2. LLM endpoint: `http://127.0.0.1:20128/v1` (OpenAI-compatible API, model: `cheapest`).
3. Image must be compressed before sending to LLM (max 1024px, JPEG quality 80%).
4. System prompt must be in Indonesian and instruct structured JSON output.
5. Pricing suggestion is computed server-side using rule-based heuristics, NOT by LLM.
6. Floor price (60% of original) is hardcoded in server code — LLM cannot override.
7. Rate limit: 10 requests per minute per user to prevent abuse.

## Flow

```
1. Merchant uploads photo (FE compresses to max 1024px)
2. FE: POST /api/ai/generate-listing { image: base64, original_price: number }
3. BE: Validate input (zod schema)
4. BE: Check rate limit
5. BE: Call LLM with system prompt + image
6. BE: Parse LLM response into { name, description, category }
7. BE: Calculate pricing suggestion using @ludes/shared calculatePricing()
8. BE: Return complete listing suggestion to FE
9. FE: Pre-fill form with AI results
10. Merchant reviews, edits, sets final price, submits
```

## System Prompt Template

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

## Pricing Calculation (Server-Side)

After LLM returns category, pricing is calculated:

```typescript
import { calculatePricing } from "@ludes/shared";

const pricing = calculatePricing(
  originalPrice,  // from merchant input
  category,       // from LLM response
  hoursBeforeClose // estimated, default 2
);
// Returns: { suggestedMin, suggestedMax, discountPct, floorPrice }
```

## Error Handling

- **LLM timeout (>30s):** Return error "AI sedang sibuk, coba lagi"
- **LLM returns invalid JSON:** Retry once, then return error
- **Image too large:** Compress before sending, return error if still too large
- **Rate limit exceeded:** Return 429 with retry-after header

## Related Files

- `apps/api/src/services/ai-listing.service.ts` — core AI service
- `apps/api/src/lib/llm-client.ts` — 9router API client
- `apps/api/src/routes/ai.routes.ts` — API endpoint
- `packages/shared/src/constants.ts` — pricing rules + calculatePricing()
- `packages/shared/src/types.ts` — AIListingResult type
