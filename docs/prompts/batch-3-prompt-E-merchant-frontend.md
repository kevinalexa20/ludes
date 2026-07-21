# Batch 3 — Prompt E: Phase 5 Frontend (Merchant Flow — Profile + Food CRUD + AI Upload)

Kamu masuk ke repo `/home/ubuntu/ludes`, branch `master`.

## Konteks

Ludes — surplus food marketplace untuk UMKM Indonesia. Monorepo pnpm + Turborepo. Backend sudah selesai semua (auth, merchant CRUD, food CRUD, AI listing). Frontend foundation + consumer browse sudah selesai.

Sekarang kamu implementasi **Phase 5 Frontend**: merchant profile creation, food item management (CRUD), dan AI-powered food listing dari foto (3-step upload flow).

**Hanya kerja di `apps/web/`. JANGAN sentuh `apps/api/`.**

Baca WAJIB sebelum mulai:
- `/home/ubuntu/ludes/AGENTS.md`
- `/home/ubuntu/ludes/docs/IMPLEMENTATION-PLAN.md` (Phase 5)
- `/home/ubuntu/ludes/docs/UI-DESIGN-SYSTEM.md` — design system, animation catalog, copywriting, page specs
- `/home/ubuntu/ludes/docs/skills/ai-listing-flow.md` — AI listing generation flow
- `/home/ubuntu/ludes/docs/skills/smart-pricing.md` — pricing suggestion UI

## Existing Frontend Files (understand before modifying)

```
apps/web/src/
├── App.tsx                        → Routes already defined, AuthGuard in place
├── main.tsx                       → Entry point + Toaster
├── index.css                      → Tailwind + design tokens
├── lib/
│   ├── api-client.ts              → api.get/post/put/patch/delete (fetch wrapper)
│   ├── wa-order.ts                → WA URL generator
│   └── location.ts                → Haversine distance
├── features/auth/
│   ├── hooks/use-auth.tsx         → AuthProvider context: user, merchantProfile, isLoggedIn, isMerchant, login, register, logout, refreshUser
│   └── pages/login-page.tsx, register-page.tsx
├── features/browse/
│   ├── hooks/use-food-items.ts    → useFoodItems, useFoodItemById
│   ├── components/category-filter.tsx, food-card.tsx
│   └── pages/food-detail-page.tsx
├── components/layout.tsx          → Navbar + footer
└── pages/
    ├── home-page.tsx              → DONE (browse grid)
    ├── merchant-profile-page.tsx  → PLACEHOLDER — REPLACE
    ├── food-list-page.tsx         → PLACEHOLDER — REPLACE
    └── create-food-page.tsx       → PLACEHOLDER — REPLACE
```

## API Contract (backend already works)

```typescript
// GET /api/merchants/me
// Header: Authorization: Bearer <token>
// Success: Merchant (profile data)
// 404: { error: "Belum punya profil warung" }

// POST /api/merchants
// Header: Authorization: Bearer <token>
// Body: { name, address, phone, description?, latitude, longitude }
// Success: Merchant (created)
// 409: profile already exists

// PUT /api/merchants/me
// Header: Authorization: Bearer <token>
// Body: partial { name?, address?, phone?, description?, latitude?, longitude? }
// Success: Merchant (updated)

// GET /api/food/my
// Header: Authorization: Bearer <token>
// Success: { data: FoodItem[] }

// POST /api/food
// Header: Authorization: Bearer <token>
// Body: { name, description?, category, original_price, final_price, quantity, pickup_time?, picture_url?, status }
// Server validates: final_price >= floor_price (60% of original_price)
// Success: FoodItem (created)

// PUT /api/food/:id
// Header: Authorization: Bearer <token>
// Body: partial food fields
// Success: FoodItem (updated)

// DELETE /api/food/:id
// Header: Authorization: Bearer <token>
// Success: { message: "Food item deleted" }

// PATCH /api/food/:id/status
// Header: Authorization: Bearer <token>
// Body: { status: "available" | "sold_out" }
// Success: FoodItem (updated)

// POST /api/ai/generate-listing
// Header: Authorization: Bearer <token>
// Body: { image: string (base64), original_price: number }
// Success: {
//   name: string,
//   description: string,
//   category: "nasi" | "mie" | "lauk" | "kue" | "minuman" | "snack" | "lainnya",
//   pricing: { suggested_min, suggested_max, discount_pct, floor_price },
//   marketing_caption: string
// }
// Rate limit: 10/min
```

