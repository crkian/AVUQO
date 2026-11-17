-- A content-addressed snapshot may predate a NEW authenticated identical download.
-- Store independent recent download evidence, never fake storage.created_at
-- or mutate immutable full-stream validation results.
create table if not exists public.awin_tooled_up_snapshot_observations (
 advertiser_id text not null check (advertiser_id='496'),
 feed_id text not null check (feed_id='89987'),
 snapshot_sha256 text not null check (snapshot_sha256 ~ '^[a-f0-9]{64}$'),
 compressed_bytes bigint not null check (compressed_bytes > 0 and compressed_bytes <= 50331648),
 observed_at timestamptz not null default now(),
 evidence_kind text not null default 'authenticated_awin_download_and_storage_readback'
   check (evidence_kind='authenticated_awin_download_and_storage_readback'),
 primary key(advertiser_id,feed_id,snapshot_sha256)
);
create index if not exists awin_tooled_up_snapshot_observed_at_idx
 on public.awin_tooled_up_snapshot_observations(observed_at desc);
alter table public.awin_tooled_up_snapshot_observations enable row level security;
revoke all on public.awin_tooled_up_snapshot_observations from public,anon,authenticated;
grant select,insert,update on public.awin_tooled_up_snapshot_observations to service_role;
comment on table public.awin_tooled_up_snapshot_observations is
 'Private receipt of a new authenticated 496:89987 gzip download, matching immutable Storage readback. Same digest may be newly observed. No feed values, URLs or credentials.';
