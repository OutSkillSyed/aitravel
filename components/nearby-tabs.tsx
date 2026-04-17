'use client';

import { DistanceBadge } from '@/components/distance-badge';
import { OpenState } from '@/components/open-state';
import { Rating } from '@/components/rating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { NearbyCategory, NearbyPlace } from '@/domain/nearby';

const categories: NearbyCategory[] = ['restaurant', 'cafe', 'shop', 'pharmacy', 'transit', 'attraction'];

export function NearbyTabs({ places }: { places: NearbyPlace[] }) {
  return (
    <Tabs defaultValue="restaurant" className="mt-4">
      <TabsList>
        {categories.map((c) => (
          <TabsTrigger key={c} value={c} className="capitalize">{c}</TabsTrigger>
        ))}
      </TabsList>
      {categories.map((c) => (
        <TabsContent key={c} value={c}>
          <ul className="grid gap-3 md:grid-cols-2">
            {places
              .filter((p) => p.category === c)
              .sort((a, b) => a.distance_meters - b.distance_meters)
              .map((p) => (
                <li
                  key={p.place_id}
                  className="flex items-start justify-between rounded-xl border border-border bg-surface p-4"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-ink-muted">
                      {p.google_rating != null ? (
                        <Rating value={p.google_rating} reviews={p.review_count ?? undefined} />
                      ) : null}
                      <OpenState open={p.open_now ?? undefined} />
                    </div>
                  </div>
                  <DistanceBadge meters={p.distance_meters} />
                </li>
              ))}
          </ul>
          {places.filter((p) => p.category === c).length === 0 ? (
            <p className="text-sm text-ink-muted">Nothing indexed nearby in this category.</p>
          ) : null}
        </TabsContent>
      ))}
    </Tabs>
  );
}
