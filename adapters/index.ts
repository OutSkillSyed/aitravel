import { amadeusFlightAdapter } from './amadeus';
import { googlePlacesAdapter } from './google-places';
import { railyatriAdapter } from './railyatri';
import { redbusAdapter } from './redbus';
import { bookingHotelAdapter } from './booking-hotels';
import type { AdapterBundle } from './types';

export const adapters: AdapterBundle = {
  flights: amadeusFlightAdapter,
  trains: railyatriAdapter,
  buses: redbusAdapter,
  hotels: bookingHotelAdapter,
  places: googlePlacesAdapter,
};

export type { AdapterBundle } from './types';