Types `Merchant`, `FoodItem`, `FoodCategory`, `AIListingResult`, `PricingSuggestion` — all in `@ludes/shared`.

## Task 1: Merchant Profile Page

**REPLACE `apps/web/src/pages/merchant-profile-page.tsx`:**

Per UI-DESIGN-SYSTEM.md merchant profile spec:

```
[Back link to home]

[Headline: "Lengkapi Profil Warung Kamu"]
[Subtext: "Cuma butuh 1 menit. Ini info yang pelanggan lihat tentang warung kamu."]

[Form card — bg-white rounded-2xl p-6]:
  - Nama warung (input)
    Helper: "Contoh: Nasi Goreng Pak Budi"
  - Alamat lengkap (textarea, 3 rows)
    Helper: "Alamat lengkap warung kamu"
  - Nomor WhatsApp (input, with +62 prefix display)
    Helper: "Pelanggan akan pesan ke nomor ini"
  - Deskripsi warung (textarea, optional)
    Helper: "Cerita singkat tentang warung kamu (opsional)"

  [Location section]:
    - "Gunakan lokasi saya saat ini" button (geolocation API)
    - Shows "Lokasi terdeteksi: [lat, lng]" after detection
    - Or fallback: manual lat/lng input (collapsible advanced)

  [Primary button: "Simpan Profil Warung"]

[On edit mode — if profile already exists]:
  Same form, pre-filled with existing data
  Button text: "Simpan Perubahan"
  Cancel link back to food list
```

Copy: Bahasa Indonesia per UI-DESIGN-SYSTEM.md.

On success:
- Call `refreshUser()` from useAuth to update merchantProfile in context
- toast.success("Profil warung kamu siap! Sekarang bisa mulai pasang makanan 🎉")
- If creating (not editing): trigger confetti (canvas-confetti)
- Navigate to `/merchant/food`

## Task 2: Food List Page (Merchant Dashboard)

**REPLACE `apps/web/src/pages/food-list-page.tsx`:**

Per UI-DESIGN-SYSTEM.md merchant dashboard spec:

```
[Tab navigation — sticky on mobile]:
  "Makanan Saya" (active) | "Profil" | "Segera Hadir"

  Tab styling:
    Active: border-b-2 border-green-500 text-green-600 font-semibold
    Inactive: text-neutral-400
    "Segera Hadir": text-neutral-300 cursor-not-allowed

[Content area per tab]:

=== Tab "Makanan Saya": ===
  [+ Pasang Makanan Baru] button (green, top-right on desktop)
    → Navigate to /merchant/food/new

  [Food items grid/list]:
    Each item card shows:
    - Thumbnail (small, aspect-square)
    - Name (bold)
    - Final price
    - Original price (strikethrough) + discount badge
    - Status badge: "Tersedia" (green) / "Habis" (gray)
    - Quick actions:
      - Toggle status switch (animated, framer-motion)
      - Edit button → inline edit mode or modal
      - Delete button (with confirm dialog)

    Use LayoutGroup from framer-motion for smooth reordering

  [Empty state]:
    Floating plate illustration (Lucide UtensilsCrossed + gentle y animation)
    "Belum ada makanan yang dipasang."
    "Yuk mulai dengan foto pertamamu!"
    [Pasang Makanan Pertama] CTA button

  Loading: skeleton cards (3 items)

  Fetch data with: api.get<{ data: FoodItem[] }>("/api/food/my")

=== Tab "Profil": ===
  Shows merchant profile info (read from useAuth().merchantProfile)
  [Edit Profil] button → navigate to /merchant/profile

=== Tab "Segera Hadir": ===
  Disabled tab content
  Crystal ball icon (Lucide Sparkles) with gentle y animation
  H2: "Segera Hadir"
  H3: "Prediksi Surplus Harian"
  body text: "AI akan menganalisis pola penjualan kamu dan memprediksi makanan yang akan surplus besok."
  Feature preview cards (grayed):
    "📊 Prediksi berapa porsi yang akan surplus"
    "⏰ Notifikasi sebelum makanan mendekati waktu basi"
    "💰 Saran harga otomatis berdasarkan permintaan"
```

