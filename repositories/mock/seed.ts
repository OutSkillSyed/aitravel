import { randomUUID } from 'node:crypto';

import type { Hotel } from '@/domain/hotel';
import type { User, Traveller } from '@/domain/user';
import type { NearbyPlace } from '@/domain/nearby';
import type { Alert } from '@/domain/alert';
import type { PriceHistory } from '@/domain/price-history';

const now = () => new Date().toISOString();
const future = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

export const MOCK_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@aitravel.app',
  full_name: 'Demo Traveller',
  phone: '+91-9999900000',
  preferences_json: { style: 'adventure', diet: 'vegetarian' },
  created_at: now(),
};

export const MOCK_TRAVELLERS: Traveller[] = [
  {
    id: randomUUID(),
    user_id: MOCK_USER.id,
    first_name: 'Demo',
    last_name: 'Traveller',
    dob: '1995-02-14',
    passport_number: null,
    passport_country: 'IN',
    created_at: now(),
  },
];

export const MOCK_HOTELS: Hotel[] = [
  hotel('Goa', 'The Beach Villa Goa', 15.2799, 73.9143, 4.5, 5800, 'amadeus'),
  hotel('Goa', 'Panjim Heritage Inn', 15.497, 73.8278, 4.2, 3600, 'booking'),
  hotel('Goa', 'Palolem Palms Resort', 15.011, 74.023, 4.7, 8900, 'booking'),
  hotel('Jaipur', 'The Pink Haveli', 26.9124, 75.7873, 4.6, 6400, 'amadeus'),
  hotel('Jaipur', 'Amber Fort Residency', 26.985, 75.851, 4.3, 4200, 'booking'),
  hotel('Udaipur', 'Lake Pichola Boutique', 24.571, 73.6806, 4.8, 9900, 'amadeus'),
  hotel('Udaipur', 'Aravalli View Lodge', 24.595, 73.721, 4.1, 2900, 'booking'),
  hotel('Manali', 'Solang Snow Chalet', 32.2432, 77.1892, 4.4, 5200, 'booking'),
  hotel('Manali', 'Old Manali Cafe Stay', 32.256, 77.186, 4.2, 2400, 'booking'),
  hotel('Kochi', 'Fort Kochi Boathouse', 9.9667, 76.2419, 4.3, 4800, 'amadeus'),
  hotel('Pondicherry', 'White Town Courtyard', 11.9416, 79.8083, 4.5, 5400, 'booking'),
];

function hotel(
  city: string,
  name: string,
  lat: number,
  lng: number,
  rating: number,
  price: number,
  supplier: string,
): Hotel {
  return {
    id: randomUUID(),
    supplier,
    supplier_hotel_id: `${supplier.toUpperCase()}-${name.replace(/\s+/g, '').slice(0, 8)}`,
    name,
    lat,
    lng,
    city,
    star_rating: Math.round(rating),
    hotel_json: {
      photos: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
      ],
      amenities: ['Free WiFi', 'Breakfast included', 'Air conditioning', 'Airport shuttle'],
      description: `${name} — a curated stay in ${city} blending local character with modern comforts.`,
      price_per_night_inr: price,
      rating,
      review_count: 420 + Math.round(price / 50),
      address: `${name}, ${city}, India`,
    },
    created_at: now(),
  };
}

export function buildNearbyFor(hotel: Hotel): NearbyPlace[] {
  const categories: NearbyPlace['category'][] = [
    'restaurant',
    'cafe',
    'shop',
    'pharmacy',
    'transit',
    'attraction',
  ];
  return categories.flatMap((cat, ci) =>
    Array.from({ length: 2 }, (_, i) => ({
      id: randomUUID(),
      hotel_id: hotel.id,
      place_id: `mock-place-${hotel.id.slice(0, 8)}-${cat}-${i}`,
      name: mockPlaceName(cat, hotel.city, i),
      category: cat,
      distance_meters: 80 + ci * 40 + i * 25,
      google_rating: 3.8 + ((ci + i) % 10) * 0.1,
      review_count: 120 + ci * 30 + i * 15,
      open_now: (ci + i) % 3 !== 0,
      price_level: cat === 'restaurant' ? 2 : cat === 'cafe' ? 1 : null,
      lat: hotel.lat + (i - 0.5) * 0.0008,
      lng: hotel.lng + (ci - 2) * 0.0008,
      cached_at: now(),
      ttl_expires_at: future(1),
    })),
  );
}

function mockPlaceName(cat: NearbyPlace['category'], city: string, idx: number): string {
  const templates: Record<NearbyPlace['category'], string[]> = {
    restaurant: ['Spice Route', 'Coastline Grill'],
    cafe: ['Morning Brew', 'Local Beans'],
    shop: ['Artisan Bazaar', 'Heritage Market'],
    pharmacy: ['WellCare Pharmacy', '24x7 Chemist'],
    transit: [`${city} Bus Stand`, `${city} Metro`],
    attraction: ['Heritage Walk', 'Sunset Point'],
  };
  return templates[cat][idx] ?? `${cat} ${idx + 1}`;
}

export const MOCK_ALERTS: Alert[] = [
  {
    id: randomUUID(),
    user_id: MOCK_USER.id,
    entity_key: 'DEL-GOI',
    threshold_inr: 5000,
    alert_type: 'price_drop',
    is_active: true,
    last_triggered: null,
    created_at: now(),
  },
];

export const MOCK_PRICE_HISTORY: PriceHistory[] = Array.from({ length: 20 }, (_, i) => ({
  id: randomUUID(),
  entity_type: 'flight_route',
  entity_key: 'DEL-GOI',
  supplier: 'amadeus',
  price_inr: 5500 + Math.sin(i / 2) * 800,
  baseline_inr: 5500,
  anomaly_score: i === 17 ? -2.6 : (i % 5) * 0.1,
  recorded_at: new Date(Date.now() - (20 - i) * 86_400_000).toISOString(),
}));
