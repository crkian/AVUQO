-- Minimal versions of seven live ON DELETE CASCADE dependent tables.
-- Synthetic CI only. The actual production tables have richer constraints.
create table public.availability(
 id bigint generated always as identity primary key,
 offer_id uuid references public.offers(id) on delete cascade
);
create table public.awin_offer_release_reviews(
 id bigint generated always as identity primary key,
 offer_id uuid references public.offers(id) on delete cascade
);
create table public.awin_release_audit(
 id bigint generated always as identity primary key,
 offer_id uuid references public.offers(id) on delete cascade
);
create table public.click_events(
 id bigint generated always as identity primary key,
 offer_id uuid references public.offers(id) on delete cascade
);
create table public.deal_scores(
 id bigint generated always as identity primary key,
 offer_id uuid references public.offers(id) on delete cascade
);
create table public.promotion_candidates(
 id bigint generated always as identity primary key,
 offer_id uuid references public.offers(id) on delete cascade
);
create table public.published_deals(
 id bigint generated always as identity primary key,
 offer_id uuid references public.offers(id) on delete cascade
);