## Task 3: Create Food Page (AI Upload 3-Step Flow)

**REPLACE `apps/web/src/pages/create-food-page.tsx`:**

This is the CORE DEMO FEATURE. Must be seamless and delightful.

Per UI-DESIGN-SYSTEM.md create food spec:

### Step Indicator (always visible)

```
Step indicator row:
  ① Upload Foto ── ② Review ── ③ Harga

  Step circle: w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
    Active: bg-green-500 text-white
    Completed: bg-green-500 text-white + Check icon
    Upcoming: bg-neutral-100 text-neutral-400

  Connector line: h-0.5 flex-1 mx-2
    Completed: bg-green-500
    Upcoming: bg-neutral-200
```

### Step 1: Upload Photo

```
[Headline: "Foto Makanan Kamu"]
[Subtext: "Foto yang jelas bikin AI lebih akurat. Usahakan foto dari atas dan pencahayaan cukup."]

[Upload area — min 300px tall, dashed border]:
  Before upload:
    Center: Camera icon (Lucide) + "Tap untuk foto atau pilih dari galeri"
    Dashed border: border-2 border-dashed border-neutral-300
    Accept: image/jpeg, image/png, image/webp, max 5MB
    Animation: pulse border on hover/drag

  After upload:
    Image preview (zoom-in animation, framer-motion)
    "Ganti foto" button overlay (small, top-right)
    [Lanjut →] button becomes active (was disabled)

Image processing:
  - Compress to max 1024px (width or height) using canvas
  - Convert to base64 JPEG
  - Show file size indicator
```

### Step 2: AI Review & Edit

```
[AI Processing overlay — full screen]:
  Spinner + "AI sedang menganalisis makanan kamu..."
  Animated Sparkles icon (scale + rotate, framer-motion)
  Duration: 2-10 seconds usually

[After AI returns — AnimatePresence slide up]:
  [AI Results card — bg-green-50 border border-green-200 rounded-2xl p-4]:
    "AI sudah bikin listing untuk kamu! ✨"
    Small photo thumbnail on the left

    Form fields (pre-filled from AI):
    - Nama makanan (input)
      Helper: "Edit kalau namanya kurang pas"
    - Deskripsi (textarea, 2 rows)
      Helper: "Deskripsi ini yang dilihat pembeli"
    - Kategori (select/pills)
      Options: Nasi, Mie, Lauk, Kue, Minuman, Snack, Lainnya
      Pre-selected from AI response

  [← Kembali]  [Lanjut ke Harga →]
```

### Step 3: Pricing

