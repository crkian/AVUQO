-- Independent shopping release foundation. No automatic grants or public rows.
create table public.awin_shopping_release_reviews (
 offer_id uuid primary key references public.offers(id) on delete restrict,
 source_id uuid not null references public.sources(id) on delete restrict,
 advertiser_id text not null check (advertiser_id ~ '^[0-9]{2,12}$'),
 source_offer_id text not null,
 reviewed_price numeric not null check (reviewed_price > 0 and reviewed_price < 100000000),
 reviewed_currency text not null check (reviewed_currency = 'GBP'),
 reviewed_feed_digest text not null check (reviewed_feed_digest ~ '^[a-f0-9]{64}$'),
 reviewed_offer_at timestamptz not null,
 status text not null default 'withdrawn' check (status in ('approved','withdrawn')),
 approved_by uuid not null,
 approved_at timestamptz not null,
 updated_at timestamptz not null default now(),
 check (left(source_offer_id,length(advertiser_id)+1)=advertiser_id||':' and length(source_offer_id)>length(advertiser_id)+1)
);
alter table public.awin_shopping_release_reviews enable row level security;
revoke all on public.awin_shopping_release_reviews from public, anon, authenticated, service_role;
grant select on public.awin_shopping_release_reviews to service_role;
-- Writes intentionally withheld until the owner approval and audit workflow is implemented.
insert into public.system_controls(control_key,enabled,description)
values ('shopping_publishing',false,'Independent shopping release; disabled until owner approval and end-to-end acceptance.')
on conflict (control_key) do nothing;
