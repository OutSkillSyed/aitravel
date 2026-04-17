# aitravel — agent notes

Source-of-truth architecture lives in [docs/](docs/). Read those first; this
file summarizes the invariants the codebase must preserve.

## What this project is

Single Next.js 15 App Router app. Takes `{budget_inr, days, origin, traveller_count, trip_style}`
and returns three ranked itineraries — Best / Cheapest / Comfort — each with a
real day-by-day plan priced from live supplier adapters. Gemini writes the
narrative; it never invents a price.

## Where things live

| Concern | Path | Notes |
|---|---|---|
| Pages | [app/](app/) | RSC by default; `'use client'` only where interactive |
| Route handlers | [app/api/](app/api/) | One file per endpoint; use `lib/api.ts` |
| Domain types | [domain/](domain/) | Zod schemas; each of the 11 DB tables has a file |
| Business logic | [services/](services/) | planner, scorer, deal-detector |
| Supplier I/O | [adapters/](adapters/) | Canonical schemas, funnelled through `http.ts` |
| Persistence | [repositories/](repositories/) | Interfaces + mocks; Supabase impl later |
| DB handoff | [db/migrations/](db/migrations/) | Phase-5 SQL (schema, RLS, PostGIS) |
| Shared utils | [lib/](lib/) | env, fonts, utils, api helpers |

## Invariants — do not break

1. **Pricing is deterministic.** The planner assembles prices from adapters,
   then asks Gemini ONLY for the day-by-day narrative. If Gemini is unavailable,
   the template narrative in [services/planner.ts](services/planner.ts) takes over.
2. **Adapters own supplier logic.** Never call `fetch` to a supplier from a
   component or route handler — always go through `adapters/*`.
3. **Adapter policy is centralised.** 8s timeout, 2 retries with exp. backoff,
   circuit breaker at 3 failures / 60s, fallback to `[]`. See
   [adapters/http.ts](adapters/http.ts).
4. **RLS lives in migrations.** Never invent a "bypass auth" path in app code.
   The mock repos intentionally ignore auth during mocks-first.
5. **Strict TypeScript.** No `any`, no `ts-ignore`, `noUncheckedIndexedAccess`
   is on.
6. **Secrets are server-only.** Nothing sensitive may be prefixed
   `NEXT_PUBLIC_`. `lib/env.ts` enforces this at module load.

## Common commands

```bash
npm run dev
npm run typecheck
npm run test
```

## Phase 5 swap-in

Implement [repositories/types.ts](repositories/types.ts) in
[repositories/supabase/](repositories/supabase/), flip the factory in
[repositories/index.ts](repositories/index.ts). UI + route handlers do not
change.
