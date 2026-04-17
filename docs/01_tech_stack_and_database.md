# TECH STACK DOCUMENT — Travel Super App

## Frontend
- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui
- State: Zustand + React Query
- Maps: Google Maps JS API embeds + Google Maps deep links
- Icons: Lucide React

## Backend
- Runtime: Node.js 20+
- API Layer: Next.js Route Handlers
- AI Engine: Gemini 3.1 Pro via Google AI SDK
- Auth: Supabase Auth (deferred for now)
- Database: Supabase Postgres + PostGIS (deferred for now)
- Cache: In-memory in dev, Redis later
- Push Notifications: Firebase Cloud Messaging
- Payments: Razorpay / Stripe

## Supplier APIs
- Flights: Amadeus Self-Service API
- Trains: RailYatri API
- Buses: RedBus API
- Hotels: Booking.com Affiliate API
- Nearby Places: Google Places API (New)

## Repository Structure
/app
/app/api
/components
/domain
/services
/adapters
/db
/repositories
/lib
/public

## DATABASE TABLES

### users
- id uuid PK
- email text unique not null
- full_name text
- phone text
- preferences_json jsonb default '{}'
- created_at timestamptz default now()

### travellers
- id uuid PK
- user_id uuid FK -> users.id
- first_name text not null
- last_name text not null
- dob date
- passport_number text
- passport_country text
- created_at timestamptz default now()

### trips
- id uuid PK
- user_id uuid FK -> users.id
- budget_inr numeric not null
- days int not null
- traveller_count int default 1
- origin text not null
- trip_style text
- itinerary_json jsonb
- status text default 'draft'
- created_at timestamptz default now()
- updated_at timestamptz default now()

### trip_options
- id uuid PK
- trip_id uuid FK -> trips.id
- option_type text check in ('best','cheapest','comfort')
- score numeric
- price_total_inr numeric
- breakdown_json jsonb
- option_json jsonb
- created_at timestamptz default now()

### searches
- id uuid PK
- user_id uuid FK -> users.id
- search_type text
- input_json jsonb
- results_json jsonb
- created_at timestamptz default now()

### hotels
- id uuid PK
- supplier text
- supplier_hotel_id text
- name text not null
- lat numeric
- lng numeric
- city text
- star_rating numeric
- hotel_json jsonb
- created_at timestamptz default now()

### nearby_places
- id uuid PK
- hotel_id uuid FK -> hotels.id
- place_id text
- name text not null
- category text
- distance_meters int
- google_rating numeric
- review_count int
- open_now boolean
- price_level int check (price_level between 1 and 4)
- location geometry(POINT,4326)
- cached_at timestamptz default now()
- ttl_expires_at timestamptz

### price_history
- id uuid PK
- entity_type text
- entity_key text
- supplier text
- price_inr numeric
- baseline_inr numeric
- anomaly_score numeric
- recorded_at timestamptz default now()

### alerts
- id uuid PK
- user_id uuid FK -> users.id
- entity_key text
- threshold_inr numeric
- alert_type text
- is_active boolean default true
- last_triggered timestamptz
- created_at timestamptz default now()

### bookings
- id uuid PK
- user_id uuid FK -> users.id
- trip_id uuid FK -> trips.id
- booking_type text check in ('flight','train','bus','hotel')
- supplier_ref text
- amount_inr numeric
- status text default 'pending'
- booking_json jsonb
- booked_at timestamptz default now()

### notifications
- id uuid PK
- user_id uuid FK -> users.id
- title text
- body text
- type text
- is_read boolean default false
- sent_at timestamptz default now()

## Critical Rules
- Supabase is NOT connected yet.
- Generate schema SQL, migrations, TypeScript types, repository interfaces, and mock data only.
- Build everything so Supabase can replace mocks later with minimal changes.
