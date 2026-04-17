import type { MetadataRoute } from 'next';

import { clientEnv } from '@/lib/env';
import { getRepos } from '@/repositories';

const CITIES = ['Goa', 'Jaipur', 'Udaipur', 'Manali', 'Kochi', 'Pondicherry'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  const hotels = await getRepos().hotels.search({ city: 'Goa' }).catch(() => []);
  const lastModified = new Date();

  const staticRoutes = [
    '/',
    '/plan',
    '/hotels',
    '/transport',
    '/surprise-me',
    '/profile',
  ];

  return [
    ...staticRoutes.map((p) => ({ url: `${base}${p}`, lastModified })),
    ...CITIES.map((c) => ({ url: `${base}/hotels?city=${c}`, lastModified })),
    ...hotels.map((h) => ({ url: `${base}/hotels/${h.id}`, lastModified })),
  ];
}
