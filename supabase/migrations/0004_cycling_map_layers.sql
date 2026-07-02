alter table public.routes
  add column if not exists simplified_geometry_geojson jsonb;

create table if not exists public.cycling_infrastructure (
  id uuid primary key default gen_random_uuid(),
  type text not null check (
    type in ('bike_lane', 'cycling_route', 'a_lane', 'bike_parking', 'repair', 'water', 'danger', 'meeting_point')
  ),
  title text,
  description text,
  geometry_geojson jsonb not null,
  importance text not null default 'medium' check (importance in ('major', 'medium', 'minor')),
  source text not null default 'manual' check (source in ('osm', 'manual', 'demo', 'import')),
  min_zoom numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cycling_infrastructure_type_idx on public.cycling_infrastructure(type);
create index if not exists cycling_infrastructure_importance_idx on public.cycling_infrastructure(importance);
create index if not exists cycling_infrastructure_source_idx on public.cycling_infrastructure(source);

alter table public.cycling_infrastructure enable row level security;

drop policy if exists "Public read cycling infrastructure" on public.cycling_infrastructure;
create policy "Public read cycling infrastructure"
  on public.cycling_infrastructure for select
  using (true);

comment on table public.cycling_infrastructure is
  'Prepared cycling infrastructure GeoJSON. Import is done offline/admin-side, not by runtime Overpass scraping.';
