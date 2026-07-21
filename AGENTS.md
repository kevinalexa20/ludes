# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

Ludes — hyperlocal surplus food marketplace connecting UMKM food vendors (kaki lima, warteg, rumah makan kecil) with budget-conscious consumers. Vendors list surplus food at discount prices before it goes to waste. Consumers find affordable meals nearby. All transactions happen via WhatsApp redirect — no in-app payment.

- **Target:** Indonesian UMKM food vendors (kaki lima, warteg, rumah makan) + budget-conscious consumers
- **Revenue:** Freemium marketplace (free listing, future premium features)
- **Core Loop:** Merchant uploads food photo → AI generates listing + pricing suggest → Consumer browses → Order via WhatsApp redirect
- **Competitive Position:** Budget version of Surplus.id targeting the underserved UMKM segment that Surplus.id does not serve

### Differentiators vs Surplus.id

| Aspect | Surplus.id | Ludes |
|---|---|---|
| Target market | Cafes, bakeries, hotels (mid-up) | Kaki lima, warteg, rumah makan kecil |
| Pricing model | Flat 50% discount | AI-suggested dynamic pricing (merchant controls final price) |
| Platform | Mobile app only (Android + iOS) | Web app (PWA-ready), no install needed |
| Content creation | Manual listing | AI photo-to-listing (name, description, category, pricing) |
| AI integration | None | Generative AI for listing generation + smart pricing |
| Order method | In-app payment (OVO/GoPay/DANA) | WhatsApp redirect (cash on pickup) |

## Auto Skills

Every session, use the following skills to ensure consistency and quality:

- **`pragmatic-arch-v2`** — review architecture, structure, and decision-making before/after implementation
- **`pragmatic-delivery-workflow`** — disciplined execution pipeline for non-trivial tasks

## Project Structure & Module Organization

Monorepo berbasis pnpm workspaces + Turborepo. Frontend SPA (Vite + React + TanStack Router) dan Backend API (Hono) terpisah di `apps/`.

```
ludes/
├── apps/
│   ├── web/           → Vite + React 19 + TypeScript + TanStack Router (frontend)
│   │   └── src/
│   │       ├── main.tsx              # Entry point
│   │       ├── App.tsx               # Root component + router
│   │       ├── features/             # Feature modules (auth, browse, merchant, order)
│   │       ├── components/           # Shared UI components
│   │       ├── hooks/                # Shared custom hooks
│   │       └── lib/                  # API client, utilities, config
│   └── api/           → Hono (backend API)
│       └── src/
│           ├── index.ts              # Hono app entry
│           ├── routes/               # Route handlers (REST)
│           ├── services/             # Business logic + AI integration
│           ├── middleware/            # Auth validation, CORS, logging
│           └── lib/                  # Supabase client (service_role), helpers
├── packages/
│   └── shared/        → @ludes/shared (shared TypeScript types, schemas, constants)
├── docs/              → Decisions, status, plans, skills
└── package.json       → Workspace root
```

### Frontend Feature Module Structure

Every feature module follows a consistent pattern:

```
features/<feature-name>/
├── api/           # API calls (fetch)
├── hooks/         # Custom hooks
├── types/         # TypeScript types & interfaces
├── pages/         # Page-level components
└── components/    # Feature-specific UI components
```

### Backend Route Module Structure

Every route group follows a consistent pattern:

```
routes/<domain>/
├── <domain>.routes.ts      # Hono route definitions
├── <domain>.handlers.ts    # Request handlers
└── <domain>.validators.ts  # Input validation (zod)
```

## Build, Test, and Development Commands

Run `pnpm install` from root before first build.

```bash
# Root (all apps)
pnpm install                         # Install all workspace dependencies
pnpm dev                             # Turbo dev (all apps)
pnpm build                           # Turbo build (all apps)

# Frontend (apps/web)
pnpm --filter web dev                # Vite dev server → localhost:5173
pnpm --filter web build              # tsc -b + vite build
pnpm --filter web lint               # ESLint
pnpm --filter web preview            # Preview production build

# Backend (apps/api)
pnpm --filter api dev                # Hono + hot reload → localhost:3001

# Or from within each app folder
cd apps/web && pnpm dev
cd apps/api && pnpm dev
```

## Architecture — Full BFF (Backend for Frontend)

Frontend has **ZERO Supabase dependency**. All communication goes through Hono API. One data flow path, easy to debug/trace.

```
React (FE)  ──HTTP──→  Hono API (BE)  ──supabase-js──→  Supabase (DB)
                       ──HTTP──→  9router LLM API (AI listing generation)
```

