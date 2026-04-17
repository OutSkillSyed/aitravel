/**
 * Booking.com Affiliate adapter — mocked with seed data. When the real API
 * access is approved, replace the body of `search` with a real fetch call.
 * The rest of the app works against `HotelAdapter` so swap is trivial.
 */

import type { Hotel } from '@/domain/hotel';

import type { HotelAdapter } from './types';
import { MOCK_HOTELS } from '@/repositories/mock/seed';

export const bookingHotelAdapter: HotelAdapter = {
  async search({ city, checkin, checkout, maxPriceInr }) {
    const norm = city.trim().toLowerCase();
    const nights = Math.max(
      1,
      Math.round(
        (new Date(checkout).getTime() - new Date(checkin).getTime()) / 86_400_000,
      ),
    );
    const base = MOCK_HOTELS.filter((h) => h.city.toLowerCase() === norm);
    const scaled = base.map<Hotel>((h) => ({
      ...h,
      supplier: 'booking',
      supplier_hotel_id: `BOOKING-${h.supplier_hotel_id}`,
      hotel_json: {
        ...h.hotel_json,
        price_per_night_inr: h.hotel_json.price_per_night_inr,
      },
    }));
    const filtered = maxPriceInr
      ? scaled.filter((h) => h.hotel_json.price_per_night_inr * nights <= maxPriceInr)
      : scaled;
    return filtered;
  },
};
