create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id text unique,
  username text,
  first_name text not null,
  photo_url text,
  cycling_level text not null default 'casual'
    check (cycling_level in ('beginner', 'casual', 'intermediate', 'advanced', 'sport')),
  bike_type text not null default 'any'
    check (bike_type in ('road', 'gravel', 'mtb', 'city', 'fixed', 'any')),
  preferred_pace_min numeric not null default 16 check (preferred_pace_min >= 5),
  preferred_pace_max numeric not null default 24 check (preferred_pace_max >= preferred_pace_min),
  created_at timestamptz not null default now()
);

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  logo_url text,
  telegram_url text,
  city text not null default 'Москва',
  sport_type text not null default 'cycling' check (sport_type = 'cycling'),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  creator_user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  date_time timestamptz not null,
  start_location_name text not null,
  start_lat numeric not null check (start_lat between -90 and 90),
  start_lng numeric not null check (start_lng between -180 and 180),
  finish_location_name text,
  finish_lat numeric check (finish_lat between -90 and 90),
  finish_lng numeric check (finish_lng between -180 and 180),
  distance_km numeric not null check (distance_km > 0),
  pace_min_kmh numeric not null check (pace_min_kmh > 0),
  pace_max_kmh numeric not null check (pace_max_kmh >= pace_min_kmh),
  level text not null check (level in ('beginner', 'casual', 'intermediate', 'advanced', 'sport')),
  ride_type text not null
    check (ride_type in ('coffee', 'city', 'training', 'gravel', 'road', 'night')),
  bike_type text not null check (bike_type in ('road', 'gravel', 'mtb', 'city', 'fixed', 'any')),
  no_drop boolean not null default false,
  max_participants integer check (max_participants is null or max_participants > 0),
  rules text,
  what_to_bring text,
  route_url text,
  telegram_chat_url text,
  status text not null default 'active' check (status in ('active', 'cancelled', 'finished')),
  created_at timestamptz not null default now()
);

create table if not exists public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('admin', 'organizer', 'member')),
  created_at timestamptz not null default now(),
  unique (club_id, user_id)
);

create table if not exists public.ride_registrations (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'maybe', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (ride_id, user_id)
);

create table if not exists public.map_points (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type text not null check (type in ('bike_lane', 'scenic', 'repair', 'water', 'cafe', 'warning')),
  lat numeric not null check (lat between -90 and 90),
  lng numeric not null check (lng between -180 and 180),
  created_at timestamptz not null default now()
);

create index if not exists rides_date_time_idx on public.rides(date_time);
create index if not exists rides_club_id_idx on public.rides(club_id);
create index if not exists rides_creator_user_id_idx on public.rides(creator_user_id);
create index if not exists club_memberships_club_id_idx on public.club_memberships(club_id);
create index if not exists club_memberships_user_id_idx on public.club_memberships(user_id);
create index if not exists ride_registrations_ride_id_idx on public.ride_registrations(ride_id);
create index if not exists ride_registrations_user_id_idx on public.ride_registrations(user_id);
create index if not exists map_points_type_idx on public.map_points(type);

alter table public.users enable row level security;
alter table public.clubs enable row level security;
alter table public.club_memberships enable row level security;
alter table public.rides enable row level security;
alter table public.ride_registrations enable row level security;
alter table public.map_points enable row level security;

drop policy if exists "Public read users" on public.users;
drop policy if exists "Public read clubs" on public.clubs;
drop policy if exists "Public read club memberships" on public.club_memberships;
drop policy if exists "Public read rides" on public.rides;
drop policy if exists "Public read ride registrations" on public.ride_registrations;
drop policy if exists "Public read map points" on public.map_points;

create policy "Public read users"
  on public.users for select
  using (true);

create policy "Public read clubs"
  on public.clubs for select
  using (true);

create policy "Public read club memberships"
  on public.club_memberships for select
  using (true);

create policy "Public read rides"
  on public.rides for select
  using (true);

create policy "Public read ride registrations"
  on public.ride_registrations for select
  using (true);

create policy "Public read map points"
  on public.map_points for select
  using (true);

comment on table public.users is
  'Mini App users. Server routes validate Telegram initData before creating/updating rows.';
comment on table public.rides is
  'Cycling rides created by riders or club organizers. Writes go through server API with service role key.';
comment on table public.club_memberships is
  'Club roles. Only admin and organizer roles can create rides on behalf of a club.';
