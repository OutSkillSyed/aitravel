-- 0001_schema.sql — core tables per doc 1.
-- Apply order: 0001 → 0002 (RLS) → 0003 (PostGIS).

create extension if not exists "pgcrypto";

-- users
create table public.users (
    id uuid primary key default gen_random_uuid(),
    email text unique not null,
    full_name text,
    phone text,
    preferences_json jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- travellers
create table public.travellers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    first_name text not null,
    last_name text not null,
    dob date,
    passport_number text,
    passport_country text,
    created_at timestamptz not null default now()
);
create index travellers_user_id_idx on public.travellers(user_id);

-- trips
create table public.trips (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    budget_inr numeric not null check (budget_inr > 0),
    days integer not null check (days > 0),
    traveller_count integer not null default 1 check (traveller_count > 0),
    origin text not null,
    trip_style text,
    itinerary_json jsonb,
    status text not null default 'draft'
        check (status in ('draft', 'planning', 'ready', 'booked', 'cancelled')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index trips_user_id_idx on public.trips(user_id);
create index trips_status_idx on public.trips(status);

-- trip_options
create table public.trip_options (
    id uuid primary key default gen_random_uuid(),
    trip_id uuid not null references public.trips(id) on delete cascade,
    option_type text not null check (option_type in ('best','cheapest','comfort')),
    score numeric not null,
    price_total_inr numeric not null,
    breakdown_json jsonb not null,
    option_json jsonb not null,
    created_at timestamptz not null default now(),
    unique (trip_id, option_type)
);

-- searches
create table public.searches (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.users(id) on delete set null,
    search_type text not null,
    input_json jsonb not null,
    results_json jsonb,
    created_at timestamptz not null default now()
);

-- hotels (public catalogue; no user_id)
create table public.hotels (
    id uuid primary key default gen_random_uuid(),
    supplier text not null,
    supplier_hotel_id text not null,
    name text not null,
    lat numeric not null,
    lng numeric not null,
    city text not null,
    star_rating numeric check (star_rating between 0 and 5),
    hotel_json jsonb not null,
    created_at timestamptz not null default now(),
    unique (supplier, supplier_hotel_id)
);
create index hotels_city_idx on public.hotels(city);

-- nearby_places (cache)
create table public.nearby_places (
    id uuid primary key default gen_random_uuid(),
    hotel_id uuid not null references public.hotels(id) on delete cascade,
    place_id text not null,
    name text not null,
    category text not null,
    distance_meters integer not null,
    google_rating numeric,
    review_count integer,
    open_now boolean,
    price_level integer check (price_level between 1 and 4),
    cached_at timestamptz not null default now(),
    ttl_expires_at timestamptz not null,
    unique (hotel_id, place_id)
);
create index nearby_hotel_idx on public.nearby_places(hotel_id);
create index nearby_ttl_idx on public.nearby_places(ttl_expires_at);

-- price_history
create table public.price_history (
    id uuid primary key default gen_random_uuid(),
    entity_type text not null,
    entity_key text not null,
    supplier text not null,
    price_inr numeric not null,
    baseline_inr numeric not null,
    anomaly_score numeric not null,
    recorded_at timestamptz not null default now()
);
create index price_history_entity_idx on public.price_history(entity_type, entity_key, recorded_at desc);

-- alerts
create table public.alerts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    entity_key text not null,
    threshold_inr numeric not null,
    alert_type text not null,
    is_active boolean not null default true,
    last_triggered timestamptz,
    created_at timestamptz not null default now()
);
create index alerts_user_idx on public.alerts(user_id);

-- bookings
create table public.bookings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    trip_id uuid references public.trips(id) on delete set null,
    booking_type text not null check (booking_type in ('flight','train','bus','hotel')),
    supplier_ref text not null,
    amount_inr numeric not null,
    status text not null default 'pending',
    booking_json jsonb not null default '{}'::jsonb,
    booked_at timestamptz not null default now()
);
create index bookings_user_idx on public.bookings(user_id);

-- notifications
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    title text not null,
    body text not null,
    type text not null,
    is_read boolean not null default false,
    sent_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id);

-- updated_at trigger for trips
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger trips_touch_updated_at
before update on public.trips
for each row execute procedure public.touch_updated_at();
