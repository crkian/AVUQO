-- Inert, immutable, private-only validation audit results.
-- No upload endpoint, queue runner, staging or publishing pathway.
create table if not exists public.awin_private_snapshot_validations (
 id uuid primary key default gen_random_uuid(),
 advertiser_id text not null check (advertiser_id='496'),
 feed_id text not null check (feed_id='89987'),
 bucket_id text not null default 'awin-bulk-private-snapshots'
   check (bucket_id='awin-bulk-private-snapshots'),
 object_key text not null check (
   object_key ~ '^awin/496/89987/[a-f0-9]{64}\\.csv\\.gz$'
 ),
 snapshot_sha256 text not null check (snapshot_sha256 ~ '^[a-f0-9]{64}$'),
 actual_rows integer not null check (actual_rows between 1 and 500000),
 compressed_bytes bigint not null check (compressed_bytes between 1 and 262144000),
 expanded_bytes bigint not null check (expanded_bytes between 1 and 1073741824),
 source_columns integer not null check (source_columns=29),
 wrong_merchant_rows integer not null check (wrong_merchant_rows between 0 and 500000),
 wrong_feed_rows integer not null check (wrong_feed_rows between 0 and 500000),
 missing_product_ids integer not null check (missing_product_ids between 0 and 500000),
 duplicate_product_ids integer not null check (duplicate_product_ids between 0 and 500000),
 invalid_price_rows integer not null check (invalid_price_rows between 0 and 500000),
 unverified_affiliate_links integer not null check (unverified_affiliate_links between 0 and 500000),
 missing_titles integer not null check (missing_titles between 0 and 500000),
 out_of_stock_rows integer not null check (out_of_stock_rows between 0 and 500000),
 critical_issues integer not null check (critical_issues between 0 and 3500000),
 currency_verified boolean not null default false check (currency_verified=false),
 rights_verified boolean not null default false check (rights_verified=false),
 ready_to_stage boolean not null default false check (ready_to_stage=false),
 validated_at timestamptz not null default now(),
 constraint awin_private_snapshot_fingerprint_key check (
    object_key='awin/496/89987/'||snapshot_sha256||'.csv.gz'
 ),
 constraint awin_private_snapshot_critical_count check (
    critical_issues=wrong_merchant_rows+wrong_feed_rows+missing_product_ids+
      duplicate_product_ids+invalid_price_rows+unverified_affiliate_links+missing_titles
 )
);
create unique index if not exists awin_private_snapshot_validations_content
 on public.awin_private_snapshot_validations(advertiser_id,feed_id,snapshot_sha256);
alter table public.awin_private_snapshot_validations enable row level security;
revoke all on public.awin_private_snapshot_validations from public,anon,authenticated;
grant select,insert on public.awin_private_snapshot_validations to service_role;
comment on table public.awin_private_snapshot_validations is
 'Append-only private diagnostics; never grants feed-currency approval, image rights, staging or publication.';
