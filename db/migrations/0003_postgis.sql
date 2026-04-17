-- 0003_postgis.sql — enable PostGIS and add geography columns + indexes.
create extension if not exists postgis;

alter table public.hotels
    add column if not exists location geography(Point, 4326);

alter table public.nearby_places
    add column if not exists location geography(Point, 4326);

-- Backfill locations from lat/lng when present.
update public.hotels
   set location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
 where location is null and lat is not null and lng is not null;

create index if not exists hotels_location_gix on public.hotels using gist (location);
create index if not exists nearby_location_gix on public.nearby_places using gist (location);

-- Handy function: find hotels within `meters` of a point.
create or replace function public.hotels_within(p_lat double precision, p_lng double precision, p_meters integer)
returns setof public.hotels
language sql stable as $$
    select *
      from public.hotels
     where location is not null
       and ST_DWithin(location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_meters)
     order by ST_Distance(location, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography) asc;
$$;
