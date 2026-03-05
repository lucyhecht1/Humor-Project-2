# Project rules for Claude

## Hard constraints — never violate these

- **No RLS / policy changes.** Do not write, suggest, or run any SQL that creates,
  alters, or drops Row Level Security policies or roles in Supabase. The existing
  policies on `profiles`, `images`, and `captions` are intentional and must not
  be touched.
- **No migrations.** Do not create or modify Supabase migration files. Schema
  changes are managed outside this codebase.
- **No service-role key.** `SUPABASE_SERVICE_ROLE_KEY` is not in `.env.example`
  and must not be added. All data access uses the anon key so that RLS is
  always enforced.

## Existing Supabase tables (read/write via anon key + RLS)

| Table      | Notes                              |
|------------|------------------------------------|
| `profiles` | One row per auth user (`id` = auth UID) |
| `images`   | Image metadata, linked to profiles |
| `captions` | Captions linked to images          |

## How admin gating works

Authentication is enforced at two layers so neither can be bypassed alone:

### Layer 1 — Middleware (`src/middleware.ts`)
Runs on every request before the page renders. Uses `supabase.auth.getUser()`
(a server-side JWT verification, not a client-side cookie read) to check the
session. Unauthenticated requests to `/admin/*` are redirected to `/login`.
Already-authenticated users hitting `/login` are redirected to `/admin`.

### Layer 2 — Server Component (`src/app/admin/page.tsx`)
Even if middleware is bypassed, the Server Component calls `getUser()` again and
calls `redirect('/login')` if there is no session. This is the defence-in-depth
check.

### Auth flow

```
/login
  └─ "Continue with Google" button
       └─ supabase.auth.signInWithOAuth({ provider: 'google',
            redirectTo: '<origin>/auth/callback' })
             └─ /auth/callback (route handler)
                  └─ supabase.auth.exchangeCodeForSession(code)
                       └─ redirect → /admin
```

### Logout

A `POST /logout` route handler calls `supabase.auth.signOut()` and redirects
to `/login` (HTTP 303).

## Key files

```
src/
  middleware.ts                   Session refresh + /admin guard
  lib/supabase/
    client.ts                     Browser client (Client Components)
    server.ts                     Server client (Server Components / Route Handlers)
  app/
    login/page.tsx                Google OAuth login page
    auth/callback/route.ts        OAuth code-exchange handler
    logout/route.ts               Sign-out handler
    admin/page.tsx                Protected admin shell
```
