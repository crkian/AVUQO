-- Private, non-public recognition ledger. Never stores feed rows, credentials or download URLs.
create table if not exists public.awin_feed_schema_profiles (
 advertiser_id text not null,
 feed_id text not null,
 status text not null check (status in (
  'schema_profiled','schema_probe_quarantined','recognised_specialist_route',
  'feed_not_uniquely_active','inventory_unavailable'
 )),
 recognition_kind text,
 schema_status text,
 schema_reason text,
 schema_delimiter text,
 schema_fields text[] not null default '{}',
 safe_column_names text[] not null default '{}',
 column_count integer not null default 0 check (column_count between 0 and 256),
 error_code text,
 checked_at timestamptz not null default now(),
 primary key(advertiser_id,feed_id),
 constraint awin_schema_profile_advertiser_id_format check (advertiser_id ~ '^[0-9]{1,15}$'),
 constraint awin_schema_profile_feed_id_format check (feed_id ~ '^(F)?[0-9]{1,15}$')
);
alter table public.awin_feed_schema_profiles enable row level security;
revoke all on table public.awin_feed_schema_profiles from public,anon,authenticated;
grant select,insert,update,delete on table public.awin_feed_schema_profiles to service_role;
create index if not exists awin_feed_schema_profiles_checked_at_idx on public.awin_feed_schema_profiles(checked_at);