- **Auth:** FE calls `/auth/*` endpoints → Hono proxies to Supabase Auth server-side
- **Data:** FE calls REST endpoints → Hono queries Supabase with `service_role`
- **AI:** FE uploads photo → Hono calls LLM API for listing generation + pricing suggestion
- **Order:** FE generates pre-filled WhatsApp message → opens WA with merchant's number

## Observability & Debugging Strategy

This project does **NOT use a staging environment**. All-in deployment on single VPS. Debugging production issues follows: **Read Logs → Identify Root Cause → Reproduce locally → Fix → Deploy.**

### Structured Logging Convention

Every Hono handler MUST log with consistent structured JSON format. Minimum fields:

```typescript
type LogEntry = {
  readonly timestamp: string; // ISO 8601
  readonly level: "info" | "warn" | "error";
  readonly request_id: string; // unique per request, generated in middleware
  readonly user_id: string | null;
  readonly merchant_id: string | null;
  readonly action: string; // e.g. "food.create", "auth.login", "ai.generate_listing"
  readonly result: "success" | "failure";
  readonly duration_ms: number;
  readonly error?: string; // error message if result === "failure"
  readonly metadata?: Record<string, unknown>; // additional context
};
```

- Use `request_id` generated in Hono middleware, propagated to all handler chains.
- Log level: `info` for happy path, `warn` for recoverable anomalies, `error` for unhandled failures.

### Sensitive Data Redaction Rules

Ludes stores merchant phone numbers and addresses — this data **MUST NOT** appear in logs in raw form when not necessary.

- **OK to log:** `merchant_id`, `food_item_id`, `user_id`, category, price, status, timestamps.
- **DO NOT log:** raw phone numbers (mask last 4 digits), raw addresses, auth tokens, Supabase keys, LLM API keys.
- If debugging phone-related issues, log `phone_last_four` only.

### Error Handling Convention

**Backend (Hono):**

- All unhandled errors caught by global error middleware.
- Error middleware logs full request context (method, path, params, headers minus auth token) + error stack trace.
- Response to client: generic error message + `request_id` only. Client NEVER receives stack trace or internal details.

**Frontend (React):**

- Implement React Error Boundary at route/page level.
- Error boundary captures: current route, last user action.
- Show user-friendly error message with retry option.

### Debugging Workflow (Step-by-Step)

When there's a bug report:

1. **Check logs** — search by `request_id` or filter by `merchant_id` + time range.
2. **Identify root cause** — data issue (unexpected input), infra issue (timeout, connection drop), or logic bug?
3. **Reproduce locally** — create same data scenario in local environment.
4. **Fix & verify** — fix locally, test full flow, then deploy.
5. **Log decision** — append to `docs/decisions.md` if fix involves architecture or convention change.

## Tech Stack

| Layer | Stack |
|---|---|
| **Runtime** | Node.js 22 (pnpm) |
| **Frontend** | React 19, Vite, TypeScript, TanStack Router, Tailwind CSS |
| **Backend** | Hono on Node.js |
| **Database** | Supabase (Postgres + Auth) — service_role via Hono only |
| **AI/LLM** | 9router (Gemini Flash 3, multimodal) via local endpoint |
| **Shared Types** | `@ludes/shared` (workspace package, zod schemas) |
| **Deployment** | All-in VPS, nginx + certbot, `ludes.camuscleansheet.com` |
| **Package Manager** | pnpm workspaces + Turborepo |

## Database Safety & Query Patterns

All database operations go through `supabase-js` with `service_role` key in Hono backend. The following rules apply to all queries.

### Database Safety

- **Never auto-execute** migrations, schema changes, seed scripts, or queries that modify/delete data. Write the file, but let user execute.
- **Always ask first.** Present as suggestion, not action that will run immediately.
- **Code generation OK.** Write migration SQL, schema definition — but don't execute. Explain what it does and hand to user.

### Query Optimization

**Prevent N+1 Queries:**
```typescript
// ❌ N+1 — query per merchant in loop
const foodItems = await supabase.from('food_items').select('*').eq('status', 'available');
for (const item of foodItems.data) {
  const merchant = await supabase.from('merchants').select('*').eq('id', item.merchant_id);
  item.merchant = merchant.data[0];
}

// ✅ Single query with join
const foodItems = await supabase
  .from('food_items')
  .select('*, merchants(*)')
  .eq('status', 'available');
```

**Select Only What You Need:**
```typescript
// ❌ Fetches all columns
const merchants = await supabase.from('merchants').select();

// ✅ Explicit select
const merchants = await supabase
  .from('merchants')
  .select('id, name, address, phone, location');
```

**No Duplicate Queries:** If same data needed in multiple places in one request, fetch once and pass reference.

