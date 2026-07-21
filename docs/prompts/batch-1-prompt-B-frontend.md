# Batch 1 — Prompt B: Phase 4 (Frontend Foundation)

Kamu masuk ke repo `/home/ubuntu/ludes`, branch `master`.

## Konteks

Ludes adalah surplus food marketplace untuk UMKM Indonesia. Monorepo (pnpm workspaces + Turborepo) dengan frontend React dan backend Hono. Dependencies sudah ter-install (`pnpm install` sudah jalan).

Kamu hanya mengerjakan **frontend** di `apps/web/`. Jangan sentuh `apps/api/` sama sekali — ada session lain yang mengerjakan backend secara paralel.

Baca file-file ini sebelum mulai (WAJIB):
- `/home/ubuntu/ludes/AGENTS.md` — coding style, conventions, architecture
- `/home/ubuntu/ludes/docs/IMPLEMENTATION-PLAN.md` — lihat Phase 4 untuk detail task
- `/home/ubuntu/ludes/docs/UI-DESIGN-SYSTEM.md` — design system, animation, copywriting, page specs
- `/home/ubuntu/ludes/docs/skills/auth-flow.md` — auth flow detail
- `/home/ubuntu/ludes/docs/PROJECT-OVERVIEW.md` — full product context

Shared types dan schemas sudah tersedia di `packages/shared/src/` — import dari `@ludes/shared`.

## API Contract

Backend session sedang jalan paralel. Gunakan interface contract ini untuk API calls. Backend base URL: `VITE_API_BASE_URL` (default `http://localhost:3001`).

```typescript
// POST /api/auth/register
// Body: { name: string, email: string, password: string, role: "customer" | "merchant", phone?: string }
// Success: { user: User, token: string }
// Error 409: { error: "Email already registered" }
// Error 400: { error: "Validation error", details: [...] }

// POST /api/auth/login
// Body: { email: string, password: string }
// Success: { user: User, token: string }
// Error 401: { error: "Invalid credentials" }

// GET /api/auth/me
// Header: Authorization: Bearer <token>
// Success: { user: User, merchant_profile: Merchant | null }
// Error 401: { error: "Unauthorized" }

// POST /api/auth/logout
// Header: Authorization: Bearer <token>
// Success: { message: "Logged out" }

// GET /api/health
// Success: { status: "ok", timestamp: string }
```

Type `User` dan `Merchant` sudah ada di `@ludes/shared` (`packages/shared/src/types.ts`).

## Task

Implementasi **Phase 4: Frontend Foundation** — Vite + React + TanStack Router + Tailwind + Auth UI + Layout.

## Detail Tasks

### 1. Vite + React + TanStack Setup

**`apps/web/tsconfig.json`:**
- Extend root `../../tsconfig.json`
- `jsx: "react-jsx"`
- Path aliases: `@/*` → `./src/*`
- `lib: ["ES2022", "DOM", "DOM.Iterable"]`

**`apps/web/vite.config.ts`:**
- React plugin
- Tailwind plugin (`@tailwindcss/vite`)
- Path alias resolve: `@` → `./src`
- Dev server: port 5173, proxy `/api` to `http://localhost:3001`

**`apps/web/index.html`:**
- HTML5 boilerplate
- `<div id="root"></div>`
- Google Fonts: Lexend + Plus Jakarta Sans
- Favicon: simple emoji or placeholder
- `<title>Ludes — Makanan Hemat, Dekat Kamu</title>`
- Meta description: "Temukan makanan surplus dari warung terdekat dengan diskon 20-50%"

**`apps/web/src/main.tsx`:**
- `createRoot` + render `<App />`
- Wrap with `<Toaster />` from react-hot-toast

**`apps/web/src/App.tsx`:**
- TanStack Router setup
- Create route tree
- `<RouterProvider />`

### 2. Tailwind CSS Setup

