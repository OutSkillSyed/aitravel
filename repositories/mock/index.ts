import { randomUUID } from 'node:crypto';

import type { Trip, PlannerOutput } from '@/domain/trip';
import type { Hotel } from '@/domain/hotel';
import type { NearbyPlace } from '@/domain/nearby';
import type { Search } from '@/domain/search';
import type { Booking } from '@/domain/booking';
import type { Alert } from '@/domain/alert';
import type { PriceHistory } from '@/domain/price-history';
import type { User, Traveller } from '@/domain/user';
import type { Notification } from '@/domain/notification';

import {
  MOCK_ALERTS,
  MOCK_HOTELS,
  MOCK_PRICE_HISTORY,
  MOCK_TRAVELLERS,
  MOCK_USER,
  buildNearbyFor,
} from './seed';
import type {
  AlertRepo,
  BookingRepo,
  HotelRepo,
  NearbyRepo,
  NotificationRepo,
  PriceHistoryRepo,
  RepoBundle,
  SearchRepo,
  TravellerRepo,
  TripRepo,
  UserRepo,
} from '../types';

const now = () => new Date().toISOString();

class MemTripRepo implements TripRepo {
  private store = new Map<string, Trip>();

  async create(
    input: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'itinerary_json' | 'status'>,
  ): Promise<Trip> {
    const trip: Trip = {
      ...input,
      id: randomUUID(),
      itinerary_json: null,
      status: 'planning',
      created_at: now(),
      updated_at: now(),
    };
    this.store.set(trip.id, trip);
    return trip;
  }

  async setItinerary(tripId: string, itinerary: PlannerOutput, status: Trip['status'] = 'ready') {
    const existing = this.store.get(tripId);
    if (!existing) throw new Error(`trip ${tripId} not found`);
    const updated: Trip = { ...existing, itinerary_json: itinerary, status, updated_at: now() };
    this.store.set(tripId, updated);
    return updated;
  }

  async findById(id: string) {
    return this.store.get(id) ?? null;
  }

  async listByUser(userId: string) {
    return Array.from(this.store.values()).filter((t) => t.user_id === userId);
  }
}

class MemHotelRepo implements HotelRepo {
  private store = new Map<string, Hotel>(MOCK_HOTELS.map((h) => [h.id, h]));

  async search({ city, maxPriceInr }: { city: string; maxPriceInr?: number }) {
    const norm = city.trim().toLowerCase();
    return Array.from(this.store.values()).filter((h) => {
      if (h.city.toLowerCase() !== norm) return false;
      if (maxPriceInr && h.hotel_json.price_per_night_inr > maxPriceInr) return false;
      return true;
    });
  }

  async findById(id: string) {
    return this.store.get(id) ?? null;
  }

  async upsert(h: Hotel) {
    this.store.set(h.id, h);
  }
}

class MemNearbyRepo implements NearbyRepo {
  private store = new Map<string, NearbyPlace[]>();

  async list(hotelId: string) {
    let cached = this.store.get(hotelId);
    if (!cached) {
      const hotel = MOCK_HOTELS.find((h) => h.id === hotelId);
      if (!hotel) return [];
      cached = buildNearbyFor(hotel);
      this.store.set(hotelId, cached);
    }
    return cached;
  }

  async cache(hotelId: string, places: NearbyPlace[]) {
    this.store.set(hotelId, places);
  }

  async isFresh(hotelId: string, at: Date) {
    const cached = this.store.get(hotelId);
    if (!cached || cached.length === 0) return false;
    return cached.every((p) => new Date(p.ttl_expires_at).getTime() > at.getTime());
  }
}

class MemSearchRepo implements SearchRepo {
  private store: Search[] = [];

  async record(entry: {
    user_id?: string | null;
    search_type: Search['search_type'];
    input_json: Record<string, unknown>;
    results_json?: Record<string, unknown> | null;
  }) {
    const row: Search = {
      id: randomUUID(),
      user_id: entry.user_id ?? null,
      search_type: entry.search_type,
      input_json: entry.input_json,
      results_json: entry.results_json ?? null,
      created_at: now(),
    };
    this.store.unshift(row);
    return row;
  }

