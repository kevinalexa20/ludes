# Skill: Authentication Flow

**Context:** How auth works in Ludes — merchant-only email/password via Supabase Auth, proxied through Hono.

## Key Rules

1. Frontend NEVER touches Supabase directly. All auth goes through Hono API.
2. Supabase Auth handles password hashing, JWT issuance, session management.
3. `public.users` table mirrors auth.users with additional fields (role, phone, name).
4. JWT token stored in localStorage on frontend, sent as `Authorization: Bearer <token>` header.
5. Hono middleware validates JWT using Supabase JWKS endpoint on every protected route.
6. Only merchants need auth. Consumers browse without login.

## Auth Flow — Register

```
1. FE: POST /api/auth/register { name, email, password, role }
2. BE: Supabase Auth signUp(email, password)
3. BE: Create public.users row (id = auth user id, name, email, role, phone)
4. BE: Return JWT + user data
5. FE: Store JWT in localStorage, set user state
```

## Auth Flow — Login

```
1. FE: POST /api/auth/login { email, password }
2. BE: Supabase Auth signInWithPassword(email, password)
3. BE: Fetch public.users row by user_id
4. BE: Return JWT + user data
5. FE: Store JWT in localStorage, set user state
```

## Auth Flow — Protected Routes

```
1. FE: Send request with Authorization: Bearer <jwt>
2. BE: Auth middleware extracts JWT
3. BE: Verify JWT using supabase.auth.getUser(token)
4. BE: Attach user to request context
5. BE: Handler accesses user from context
6. On failure: return 401
```

## Auth Guard (Frontend)

- Route guard checks: is JWT present + not expired?
- If not authenticated → redirect to `/login`
- If merchant without profile → redirect to `/merchant/profile`
- Consumers can access all public routes without auth

## Merchant Profile Guard

After login, if user role = 'merchant' and no profile exists:
- All merchant routes redirect to `/merchant/profile`
- Must create profile (name, address, phone, location) before accessing food management

## Related Files

- `apps/api/src/routes/auth.routes.ts` — auth endpoint definitions
- `apps/api/src/middleware/auth.ts` — JWT verification middleware
- `apps/api/src/lib/supabase.ts` — service_role client
- `apps/web/src/features/auth/hooks/use-auth.ts` — frontend auth state
- `apps/web/src/lib/api-client.ts` — JWT injection in fetch wrapper
- `packages/shared/src/schemas.ts` — login/register validation schemas
