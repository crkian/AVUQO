-- Per-feed evidence on the existing private cron journal. No new public grants.
alter table public.awin_private_cron_attempts
 add column advertiser_id text check(advertiser_id ~ '^[0-9]{2,12}$'),
 add column feed_id text check(feed_id ~ '^[A-Za-z0-9_-]{1,30}$'),
 add column live_verified_rows integer check(live_verified_rows between 0 and 5000),
 add column canonical_accepted integer check(canonical_accepted between 0 and 5000),
 add constraint awin_cron_feed_pair_complete check((advertiser_id is null)=(feed_id is null));
create index awin_cron_portfolio_feed_recent_idx on public.awin_private_cron_attempts
 (advertiser_id,feed_id,started_at desc) where job_key='portfolio_rotation';
