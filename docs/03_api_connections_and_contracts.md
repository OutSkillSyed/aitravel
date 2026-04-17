# API CONNECTIONS AND CONTRACTS DOCUMENT

## General Pattern
- Never call supplier APIs directly from the browser
- Pattern: Browser -> Next.js Route Handler -> Supplier API
- Keep API keys in .env.local only
- Every adapter must normalize supplier output into one internal schema

## Environment Variables
AMADEUS_API_KEY=
AMADEUS_API_SECRET=
AMADEUS_BASE_URL=https://test.api.amadeus.com
GOOGLE_PLACES_API_KEY=
GOOGLE_MAPS_API_KEY=
BOOKING_COM_AFFILIATE_ID=
BOOKING_COM_API_KEY=
RAILYATRI_API_KEY=
REDBUS_API_KEY=
GEMINI_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
FCM_SERVER_KEY=

## API 1 — Amadeus Flights
### Auth
- OAuth2 token endpoint: /v1/security/oauth2/token
- Cache token for 30 minutes

### Endpoints
- Inspiration: GET /v1/shopping/flight-destinations
- Cheapest dates: GET /v1/shopping/flight-dates
- Live offers: POST /v2/shopping/flight-offers
- Price confirm: POST /v1/shopping/flight-offers/pricing
- Booking: POST /v1/booking/flight-orders
- Prediction: POST /v1/shopping/flight-offers/prediction

### Canonical flight schema
```json
{
  "source": "amadeus",
  "id": "string",
  "origin": "IATA",
  "destination": "IATA",
  "departureAt": "ISO8601",
  "arrivalAt": "ISO8601",
  "durationMinutes": 0,
  "price_inr": 0,
  "pricePerHour_inr": 0,
  "cabinClass": "economy",
  "seatsAvailable": 0,
  "cancellable": false,
  "raw": {}
}
```

## API 2 — Google Places Nearby Search (New)
### Endpoint
POST https://places.googleapis.com/v1/places:searchNearby

### Required headers
- X-Goog-Api-Key: GOOGLE_PLACES_API_KEY
- X-Goog-FieldMask: places.displayName,places.rating,places.userRatingCount,places.currentOpeningHours,places.priceLevel,places.location,places.primaryType

### Required behavior
- Radius: 50m or 100m
- Rank preference: DISTANCE
- Max result count: 10 per type
- Cache nearby place results for 24 hours

### Canonical nearby place schema
```json
{
  "place_id": "string",
  "name": "string",
  "category": "restaurant|cafe|shop|pharmacy|transit|attraction",
  "distance_meters": 0,
  "google_rating": 0,
  "review_count": 0,
  "open_now": true,
  "price_level": 1,
  "lat": 0,
  "lng": 0
}
```

## API 3 — Gemini 3.1 Pro
### SDK
- @google/generative-ai
- model: gemini-3.1-pro

### Planner contract
Input:
- budget_inr
- origin
- dates or flexibility
- traveller_count
- trip_style
- optional_destinations[]

Output:
```json
{
  "options": [
    {
      "type": "best",
      "total_cost_inr": 0,
      "breakdown": {
        "transport": 0,
        "hotels": 0,
        "food": 0,
        "activities": 0
      },
      "days": [
        {
          "day": 1,
          "location": "string",
          "accommodation": "string",
          "transport": "string",
          "activities": ["string"],
          "estimated_cost": 0
        }
      ]
    }
  ]
}
```

## API 4 — RailYatri
- Search trains via adapter
- Normalize output into transport schema

## API 5 — RedBus
- Search buses via adapter
- Normalize output into transport schema

## API 6 — Booking.com Affiliate
- Search hotels via adapter
- Normalize hotel output into one internal schema

## Error Handling Rules for ALL Adapters
- Timeout: 8 seconds
- Retry: 2 retries with exponential backoff
- Circuit breaker: open after 3 failures in 60 seconds
- Fallback: return empty array, never crash UI