**Paginate Large Results:** Endpoints that could return >50 rows must paginate. Use Supabase `.range()`.

**Suggest Indexes:** When writing queries with `WHERE`/`.eq()` or `ORDER BY`/`.order()` on non-indexed columns, suggest index creation — don't auto-execute.

## Coding Style & Naming Conventions

TypeScript strict mode. All data must be typed.

- **File & Module Naming:**
  - Components: PascalCase (`FoodCard.tsx`, `MerchantForm.tsx`)
  - Files: kebab-case (`api-client.ts`, `use-auth.ts`)
  - Types/Interfaces: PascalCase, no `I` prefix (`FoodItem`, `Merchant`, not `IFoodItem`)
  - Hooks: `use-` prefix kebab-case (`use-food-items.ts`, `use-auth.ts`)
  - Routes (Hono): `<domain>.routes.ts` (`food.routes.ts`, `auth.routes.ts`)

- **Semantic Naming (names must explain business context, not data type):**
  - **Variables:** descriptive nouns, `camelCase`.
    ```typescript
    // ❌ Vague
    const arr = items.filter(i => i.status === 'available');
    const data = await fetchFood();

    // ✅ Business-context
    const availableItems = items.filter(item => item.status === 'available');
    const nearbyFoodItems = await fetchFood({ sortBy: 'distance' });
    ```
  - **Booleans:** MUST prefix `is`, `has`, `should`, `can`.
    ```typescript
    // ❌ Ambiguous
    const available = true;
    const merchant = false;

    // ✅ Self-evident
    const isAvailable = true;
    const hasMerchantProfile = false;
    const canApplyDiscount = quantity > 0;
    ```
  - **Functions:** verb-first, `camelCase`.
    ```typescript
    // ❌ Noun-only
    const food = (id: string) => supabase.from('food_items').select()...

    // ✅ Clear action verb
    const getFoodItemById = (id: string) => supabase.from('food_items').select()...
    const createFoodListing = (payload: FoodItemInput) => ...
    const validateMerchantAccess = (userId: string, merchantId: string) => ...
    ```
  - **Verb patterns (consistent across codebase):**
    - `get`/`fetch` — retrieve data
    - `create`/`build` — construct new things
    - `update`/`set` — modify existing
    - `delete`/`remove` — remove
    - `validate`/`check` — verify correctness
    - `calculate`/`compute` — derive a value
    - `format`/`transform` — convert shape/representation
  - **Constants:** `UPPER_SNAKE_CASE` for true config constants, `camelCase` for derived values.

- **Frontend CSS:** Tailwind CSS utility classes. Brand-owned, distinctive, non-generic UI.
- **Imports:** Use path aliases (`@/features/*`, `@/components/*`, `@/lib/*`)

### TypeScript Rules

- **Discriminated Unions** over boolean flags — make illegal states unrepresentable.
- **`readonly`** on all type properties by default.
- **No `any`** — use `unknown` + type narrowing if type is uncertain.
- **No `enum`** — use `as const` objects or union types.

```typescript
// BAD
type ListingState = {
  isLoading: boolean;
  error: string | null;
  data: FoodItem | null;
};

// GOOD
type ListingState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: FoodItem }
  | { readonly status: "error"; readonly error: Error };
```

### Code Comments

All comments in **English**. Comments explain *why*, not *what*.

- **JSDoc for exported functions.** Every exported function must have doc comment.
  ```typescript
  /**
   * Generates a food listing from an uploaded photo using LLM vision.
   * Returns name, description, category, and pricing suggestions.
   */
  const generateListingFromPhoto = async (imageBase64: string): Promise<AIListingResult> => { ... };
  ```
- **Inline comments for non-obvious logic only.**
  ```typescript
  // ✅ Explains WHY
  // Floor price prevents merchants from being exploited by AI suggesting
  // prices too low. Hardcoded at 60% of original, not controlled by LLM.
  const floorPrice = Math.ceil(originalPrice * FLOOR_PRICE_PCT);
  ```
- **TODO format:** `// TODO(name): description`

## Environment & Configuration

- `apps/web/.env` — frontend env vars (Vite, `VITE_*` prefix)
- `apps/api/.env` — backend env vars
- Frontend: access via `import.meta.env.VITE_*` — only `VITE_` prefixed vars exposed to client.
- Backend: access via `process.env.*`
- Never hardcode secrets in client-side code.

### Required Environment Variables

