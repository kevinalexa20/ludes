# Batch 2 — Prompt D: Phase 6 (Consumer Flow — Browse + Detail + WA Order)

Kamu masuk ke repo `/home/ubuntu/ludes`, branch `master`.

## Konteks

Ludes — surplus food marketplace untuk UMKM Indonesia. Monorepo pnpm + Turborepo. Frontend foundation sudah selesai (Phase 4 done): Vite + React + TanStack Router + Tailwind + auth UI + layout + framer-motion.

Kamu hanya mengerjakan **frontend** di `apps/web/`. **JANGAN sentuh `apps/api/`** — ada session paralel yang mengerjakan backend.

Baca WAJIB sebelum mulai:
- `/home/ubuntu/ludes/AGENTS.md`
- `/home/ubuntu/ludes/docs/IMPLEMENTATION-PLAN.md` (Phase 6)
- `/home/ubuntu/ludes/docs/UI-DESIGN-SYSTEM.md` — design system, animation, copywriting, page specs (WAJIB detail)
- `/home/ubuntu/ludes/docs/skills/wa-order-flow.md`
- `/home/ubuntu/ludes/docs/PROJECT-OVERVIEW.md`
- `/home/ubuntu/ludes/packages/shared/src/types.ts` — shared types (FoodItem, Merchant, etc.)

## Existing Frontend Files (understand before modifying)

```
apps/web/src/
├── App.tsx                    → TanStack Router + route tree
├── main.tsx                   → Entry point + Toaster
├── index.css                  → Tailwind + design tokens
├── lib/
│   └── api-client.ts          → Fetch wrapper with JWT
├── features/auth/
│   ├── hooks/use-auth.tsx     → Auth context + hooks
│   └── pages/
│       ├── login-page.tsx
│       └── register-page.tsx
├── components/
│   └── layout.tsx             → Navbar + footer
└── pages/
    ├── home-page.tsx           → Shell placeholder — REPLACE with real browse
    ├── merchant-profile-page.tsx → Placeholder (Phase 5, don't touch)
    ├── food-list-page.tsx        → Placeholder (Phase 5, don't touch)
    └── create-food-page.tsx      → Placeholder (Phase 5, don't touch)
```

## API Contract (backend session sedang jalan paralel)

```typescript
// GET /api/food — public, no auth needed
// Query: ?category=nasi|mie|lauk|kue|minuman|snack|lainnya&sort=distance|price|date&limit=20&offset=0&lat=...&lng=...
// Response: { data: FoodItem[], total: number }
// FoodItem includes: id, merchant_id, merchant: { id, name, address, phone, latitude, longitude },
//   name, description, category, original_price, final_price, quantity,
//   pickup_time, picture_url, status, created_at

// GET /api/food/:id — public
// Response: FoodItem (with merchant joined)
// 404 if not found
```

Types `FoodItem` and `Merchant` already defined in `@ludes/shared` (packages/shared/src/types.ts).

## Task 1: API Hooks for Browse

**`apps/web/src/features/browse/hooks/use-food-items.ts`:**

```typescript
/**
 * Hook to fetch available food items with filter, sort, and pagination.
 */
```

- `useFoodItems(params)` — calls GET /api/food with query params
- `useFoodItemById(id)` — calls GET /api/food/:id
- Loading, error, data states (discriminated union per AGENTS.md)
- Handle empty results gracefully
- Auto-refresh when filters change

## Task 2: Food Card Component

**`apps/web/src/features/browse/components/food-card.tsx`:**

Per UI-DESIGN-SYSTEM.md card spec:
```
bg-white rounded-2xl overflow-hidden shadow-sm
hover:shadow-md transition-shadow duration-200
border border-neutral-100

Image: aspect-[4/3] object-cover w-full
  - Skeleton shimmer while loading
  - Fallback placeholder if no image (use Lucide UtensilsCrossed icon)

Content (p-4):
  - Name: font-semibold line-clamp-1
  - Price row: flex items-center gap-2
    - Original: text-sm text-neutral-400 line-through
    - Final: text-lg font-bold text-neutral-950
    - Discount badge: bg-orange-100 text-orange-500 text-xs font-bold px-2 py-0.5 rounded-full
      Format: "-30%" calculated from (original - final) / original * 100
  - Merchant: text-sm text-neutral-600 + Store icon from lucide-react
  - Distance: text-xs text-neutral-400 + MapPin icon (if lat/lng available)
  - Status badge if sold_out: gray overlay
```

Framer Motion:
- Stagger entrance animation (cards appear one by one)
- `whileTap={{ scale: 0.97 }}` on card click

Click navigates to food detail page.

## Task 3: Category Filter Pills

**`apps/web/src/features/browse/components/category-filter.tsx`:**

- Horizontal scrollable row of pills (overflow-x-auto on mobile)
- Categories: Semua, Nasi 🍚, Mie 🍜, Lauk 🍗, Kue 🍰, Minuman 🥤, Snack 🍪
- Use emoji + label
- Active state: bg-green-500 text-white
- Inactive: bg-neutral-100 text-neutral-600
- Framer Motion: layout animation on active pill change

## Task 4: Replace Home Page with Real Browse

**`apps/web/src/pages/home-page.tsx`** — REPLACE the placeholder:

Per UI-DESIGN-SYSTEM.md home page spec:

**Hero section** (keep from current, enhance):
- Headline: "Makan enak, harga hemat."
- Subtext: "Selamatkan makanan dari tempat sampah. Temukan makanan surplus dari warung terdekat dengan diskon 20-50%."
- CTA: "Cari Makanan Terdekat" → scrolls to food grid
- Gradient bg: green-50 → white
- Framer Motion: text fade-in stagger

