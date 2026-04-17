/**
 * Repository interfaces. Each persistence concern gets one interface, one mock
 * implementation, and (later) one Supabase implementation. Route handlers and
 * services depend ONLY on these interfaces — never on the mock or Supabase code.
 */

import type { Trip, PlannerOutput } from '@/domain/trip';
import type { Hotel } from '@/domain/hotel';
import type { NearbyPlace } from '@/domain/nearby';
import type { Search, SearchType } from '@/domain/search';
import type { Booking } from '@/domain/booking';
import type { Alert } from '@/domain/alert';
import type { PriceHistory } from '@/domain/price-history';
import type { User, Traveller } from '@/domain/user';
import type { Notification } from '@/domain/notification';

export interface TripRepo {
  create(input: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'itinerary_json' | 'status'>): Promise<Trip>;
  setItinerary(tripId: string, itinerary: PlannerOutput, status?: Trip['status']): Promise<Trip>;
  findById(id: string): Promise<Trip | null>;
  listByUser(userId: string): Promise<Trip[]>;
}

export interface HotelRepo {
  search(params: { city: string; maxPriceInr?: number }): Promise<Hotel[]>;
  findById(id: string): Promise<Hotel | null>;
  upsert(hotel: Hotel): Promise<void>;
}

export interface NearbyRepo {
  list(hotelId: string): Promise<NearbyPlace[]>;
  cache(hotelId: string, places: NearbyPlace[]): Promise<void>;
  /** Returns true if cached entries exist and are still within TTL. */
  isFresh(hotelId: string, now: Date): Promise<boolean>;
}

export interface SearchRepo {
  record(entry: {
    user_id?: string | null;
    search_type: SearchType;
    input_json: Record<string, unknown>;
    results_json?: Record<string, unknown> | null;
  }): Promise<Search>;
  listRecent(limit?: number): Promise<Search[]>;
}

export interface BookingRepo {
  create(booking: Omit<Booking, 'id' | 'booked_at'>): Promise<Booking>;
  listByUser(userId: string): Promise<Booking[]>;
  updateStatus(id: string, status: Booking['status']): Promise<Booking | null>;
}

export interface AlertRepo {
  create(alert: Omit<Alert, 'id' | 'created_at' | 'last_triggered'>): Promise<Alert>;
  listByUser(userId: string): Promise<Alert[]>;
  trigger(id: string, at: Date): Promise<void>;
}

export interface PriceHistoryRepo {
  record(entry: Omit<PriceHistory, 'id' | 'recorded_at'>): Promise<PriceHistory>;
  seriesFor(entity_type: PriceHistory['entity_type'], entity_key: string): Promise<PriceHistory[]>;
}

export interface UserRepo {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface TravellerRepo {
  listByUser(userId: string): Promise<Traveller[]>;
}

export interface NotificationRepo {
  create(n: Omit<Notification, 'id' | 'sent_at' | 'is_read'>): Promise<Notification>;
  listByUser(userId: string): Promise<Notification[]>;
  markRead(id: string): Promise<void>;
}

export interface RepoBundle {
  trips: TripRepo;
  hotels: HotelRepo;
  nearby: NearbyRepo;
  searches: SearchRepo;
  bookings: BookingRepo;
  alerts: AlertRepo;
  priceHistory: PriceHistoryRepo;
  users: UserRepo;
  travellers: TravellerRepo;
  notifications: NotificationRepo;
}
