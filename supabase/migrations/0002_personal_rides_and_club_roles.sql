update public.rides
set ride_type = 'city'
where ride_type in ('social', 'long_ride');

alter table public.rides
  drop constraint if exists rides_ride_type_check;

alter table public.rides
  add constraint rides_ride_type_check
  check (ride_type in ('coffee', 'city', 'training', 'gravel', 'road', 'night'));

alter table public.rides
  alter column club_id drop not null;

alter table public.rides
  drop constraint if exists rides_club_id_fkey;

alter table public.rides
  add constraint rides_club_id_fkey
  foreign key (club_id) references public.clubs(id) on delete set null;

create table if not exists public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('admin', 'organizer', 'member')),
  created_at timestamptz not null default now(),
  unique (club_id, user_id)
);

create index if not exists club_memberships_club_id_idx on public.club_memberships(club_id);
create index if not exists club_memberships_user_id_idx on public.club_memberships(user_id);

alter table public.club_memberships enable row level security;

drop policy if exists "Public read club memberships" on public.club_memberships;
create policy "Public read club memberships"
  on public.club_memberships for select
  using (true);

comment on table public.club_memberships is
  'Club roles. Only admin and organizer roles can create rides on behalf of a club.';
