import type { CanonicalFlight, CanonicalTrain, CanonicalBus, TransportSearchQuery } from '@/domain/transport';
import type { Hotel } from '@/domain/hotel';
import type { NearbyPlace } from '@/domain/nearby';

export interface FlightAdapter {
  search(query: TransportSearchQuery): Promise<CanonicalFlight[]>;
}

export interface TrainAdapter {
  search(query: TransportSearchQuery): Promise<CanonicalTrain[]>;
}

export interface BusAdapter {
  search(query: TransportSearchQuery): Promise<CanonicalBus[]>;
}

export interface HotelAdapter {
  search(params: {
    city: string;
    checkin: string;
    checkout: string;
    guests: number;
    maxPriceInr?: number;
  }): Promise<Hotel[]>;
}

export interface PlacesAdapter {
  nearby(params: {
    lat: number;
    lng: number;
    radiusMeters?: number;
    categories?: NearbyPlace['category'][];
    maxPerCategory?: number;
  }): Promise<NearbyPlace[]>;
}

export interface AdapterBundle {
  flights: FlightAdapter;
  trains: TrainAdapter;
  buses: BusAdapter;
  hotels: HotelAdapter;
  places: PlacesAdapter;
}