  async listRecent(limit = 50) {
    return this.store.slice(0, limit);
  }
}

class MemBookingRepo implements BookingRepo {
  private store = new Map<string, Booking>();

  async create(input: Omit<Booking, 'id' | 'booked_at'>) {
    const booking: Booking = { ...input, id: randomUUID(), booked_at: now() };
    this.store.set(booking.id, booking);
    return booking;
  }

  async listByUser(userId: string) {
    return Array.from(this.store.values()).filter((b) => b.user_id === userId);
  }

  async updateStatus(id: string, status: Booking['status']) {
    const existing = this.store.get(id);
    if (!existing) return null;
    const next: Booking = { ...existing, status };
    this.store.set(id, next);
    return next;
  }
}

class MemAlertRepo implements AlertRepo {
  private store = new Map<string, Alert>(MOCK_ALERTS.map((a) => [a.id, a]));

  async create(input: Omit<Alert, 'id' | 'created_at' | 'last_triggered'>) {
    const alert: Alert = { ...input, id: randomUUID(), last_triggered: null, created_at: now() };
    this.store.set(alert.id, alert);
    return alert;
  }

  async listByUser(userId: string) {
    return Array.from(this.store.values()).filter((a) => a.user_id === userId);
  }

  async trigger(id: string, at: Date) {
    const existing = this.store.get(id);
    if (!existing) return;
    this.store.set(id, { ...existing, last_triggered: at.toISOString() });
  }
}

class MemPriceHistoryRepo implements PriceHistoryRepo {
  private store: PriceHistory[] = [...MOCK_PRICE_HISTORY];

  async record(entry: Omit<PriceHistory, 'id' | 'recorded_at'>) {
    const row: PriceHistory = { ...entry, id: randomUUID(), recorded_at: now() };
    this.store.push(row);
    return row;
  }

  async seriesFor(entity_type: PriceHistory['entity_type'], entity_key: string) {
    return this.store
      .filter((p) => p.entity_type === entity_type && p.entity_key === entity_key)
      .sort((a, b) => (a.recorded_at > b.recorded_at ? 1 : -1));
  }
}

class MemUserRepo implements UserRepo {
  private store = new Map<string, User>([[MOCK_USER.id, MOCK_USER]]);

  async findById(id: string) {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: string) {
    return Array.from(this.store.values()).find((u) => u.email === email) ?? null;
  }
}

class MemTravellerRepo implements TravellerRepo {
  private store: Traveller[] = [...MOCK_TRAVELLERS];

  async listByUser(userId: string) {
    return this.store.filter((t) => t.user_id === userId);
  }
}

class MemNotificationRepo implements NotificationRepo {
  private store = new Map<string, Notification>();

  async create(input: Omit<Notification, 'id' | 'sent_at' | 'is_read'>) {
    const n: Notification = { ...input, id: randomUUID(), is_read: false, sent_at: now() };
    this.store.set(n.id, n);
    return n;
  }

  async listByUser(userId: string) {
    return Array.from(this.store.values()).filter((n) => n.user_id === userId);
  }

  async markRead(id: string) {
    const existing = this.store.get(id);
    if (existing) this.store.set(id, { ...existing, is_read: true });
  }
}

// Singleton bundle — survives for the lifetime of the dev server process.
let bundle: RepoBundle | null = null;

export function mockRepos(): RepoBundle {
  if (!bundle) {
    bundle = {
      trips: new MemTripRepo(),
      hotels: new MemHotelRepo(),
      nearby: new MemNearbyRepo(),
      searches: new MemSearchRepo(),
      bookings: new MemBookingRepo(),
      alerts: new MemAlertRepo(),
      priceHistory: new MemPriceHistoryRepo(),
      users: new MemUserRepo(),
      travellers: new MemTravellerRepo(),
      notifications: new MemNotificationRepo(),
    };
  }
  return bundle;
}
