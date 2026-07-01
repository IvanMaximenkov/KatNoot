create extension if not exists "pgcrypto";

alter table public.users
  add column if not exists telegram_username text,
  add column if not exists last_name text,
  add column if not exists global_role text not null default 'rider',
  add column if not exists home_area text,
  add column if not exists preferred_area text,
  add column if not exists updated_at timestamptz not null default now();

update public.users
set telegram_username = coalesce(telegram_username, username)
where telegram_username is null;

alter table public.users
  drop constraint if exists users_global_role_check;

alter table public.users
  add constraint users_global_role_check
  check (global_role in ('rider', 'verified_organizer', 'super_admin'));

alter table public.clubs
  add column if not exists avatar_url text,
  add column if not exists cover_url text,
  add column if not exists status text not null default 'active',
  add column if not exists created_by_user_id uuid references public.users(id) on delete set null,
  add column if not exists approved_by_user_id uuid references public.users(id) on delete set null,
  add column if not exists approved_at timestamptz,
  add column if not exists rejection_reason text,
  add column if not exists updated_at timestamptz not null default now();

update public.clubs
set avatar_url = coalesce(avatar_url, logo_url)
where avatar_url is null;

alter table public.clubs
  drop constraint if exists clubs_status_check;

alter table public.clubs
  add constraint clubs_status_check
  check (status in ('pending', 'active', 'rejected', 'suspended', 'archived'));

alter table public.club_memberships
  add column if not exists updated_at timestamptz not null default now();

alter table public.club_memberships
  drop constraint if exists club_memberships_role_check;

alter table public.club_memberships
  add constraint club_memberships_role_check
  check (role in ('club_owner', 'club_admin', 'club_organizer', 'club_member', 'banned', 'admin', 'organizer', 'member'));

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null default 'manual'
    check (source_type in ('manual', 'gpx_upload', 'komoot_gpx', 'external_url', 'demo')),
  original_url text,
  file_name text,
  geometry_geojson jsonb,
  encoded_polyline text,
  distance_km numeric,
  elevation_gain_m numeric,
  bbox jsonb,
  created_by_user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_waypoints (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  order_index integer not null,
  lat numeric not null check (lat between -90 and 90),
  lng numeric not null check (lng between -180 and 180),
  name text,
  unique (route_id, order_index)
);

alter table public.rides
  add column if not exists organizer_type text not null default 'club',
  add column if not exists visibility text not null default 'public',
  add column if not exists route_id uuid references public.routes(id) on delete set null,
  add column if not exists elevation_gain_m numeric,
  add column if not exists cancellation_reason text,
  add column if not exists last_changed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.rides
  drop constraint if exists rides_status_check,
  drop constraint if exists rides_organizer_type_check,
  drop constraint if exists rides_visibility_check,
  drop constraint if exists rides_level_check,
  drop constraint if exists rides_ride_type_check;

alter table public.rides
  add constraint rides_status_check
  check (status in ('draft', 'published', 'active', 'cancelled', 'finished', 'archived')),
  add constraint rides_organizer_type_check
  check (organizer_type in ('personal', 'club')),
  add constraint rides_visibility_check
  check (visibility in ('public', 'unlisted', 'private')),
  add constraint rides_level_check
  check (level in ('beginner', 'casual', 'easy', 'intermediate', 'medium', 'advanced', 'hard', 'sport')),
  add constraint rides_ride_type_check
  check (ride_type in ('coffee', 'city', 'training', 'gravel', 'road', 'night', 'social', 'mtb', 'long'));

create table if not exists public.club_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references public.users(id) on delete cascade,
  proposed_name text not null,
  proposed_slug text not null,
  description text not null,
  telegram_url text not null,
  proof_text text not null,
  proof_links text[] not null default '{}',
  city text not null default 'Москва',
  tags text[] not null default '{}',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_comment text,
  reviewed_by_user_id uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists club_applications_one_pending_per_user_idx
  on public.club_applications(applicant_user_id)
  where status = 'pending';

create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('ride', 'club', 'user')),
  target_id uuid not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'rejected')),
  admin_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  entity_type text,
  entity_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.map_points
  add column if not exists geometry_geojson jsonb,
  add column if not exists source text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.map_points
  drop constraint if exists map_points_type_check;

alter table public.map_points
  add constraint map_points_type_check
  check (type in ('bike_lane', 'bike_route', 'a_lane', 'parking', 'repair', 'water', 'dangerous_place', 'meeting_point', 'scenic', 'cafe', 'warning'));

create index if not exists routes_created_by_user_id_idx on public.routes(created_by_user_id);
create index if not exists route_waypoints_route_id_idx on public.route_waypoints(route_id);
create index if not exists rides_route_id_idx on public.rides(route_id);
create index if not exists club_applications_status_idx on public.club_applications(status);
create index if not exists moderation_reports_status_idx on public.moderation_reports(status);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists audit_logs_actor_user_id_idx on public.audit_logs(actor_user_id);

alter table public.routes enable row level security;
alter table public.route_waypoints enable row level security;
alter table public.club_applications enable row level security;
alter table public.moderation_reports enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Public read routes" on public.routes;
drop policy if exists "Public read route waypoints" on public.route_waypoints;
drop policy if exists "Public read club applications" on public.club_applications;
drop policy if exists "Public read moderation reports" on public.moderation_reports;
drop policy if exists "Public read audit logs" on public.audit_logs;
drop policy if exists "Public read notifications" on public.notifications;

create policy "Public read routes" on public.routes for select using (true);
create policy "Public read route waypoints" on public.route_waypoints for select using (true);
create policy "Public read club applications" on public.club_applications for select using (true);
create policy "Public read moderation reports" on public.moderation_reports for select using (true);
create policy "Public read audit logs" on public.audit_logs for select using (true);
create policy "Public read notifications" on public.notifications for select using (true);

comment on table public.club_applications is
  'Club creation requests. Server API validates user and super_admin moderation.';
comment on table public.routes is
  'Ride route geometry from manual builder, GPX upload or external link metadata.';
comment on table public.audit_logs is
  'Important admin and moderation actions created by server API routes.';