**How It Works** (keep from current):
- 3 steps with icons + stagger animation

**Food Grid Section:**
- Search bar: "Cari makanan..." with Search icon (lucide)
- Category filter pills (from Task 3)
- Sort dropdown: Terbaru, Termurah, Terdekat
- Grid: 1 col mobile, 2 tablet, 3-4 desktop
- Food cards (from Task 2)
- Loading: 6 skeleton cards with shimmer
- Empty state: illustration + "Belum ada makanan tersedia di sekitarmu. Coba lagi nanti ya!"
- Pagination: "Muat lebih banyak" button (load more, not numbered)

**Geolocation:**
- Request browser geolocation on page load
- If granted: pass lat/lng to API, show distance
- If denied: don't show distance, sort by date only
- Show subtle toast: "Aktifkan lokasi untuk lihat makanan terdekat"

## Task 5: Food Detail Page

**`apps/web/src/features/browse/pages/food-detail-page.tsx`:**

Per UI-DESIGN-SYSTEM.md food detail spec:

```
[Back button + Share button top]

[Full-width food image]
  - aspect-[4/3] on mobile, aspect-[16/9] on desktop
  - rounded-b-2xl
  - Fallback if no image: large gradient + food icon

[Content — max-w-2xl mx-auto px-4 py-6]:
  - Category badge (small pill, green bg)
  - Name: text-2xl font-bold
  - Status badge (available/sold out)

  - Price section:
    ~~Rp original~~ + discount badge [-X%]
    Rp final_price (text-3xl font-bold)

  - Description paragraph (text-neutral-600)

  - Merchant info card:
    bg-neutral-50 rounded-2xl p-4
    Store icon + merchant name (bold)
    MapPin + address
    "Lihat semua makanan [merchant] →" (link, future)

  - Pickup info:
    Clock icon + "Waktu pengambilan: [pickup_time]"

  [Sticky bottom bar on mobile]:
    bg-white border-t border-neutral-100 p-4
    Full-width WA button:
      bg-[#25D366] text-white font-bold rounded-2xl py-4
      MessageCircle icon + "Pesan via WhatsApp"
      whileTap={{ scale: 0.97 }}

  [Inline on desktop — not sticky]:
    Same WA button, inline in content flow
```

Route: `/food/:foodId` — add to TanStack Router route tree in App.tsx.

## Task 6: WhatsApp Order Utility

**`apps/web/src/lib/wa-order.ts`:**

```typescript
/**
 * Converts Indonesian phone number to international format for wa.me URL.
 * "0812-3456-7890" → "628123456789"
 * "+62 812 3456 789" → "628123456789"
 */
const formatPhoneForWA = (phone: string): string => { ... }

/**
 * Generates WhatsApp order URL with pre-filled message.
 */
const generateWAOrderUrl = (
  foodItem: FoodItem,
  merchant: Merchant,
  quantity: number = 1
): string => { ... }
```

Message template:
```
Halo [merchant name]! 👋

Saya mau pesan dari Ludes:
🍽️ [food name]
📦 [quantity] porsi
💰 Rp [total price formatted with dots]
🕐 Pickup: [pickup_time or "secepatnya"]

Terima kasih!
```

Use `encodeURIComponent` for the message.
Format prices with Indonesian locale: `total.toLocaleString("id-ID")` or manual dot formatting.

## Task 7: Quantity Selector on Detail Page

On food detail page, add a quantity selector before the WA button:
```
[−]  1 porsi  [+]
```
- Min: 1, Max: foodItem.quantity
- Styled buttons (48px tap targets)
- Updates total price display in real-time

## Task 8: Update Router

Add food detail route to App.tsx route tree:
```
/food/:foodId → FoodDetailPage
```

Make sure the layout wraps it properly.

## Constraints

- **JANGAN sentuh `apps/api/`** — session paralel mengerjakan backend
- **JANGAN modify `packages/shared/`** — shared types sudah final
- **JANGAN modify root config files**
- **JANGAN jalankan `pnpm install`** — dependencies sudah ter-install
- **JANGAN modify merchant placeholder pages** (merchant-profile-page, food-list-page, create-food-page) — those are Phase 5
- **JANGAN commit**
- Follow AGENTS.md coding style
- Follow UI-DESIGN-SYSTEM.md for all visual design, animation, and copywriting
- All UI copy in **Bahasa Indonesia** (per UI-DESIGN-SYSTEM.md)
- All code comments in **English**
- Use Framer Motion for animations
- Use Lucide React for icons
- Use react-hot-toast for notifications
- Backend base URL: use `api.get('/food')` from api-client.ts (which prepends base URL)

## Acceptance Criteria

1. `pnpm --filter web typecheck` — no TypeScript errors
2. Home page shows food grid (may show empty state if backend food routes not ready yet)
3. Category filter pills work (visual state change)
4. Sort dropdown works (visual state change)
5. Search bar works (filters locally or via API)
6. Clicking food card navigates to `/food/:foodId` detail page
7. Detail page shows all food info (photo, name, price, merchant, description)
8. Quantity selector works (+ and - buttons)
9. "Pesan via WhatsApp" button generates correct wa.me URL
10. Mobile responsive: bottom sticky WA bar on mobile, inline on desktop
11. Loading skeletons visible while fetching
12. Empty state shown when no food items available
13. Geolocation requested with graceful fallback
14. Framer Motion animations working (card stagger, page transitions)
15. All copy in Bahasa Indonesia

## Report Back

- Files created/modified (complete list)
- Route structure in App.tsx
- Any issues or blockers
- Typecheck result
- Recommendations for next batch
