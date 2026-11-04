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


-- The privileged server invokes this single transaction after rechecking
-- source, rights, controls, verified price and Score. No direct client access.
create or replace function public.record_awin_owner_release(
 p_offer_id uuid,p_source_id uuid,p_advertiser_id text,
 p_status text,p_actor_id uuid,p_review_note text,
 p_reviewed_price numeric,p_reviewed_offer_at timestamptz,p_reviewed_score_at timestamptz
) returns void language plpgsql security invoker set search_path='' as $$
declare changed integer;
begin
 if p_status not in ('approved','paused') or p_actor_id is null or
    p_advertiser_id !~ '^[0-9]{2,12}$' or length(coalesce(p_review_note,''))>300 then
   raise exception 'Invalid owner release request';
 end if;
 if not exists(select 1 from public.offers o join public.sources s on s.id=o.source_id
    where o.id=p_offer_id and o.source_id=p_source_id
      and s.connector_key='awin') then
   raise exception 'Awin offer and source mismatch';
 end if;

 if p_status='approved' then
   if not exists(select 1 from public.offers o join public.sources s on s.id=o.source_id
       where o.id=p_offer_id and o.source_id=p_source_id
         and s.status='active' and s.sync_enabled and s.credential_status='ready'
         and o.status='active' and o.currency='GBP' and o.price>0
         and o.last_seen_at=p_reviewed_offer_at and o.price=p_reviewed_price
         and s.metadata->>'publication_permission'='verified'
         and s.metadata->>'price_evidence_status'='verified'
     ) then raise exception 'Awin source or offer evidence changed'; end if;
   if not exists(select 1 from public.deal_scores ds
       where ds.offer_id=p_offer_id and ds.score>=60 and ds.confidence>=55
         and ds.calculated_at=p_reviewed_score_at) then
     raise exception 'Deal Score has changed'; end if;
   if not exists(select 1 from public.published_deals
       where offer_id=p_offer_id and status='held') then
     raise exception 'Offer has not been staged for manual publication'; end if;
   insert into public.awin_offer_release_reviews
     (offer_id,source_id,advertiser_id,status,reviewed_price,reviewed_offer_at,
      reviewed_score_at,approved_by,approved_at,updated_at,review_note)
   values(p_offer_id,p_source_id,p_advertiser_id,'approved',p_reviewed_price,
      p_reviewed_offer_at,p_reviewed_score_at,p_actor_id,now(),now(),coalesce(p_review_note,''))
   on conflict(offer_id) do update
    set status='approved',advertiser_id=excluded.advertiser_id,
      reviewed_price=excluded.reviewed_price,
      reviewed_offer_at=excluded.reviewed_offer_at,
      reviewed_score_at=excluded.reviewed_score_at,
      approved_by=excluded.approved_by,approved_at=now(),updated_at=now(),
      review_note=excluded.review_note;
   update public.published_deals set status='published',published_at=now(),updated_at=now()
    where offer_id=p_offer_id and status='held';
   get diagnostics changed = row_count;
   if changed<>1 then raise exception 'Publication row changed concurrently'; end if;
 else
   update public.awin_offer_release_reviews
      set status='paused',updated_at=now(),review_note=coalesce(p_review_note,'')
      where offer_id=p_offer_id;
   update public.published_deals set status='held',published_at=null,updated_at=now()
      where offer_id=p_offer_id;
 end if;

 insert into public.awin_release_audit
    (offer_id,source_id,advertiser_id,event_type,actor_id,review_note,
     approved_price,offer_checked_at)
 values(p_offer_id,p_source_id,p_advertiser_id,
   case when p_status='approved' then 'published' else 'paused' end,
   p_actor_id,coalesce(p_review_note,''),p_reviewed_price,p_reviewed_offer_at);
end $$;

revoke all on function public.record_awin_owner_release(
 uuid,uuid,text,text,uuid,text,numeric,timestamptz,timestamptz
) from public,anon,authenticated;
grant execute on function public.record_awin_owner_release(
 uuid,uuid,text,text,uuid,text,numeric,timestamptz,timestamptz
) to service_role;

commit;
