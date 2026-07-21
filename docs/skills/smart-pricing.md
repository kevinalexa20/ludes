# Skill: Smart Pricing (Rule-Based Suggestion)

**Context:** AI does NOT set prices. Server-side rules suggest a price range. Merchant always controls the final price. Floor price prevents exploitation.

## Key Rules

1. Pricing is rule-based, NOT machine learning. No training data needed.
2. Floor price = 60% of original price. Hardcoded in server. Cannot be overridden by anyone.
3. Category determines max discount: nasi/mie/lauk = 40%, kue/minuman/snack = 50%.
4. Time multiplier: closer to closing time = higher discount allowed.
5. LLM has ZERO involvement in pricing. Only suggests listing content.
6. Merchant sees suggestion but inputs final price manually.

## Pricing Formula

```
1. Get category rule (max discount %)
2. Get time multiplier (how close to closing)
3. Calculate adjusted discount = max_discount × (0.5 + 0.5 × time_multiplier)
4. Calculate floor price = original × 0.6 (NEVER below this)
5. Calculate suggested range = [max(floor, discounted × 0.9), discounted]
6. Display to merchant: "Rekomendasi: Rp X - Rp Y (diskon Z%)"
```

## Category Discount Rules

| Category | Max Discount | Reason |
|---|---|---|
| nasi | 40% | Thin margins, staple food |
| mie | 40% | Thin margins |
| lauk | 40% | Protein costs |
| kue | 50% | Higher margins |
| minuman | 50% | High margins |
| snack | 50% | Higher margins |
| lainnya | 45% | Default |

## Time Multiplier

| Hours Before Close | Multiplier | Effect |
|---|---|---|
| 4+ | 0.0 | Base discount only |
| 3 | 0.25 | Slightly higher |
| 2 | 0.5 | Medium |
| 1 | 0.75 | High urgency |
| 0 | 1.0 | Max discount |

Since UMKM may not have set closing times, default hoursBeforeClose = 2.

## UI Display

```
┌─────────────────────────────────────────┐
│ 💡 Rekomendasi Harga                     │
│                                          │
│ Harga asli: Rp 15.000                   │
│ Saran harga jual: Rp 9.000 - Rp 12.000  │
│ (Diskon 20-40%)                         │
│                                          │
│ Harga lantai: Rp 9.000                  │
│ (Tidak bisa di bawah ini)                │
│                                          │
│ Harga final Anda: [___________]         │
└─────────────────────────────────────────┘
```

## Safety Net

```typescript
// Server-side enforcement — this CANNOT be bypassed
const FLOOR_PRICE_PCT = 0.6;

if (finalPrice < originalPrice * FLOOR_PRICE_PCT) {
  throw new Error("Harga tidak boleh di bawah harga lantai");
}
```

Even if merchant ignores suggestion and tries to set Rp 1.000 for Rp 15.000 food, server rejects it.

## Related Files

- `packages/shared/src/constants.ts` — DISCOUNT_RULES, TIME_MULTIPLIER, FLOOR_PRICE_PCT, calculatePricing()
- `apps/api/src/routes/food.validators.ts` — server-side floor price validation
- `apps/web/src/features/merchant/pages/create-food-page.tsx` — pricing suggestion UI
