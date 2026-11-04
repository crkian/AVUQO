-- Owner-reviewed Awin publication requires a per-offer release, not merely
-- a source flag or a published_deals.status flip.
-- No advertiser, offer, source or release is activated by this migration.
begin;

create table if not exists public.awin_offer_release_reviews (
 offer_id uuid primary key references public.offers(id) on delete cascade,
 source_id uuid not null references public.sources(id) on delete cascade,
 advertiser_id text not null check (advertiser_id ~ '^[0-9]{2,12}$'),
 status text not null default 'paused' check (status in ('approved','paused')),
 reviewed_price numeric not null check (reviewed_price > 0),
 reviewed_offer_at timestamptz not null,
 reviewed_score_at timestamptz not null,
 approved_by uuid not null references auth.users(id),
 approved_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 review_note text not null default ''
);

create index if not exists awin_release_source_status_idx
 on public.awin_offer_release_reviews (source_id,status);

create table if not exists public.awin_release_audit (
 id uuid primary key default gen_random_uuid(),
 offer_id uuid not null references public.offers(id) on delete cascade,
 source_id uuid not null references public.sources(id) on delete cascade,
 advertiser_id text not null,
 event_type text not null check(event_type in ('published','paused')),
 actor_id uuid not null references auth.users(id),
 occurred_at timestamptz not null default now(),
 review_note text not null default '',
 approved_price numeric,
 offer_checked_at timestamptz
);
create index if not exists awin_release_audit_offer_time_idx
 on public.awin_release_audit (offer_id, occurred_at desc);

alter table public.awin_offer_release_reviews enable row level security;
alter table public.awin_release_audit enable row level security;

-- Only trusted server actions using a service role can read/write the release
-- records. Client roles cannot forge an approval, including admins via REST.
revoke all on public.awin_offer_release_reviews, public.awin_release_audit
 from public, anon, authenticated;
grant all on public.awin_offer_release_reviews,public.awin_release_audit to service_role;

commit;
