-- 0002_rls.sql — Row Level Security drafts.
-- Assumption: public.users.id mirrors auth.users.id (same UUID) or a mapping
-- table is introduced at handoff. Policies are conservative by default.

alter table public.users enable row level security;
alter table public.travellers enable row level security;
alter table public.trips enable row level security;
alter table public.trip_options enable row level security;
alter table public.searches enable row level security;
alter table public.alerts enable row level security;
alter table public.bookings enable row level security;
alter table public.notifications enable row level security;
-- Catalogue tables — readable by anon, writable only by service role.
alter table public.hotels enable row level security;
alter table public.nearby_places enable row level security;
alter table public.price_history enable row level security;

create policy "users self select"
    on public.users for select using (auth.uid() = id);
create policy "users self update"
    on public.users for update using (auth.uid() = id);

create policy "travellers self"
    on public.travellers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "trips self"
    on public.trips for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "trip_options owner"
    on public.trip_options for select using (
        exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
    );

create policy "searches self select"
    on public.searches for select using (auth.uid() = user_id);
create policy "searches self insert"
    on public.searches for insert with check (auth.uid() = user_id);

create policy "alerts self"
    on public.alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "bookings self"
    on public.bookings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notifications self select"
    on public.notifications for select using (auth.uid() = user_id);
create policy "notifications self update"
    on public.notifications for update using (auth.uid() = user_id);

-- Public catalogue (anon read; service role writes).
create policy "hotels public read" on public.hotels for select using (true);
create policy "nearby public read" on public.nearby_places for select using (true);
create policy "price_history public read" on public.price_history for select using (true);
