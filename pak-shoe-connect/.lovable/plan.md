## Buyer Authentication + Dashboard

Secure email/password login for wholesale buyers, auto-approved, with a business profile stored in Lovable Cloud. Buyers land on a protected `/dashboard` after sign-in.

### Database (one migration)

`public.profiles` — linked to `auth.users(id)` (cascade delete):
- business_name, owner_name, phone, city, address, business_type
- created_at, updated_at (trigger)
- RLS: user can select/insert/update only their own row
- Trigger `on_auth_user_created` → auto-insert profile row from signup metadata

`public.user_roles` + `app_role` enum (`admin`, `buyer`) + `has_role()` SECURITY DEFINER — scaffolding for the admin phase; new signups default to `buyer`.

All tables include GRANTs to `authenticated` + `service_role`.

### Auth config
- Email + password only (no social this turn)
- Auto-confirm email ON (auto-approve flow, no inbox friction)
- Leaked-password (HIBP) protection ON

### Routes
- `/auth` — public. Tabs for Sign in / Sign up. Sign-up collects business profile fields (zod validated) and passes them as `options.data` so the trigger populates `profiles`. `emailRedirectTo: window.location.origin/dashboard`. Redirects to `/dashboard` if already signed in.
- `/_authenticated/route.tsx` — integration-managed gate (redirects to `/auth`).
- `/_authenticated/dashboard.tsx` — buyer dashboard: welcome header with business name, quick actions (Browse Products, Bulk Order, My RFQs placeholder, Contact Sales), profile summary card, sign-out button.
- `/_authenticated/profile.tsx` — edit business profile.

### Header
`site-header.tsx` reads session via `onAuthStateChange`; shows "Sign in" when logged out, account menu (Dashboard, Profile, Sign out) when logged in. Root route wires a single `onAuthStateChange` → `router.invalidate()` listener.

### Sign-out
Cancel queries → clear cache → `supabase.auth.signOut()` → `navigate({ to: '/auth', replace: true })`.

### Out of scope this turn
Admin approval workflow, dealer-registration → account linking, RFQ/orders tables, admin dashboard. `dealer-registration.tsx` stays as the marketing form; buyer signup is the auth path.

### Files
- migration (profiles, user_roles, has_role, handle_new_user trigger, update_updated_at trigger)
- `src/routes/auth.tsx` (new)
- `src/routes/_authenticated/route.tsx` (new — managed gate)
- `src/routes/_authenticated/dashboard.tsx` (new)
- `src/routes/_authenticated/profile.tsx` (new)
- `src/hooks/use-auth.ts` (new — session hook)
- `src/routes/__root.tsx` (add auth-state listener)
- `src/components/site-header.tsx` (session-aware CTA)
- `supabase--configure_auth` call (auto-confirm + HIBP)