**Backend (apps/api/.env):**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWKS_URL=https://xxx.supabase.co/auth/v1/.well-known/jwks.json
LLM_API_BASE_URL=http://127.0.0.1:20128/v1
LLM_API_KEY=sk-...
LLM_MODEL=cheapest
PORT=3001
```

**Frontend (apps/web/.env):**
```
VITE_API_BASE_URL=http://localhost:3001
```

## Core Principles

When principles conflict, prioritize in this order: **Simplicity > Defensive Data > Knowledge Capture**.

### Ruthless Simplicity (YAGNI)

- **Solve today's problem only.** DO NOT write features, variables, or abstractions for future needs that haven't been requested.
- **WET > Wrong DRY.** A little repetition is better than wrong or leaky abstractions.
- **Simplest working solution.** If two approaches solve the same problem, pick the simpler one.

### Defensive Data & Code Style

- "Boring" code > Clever code
- Composition over inheritance
- Immutability default — `readonly`, `.map()/.filter()`, spread
- Pipeline thinking — early returns over nested if/else
- Minimize scope (Least Privilege) — default module-local, only export if needed
- Type-safe boundaries — validate at API edges (Hono middleware), trust internal code
- Hono handlers stay thin — extract business logic to separate functions
- React components stay thin — extract logic to hooks

### Knowledge Capture

- If complex business logic or non-obvious workaround found, save as skill file in `docs/skills/`.
- **Automate over instruct** — prefer scripts/files over verbal instructions.
- Granular, step-by-step approach — minimal implementation first → iterate

## Decision Process

Run this checklist before writing code:

1. **Gather Context** — check `docs/skills/` and related files. See existing patterns before introducing new ones.
2. **Check Architecture** — composition over inheritance. Pipeline thinking.
3. **Leave It Cleaner** — clean up dead code or unclear naming near edit area, but don't scope-creep.
4. **Maintainability Check** — if I disappear tomorrow, can another developer understand this in 5 minutes?

## Development Flow

- One feature → verify → polish
- Comment the WHY, not the what
- Not working? Revert, don't patch
- Readable > optimized (prematurely)
- REMOVE DEAD CODE — no `// removed`, no commented-out code
- Frontend and backend changes for one feature should happen together
- Shared types in `packages/shared/` — define once, use in both apps
- Test the full flow: API → Frontend → UI before marking done

### Task-Specific Guidance

**When Building New Feature:**

1. **Validate scope first.** Ask: "What specific problem to solve right now?" Strip all "while we're at it" additions.
2. **Implement** — follow Core Principles.
3. **Capture knowledge** — if feature involves non-obvious domain logic, create skill file in `docs/skills/`.

**When Refactoring:**

1. **Isolate changes** — refactoring MUST NOT change external behavior.
2. **Script bulk changes** — write migration script for repetitive find-and-replace.
3. **Break God Functions** — functions > 50 lines → break into pure testable functions.

**When Debugging:**

1. **Start from evidence.** Don't guess. Get actual error log or stack trace.
2. **Find leaky abstractions** — framework magic hiding root cause.
3. **Update knowledge** — if bug from domain logic misunderstanding, update skill file.

## Agent Workflow Addendum: Decisions & Status Files

Maintain these files in `docs/`. Process is idempotent and append-only.

- `docs/PROJECT-OVERVIEW.md` — Full product context, features, architecture, DB schema.
- `docs/IMPLEMENTATION-PLAN.md` — Phase-by-phase tracker with checklists and acceptance criteria.
- `docs/UI-DESIGN-SYSTEM.md` — Design system, animation catalog, copywriting guidelines, page specs.
- `docs/decisions.md` — Append-only log of choices made during work.
  - Format: Date, Context, Choice, Rationale, Impact.
  - Policy: Do not rewrite or remove entries; append only.
- `docs/project-status.md` — Consolidated status and running Checklist.
  - Sections: Initial Ask, Checklist, Current Status, Next Steps.
  - Policy: Keep Checklist current; mark with `[ ]` or `[x]`.

### Step-by-Step Flow (each task/session)

1. Read this AGENTS.md to align on scope, style, and constraints.
2. Ensure `docs/decisions.md` exists; append new choices.
3. Ensure `docs/project-status.md` exists; update Checklist and Current Status.
4. Implement planned steps; after each significant choice, append to decisions and sync Checklist.
5. Keep changes minimal and style-compliant.

### Auto-Sync Status (Mandatory)

Always update `docs/decisions.md` and `docs/project-status.md` proactively when:
- Apply code/doc patches, add/remove files, or change behaviors.
- Make architecture/config/infrastructure choices.
- Finalize a mini-milestone.

### Idempotency & Logging

- File creation/updates are append-only; never overwrite existing content.
- Log every significant decision affecting scope, structure, dependencies, or user-facing behavior.