```
[Pricing suggestion card — bg-green-50 border border-green-200 rounded-2xl p-4]:
  "💡 Saran Harga dari AI"

  Harga asli:
    Input: "Rp [______]" (user enters this)
    Helper: "Harga normal makanan ini berapa?"

  [After user enters original price]:
    Saran harga jual:
      Display: "Rp [min] - Rp [max]" (calculated client-side or from AI response)
      "(Diskon [X-Y]%)"

    Harga lantai: "Rp [floor]"
      text-xs text-neutral-500
      "Harga minimum untuk melindungi keuntungan kamu"

  Harga final kamu:
    Input: "Rp [______]"
    Helper: "Kamu yang tentukan harga akhirnya"
    Validation: must be >= floor_price

  Jumlah porsi:
    Input number: "___ porsi"
    Min: 1

  Waktu pengambilan:
    Input text: "Contoh: Jam 4-6 sore"
    Helper: "Kapan pembeli bisa ambil?"

[← Kembali]  [Pasang Iklan! 🚀]

On submit:
  POST /api/food with all data
  On success:
    Confetti animation (canvas-confetti) 🎊
    Success card:
      "[Nama makanan] berhasil dipasang!"
      "Pelanggan di sekitar kamu sudah bisa lihat dan pesan"
    Two buttons: [Lihat Listing] [Pasang Lagi]
```

### Pricing Calculation (client-side preview)

When user enters original_price in Step 3, calculate preview locally:
```typescript
import { calculatePricing } from "@ludes/shared";
const pricing = calculatePricing(originalPrice, category, 2);
```

This gives instant feedback before submit. Server also validates.

## Task 4: Image Compression Utility

**`apps/web/src/lib/image-utils.ts`:**

```typescript
/**
 * Compresses an image file to max 1024px and returns base64 JPEG.
 */
const compressImage = (file: File, maxSize = 1024): Promise<string> => { ... }
```

Use HTML5 Canvas API:
1. Create Image object from File
2. Calculate new dimensions (maintain aspect ratio, max 1024px)
3. Draw to canvas
4. Export as JPEG quality 0.85
5. Return base64 string

## Task 5: Confirm Dialog Component

**`apps/web/src/components/confirm-dialog.tsx`:**

Simple modal for delete confirmation:
- Overlay: bg-black/50 backdrop-blur-sm
- Card: bg-white rounded-2xl p-6 max-w-sm
- Title, message, Cancel + Confirm buttons
- Framer Motion: scale + fade entrance
- AnimatePresence for exit

Used in food list page for delete confirmation.

## Constraints

- **JANGAN sentuh `apps/api/`**
- **JANGAN modify `packages/shared/`**
- **JANGAN modify root config files**
- **JANGAN jalankan `pnpm install`**
- **JANGAN commit**
- **JANGAN modify existing completed pages** (home-page, login, register, food-detail-page, browse components)
- Follow AGENTS.md coding style
- Follow UI-DESIGN-SYSTEM.md for ALL visual design, animation, copywriting
- All UI copy in Bahasa Indonesia
- All code comments in English
- Use Framer Motion for animations
- Use Lucide React for icons
- Use react-hot-toast for notifications
- Use canvas-confetti for celebrations

## Acceptance Criteria

1. `pnpm --filter web typecheck` — no TypeScript errors
2. `pnpm --filter web build` — builds successfully
3. Merchant profile page: form renders, fields work, geolocation button works
4. Submit profile → calls POST /api/merchants → success toast + confetti + navigate to food list
5. Edit profile: pre-fills existing data, submits PUT /api/merchants/me
6. Food list page: shows merchant's food items in grid/cards
7. Toggle status: animated switch, calls PATCH /api/food/:id/status
8. Delete: confirm dialog, calls DELETE /api/food/:id
9. Tab navigation works (Makanan Saya / Profil / Segera Hadir)
10. Create food page: 3-step flow works end-to-end
11. Photo upload: file picker works, image preview shows
12. AI processing: loading overlay with animation, calls POST /api/ai/generate-listing
13. AI results: form pre-filled with name, description, category
14. Pricing: original price input → instant pricing suggestion display
15. Submit food: calls POST /api/food → success confetti
16. Image compression works (large photos get compressed before sending)
17. Mobile responsive: all merchant pages work on 375px
18. Coming soon placeholder visible and styled correctly

## Report Back

- Files created/modified (complete list)
- Typecheck + build results
- Issues or blockers
- Recommendations
