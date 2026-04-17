# aitravel

Budget-first travel super app. Takes a budget + origin, returns a real,
bookable itinerary ranked three ways (**Best / Cheapest / Comfort**) with the
AI planner providing narrative and deterministic adapters providing pricing.

Built per the handoff docs in [`docs/`](./docs). Current phase: **mocks-first**.
Supabase integration is Phase 5.

## Stack

- **Framework:** Next.js 15 (App Router, RSC), TypeScript strict
- **Styling:** Tailwind CSS + shadcn/ui primitives + Adventor-inspired tokens
- **State:** Zustand + React Query (client); Next.js RSC (server)
- **AI:** Gemini via `@google/generative-ai` — narration only
- **Suppliers:** Amadeus (flights, real OAuth2), Google Places (nearby, real),
  RailYatri (mock), RedBus (mock), Booking.com (mock)
- **Persistence:** in-memory mock repositories today; Supabase + PostGIS at handoff
- **Tests:** Vitest (unit), Playwright (smoke, TBD)

## Getting started

```bash
cp .env.example .env.local   # fill in at least GEMINI_API_KEY to get real narrations
npm install
npm run dev                  # http://localhost:3000
```

The app runs fully offline: every supplier adapter has a mock/fallback path. You
can configure real keys (`AMADEUS_*`, `GOOGLE_PLACES_API_KEY`, `GEMINI_API_KEY`)
incrementally — the app continues to work as you layer them in.

## Scripts

```
npm run dev         # next dev
npm run build       # next build
npm run start       # next start
npm run typecheck   # tsc --noEmit
npm run test        # vitest run
npm run lint        # next lint
```

## Folder map

```
app/                # Next.js routes (pages + route handlers)
components/         # UI components (shadcn primitives + app components)
domain/             # Zod schemas + TS types for the 11 DB tables
services/           # planner, scorer, deal-detector
adapters/           # supplier adapters (Amadeus, Places, RailYatri, RedBus, Booking)
repositories/       # interfaces + in-memory mocks; Supabase impls go here at Phase 5
db/                 # Supabase migrations (schema, RLS, PostGIS)
lib/                # env, fonts, api, utils
docs/               # the source-of-truth architecture docs
```

## Non-negotiable invariants

1. Gemini never fabricates pricing. Prices come from adapters. Gemini only writes
   the day-by-day narrative.
2. Every adapter funnels through `adapters/http.ts` so timeouts (8s), retries
   (2x exp. backoff), and circuit breakers (3 failures / 60s) behave identically.
3. Supplier logic never leaks into UI components. UI talks to route handlers or
   repositories, which delegate to services/adapters.
4. API keys are server-only. `NEXT_PUBLIC_` is reserved for non-secret values
   (e.g. the Maps Web API key, which is locked down by HTTP referrer in GCP).

## Handoff checklist (Phase 5)

- [ ] Apply `db/migrations/0001_schema.sql` → `0002_rls.sql` → `0003_postgis.sql`
- [ ] Implement `repositories/supabase/*` for each interface in
      [`repositories/types.ts`](repositories/types.ts)
- [ ] Switch `getRepos()` in [`repositories/index.ts`](repositories/index.ts) to
      return the Supabase bundle
- [ ] Verify RLS by running the app as an anonymous user
- [ ] Turn on Supabase Auth flows