**`apps/web/src/index.css`:**
- `@import "tailwindcss";`
- Custom CSS variables for design tokens (from UI-DESIGN-SYSTEM.md color system)
- Google Fonts import (or link in HTML)
- Base styles: font-family, body background color, smooth scroll

### 3. API Client

**`apps/web/src/lib/api-client.ts`:**
- Fetch wrapper class/functions
- Base URL from `import.meta.env.VITE_API_BASE_URL`
- Auto-attach `Authorization: Bearer <token>` from localStorage
- Methods: `api.get(path)`, `api.post(path, body)`, `api.put(path, body)`, `api.patch(path, body)`, `api.delete(path)`
- On 401 response: clear token, redirect to `/login`
- Return typed JSON responses
- Error handling: throw with error message from response

### 4. Auth State

**`apps/web/src/features/auth/hooks/use-auth.ts`:**
- React context or simple module-level state for auth
- `useAuth()` hook returns: `{ user, merchantProfile, isLoggedIn, isMerchant, login, register, logout, isLoading }`
- `login(email, password)` → POST /api/auth/login → store token in localStorage → set user state
- `register(data)` → POST /api/auth/register → store token → set user state
- `logout()` → clear localStorage → clear state → redirect to `/login`
- On app load: check localStorage for token → if exists, call GET /api/auth/me → set state
- Handle errors with react-hot-toast notifications

### 5. Route Tree + Auth Guard

**Route structure (TanStack Router):**

```
/ → Home page (public)
/login → Login page (public)
/register → Register page (public)
/merchant/ → Merchant layout (auth guard: must be merchant)
  /merchant/profile → Create/edit merchant profile
  /merchant/food → Food items list
  /merchant/food/new → Create food listing (AI upload flow)
```

**Auth guard logic:**
- If route requires auth and user is NOT logged in → redirect to `/login`
- If route is `/merchant/*` and user is merchant but has NO profile → redirect to `/merchant/profile`
- If user IS logged in and tries to access `/login` or `/register` → redirect to `/`

### 6. Auth Pages

**`apps/web/src/features/auth/pages/login-page.tsx`:**

Follow UI-DESIGN-SYSTEM.md spec:
- Centered card on neutral-50 background
- Ludes logo/wordmark at top
- Headline: "Masuk ke Ludes"
- Email input + password input
- Primary button: "Masuk"
- Link: "Belum punya akun? Daftar gratis →"
- Framer Motion: card entrance fade+scale
- Shake animation on error (framer-motion)
- Toast notification on success/error
- Loading state on button while request in-flight

**`apps/web/src/features/auth/pages/register-page.tsx`:**

- Centered card
- Headline: "Daftar di Ludes"
- Name, email, password inputs
- Phone input (optional) with helper text
- Role selector: two side-by-side cards (Pembeli / Pedagang)
  - Pembeli card: 🛒 icon, "Pembeli", "Cari makanan murah di sekitar kamu"
  - Pedagang card: 🏪 icon, "Pedagang", "Jual makanan surplus, kurangi waste, dapat untung"
  - Selected state: green border + green tint + check icon
  - Animation: scale 1.02 on select (framer-motion)
- Primary button: "Daftar"
- Link: "Udah punya akun? Masuk di sini →"
- Toast on success: "Selamat datang di Ludes! 🎉"
- Copy in Bahasa Indonesia (per UI-DESIGN-SYSTEM.md guidelines)

### 7. Shared Layout

**`apps/web/src/components/layout.tsx`:**

**Navbar:**
- Fixed top, backdrop-blur
- Logo "Ludes" left (text-based, green color)
- Nav links center (desktop): Home, Tentang Kami
- Auth buttons right (desktop): Masuk / Daftar (when logged out), username + Logout (when logged in)
- Mobile: hamburger menu icon → slide-in drawer from right
- AnimatePresence for drawer animation
- Becomes solid white on scroll (transparent at top)

**Footer:**
- Ludes logo + tagline: "Makanan hemat, dekat kamu"
- Links: Tentang, Cara Kerja, Untuk Pedagang
- "Dibuat dengan ❤️ untuk UMKM Indonesia"
- Small, minimal

