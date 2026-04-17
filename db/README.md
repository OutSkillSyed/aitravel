# Database — Supabase handoff files

These are generated-but-not-applied migrations for Phase 5.

## Files
- `migrations/0001_schema.sql` — 11 tables from doc 1.
- `migrations/0002_rls.sql` — Row-level security policies.
- `migrations/0003_postgis.sql` — PostGIS extension + geography columns + `hotels_within()`.

## Applying

```
supabase link --project-ref <ref>
supabase db push
```

Or run each file in order via the Supabase SQL editor. Double-check the mapping
between `public.users.id` and `auth.users.id` before enabling RLS — the draft
assumes they are identical.

## Mocks → Supabase swap-in

When ready, implement each interface in `repositories/types.ts` inside
`repositories/supabase/`, then point `repositories/index.ts` to that bundle.
