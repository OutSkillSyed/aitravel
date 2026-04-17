# Supabase Repositories (Phase 5 handoff)

Reserved directory. Each repository interface in `repositories/types.ts` gets a
concrete Supabase-backed implementation here at Phase 5. Example skeleton:

```ts
// hotels.ts
import { createClient } from '@supabase/supabase-js';
import type { HotelRepo } from '../types';

export function makeSupabaseHotelRepo(): HotelRepo {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  return {
    async search({ city, maxPriceInr }) {
      const q = sb.from('hotels').select('*').eq('city', city);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    // ...
  };
}
```

Then flip `repositories/index.ts` from `mockRepos()` to a function that assembles
these. UI and route-handler code does not change.