### 8. Home Page (Shell)

**`apps/web/src/pages/home-page.tsx`:**

Simple shell/placeholder for now (Phase 6 will fill in full browse functionality):
- Hero section:
  - Headline: "Makan enak, harga hemat."
  - Subtext: "Selamatkan makanan dari tempat sampah. Temukan makanan surplus dari warung terdekat dengan diskon 20-50%."
  - CTA button: "Cari Makanan Terdekat"
  - Background: gradient green-50 → white
  - Framer Motion: text fade-in, stagger children
- "How It Works" section:
  - 3 steps with Lucide icons:
    1. MapPin icon — "Cari makanan murah di sekitarmu"
    2. UtensilsCrossed icon — "Pilih yang kamu suka"
    3. MessageCircle icon — "Pesan via WhatsApp, ambil langsung"
  - Stagger animation on scroll (framer-motion whileInView)
- Empty food grid placeholder: "Belum ada makanan tersedia. Segera hadir!"

### 9. Placeholder Pages

**`apps/web/src/pages/merchant-profile-page.tsx`:**
- Shell: "Lengkapi Profil Warung Kamu" heading
- Simple text: "Coming soon — will be implemented in Phase 5"
- Layout with back link

**`apps/web/src/pages/food-list-page.tsx`:**
- Shell: "Makanan Saya" heading
- Simple text: "Coming soon — will be implemented in Phase 5"
- Layout with back link

**`apps/web/src/pages/create-food-page.tsx`:**
- Shell: "Pasang Makanan Baru" heading
- Simple text: "Coming soon — will be implemented in Phase 5"
- Layout with back link

### 10. Environment

**`apps/web/.env`:**
```
VITE_API_BASE_URL=http://localhost:3001
```

## Constraints

- **JANGAN sentuh `apps/api/`** — ada session paralel yang kerjain backend
- **JANGAN modify `packages/shared/`** — shared types sudah final
- **JANGAN modify root config files** (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`)
- **JANGAN jalankan `pnpm install`** — dependencies sudah ter-install
- **JANGAN commit** — user yang commit
- Ikuti coding style di `AGENTS.md` — English comments, semantic naming, TypeScript strict
- Ikuti design system di `docs/UI-DESIGN-SYSTEM.md` — colors, typography, animation, copywriting
- Semua copywriting (UI text) dalam **Bahasa Indonesia** percakapan (lihat UI-DESIGN-SYSTEM.md)
- Semua code comments dalam **English**
- Gunakan Framer Motion untuk animasi (lihat animation catalog di UI-DESIGN-SYSTEM.md)
- Gunakan Lucide React untuk icons
- Gunakan react-hot-toast untuk notifications

## Acceptance Criteria

1. `cd /home/ubuntu/ludes && pnpm --filter web dev` — Vite dev server start di port 5173 tanpa error
2. `http://localhost:5173` loads home page dengan hero section
3. Tailwind CSS applied — colors, fonts visible
4. Framer Motion animations working — page transitions, button feedback, stagger
5. Navigate between pages via TanStack Router — no full page reloads
6. `/login` page renders — form visible, inputs work, button clickable
7. `/register` page renders — role selector cards work (click to toggle)
8. Auth guard: visiting `/merchant/profile` without login redirects to `/login`
9. Mobile responsive: resize to 375px — layout adapts, hamburger menu appears
10. `pnpm --filter web typecheck` — no TypeScript errors
11. All copy in Bahasa Indonesia (per UI-DESIGN-SYSTEM.md)
12. Placeholder merchant pages exist

## Report Back

Setelah selesai, laporkan:
- Files yang dibuat/diubah (list lengkap)
- Screenshot or description of rendered pages
- Any routing issues found
- TypeScript typecheck result
- Issues/blockers yang ditemukan
- Anything yang perlu diperhatikan session berikutnya
