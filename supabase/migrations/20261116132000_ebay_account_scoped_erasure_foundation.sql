-- eBay account-scoped erasure foundation.
-- Important: this SQL does NOT mark deletion complete or acknowledge eBay.
-- Future ingestion must record exact ownership associations BEFORE persisting offers.
-- Identifiers are HMAC-SHA256 digests, never raw usernames/userIDs.
create table public.ebay_account_item_links (
 id bigint generated always as identity primary key,
 identity_kind text not null check (identity_kind in ('user_id_digest','username_digest','eias_token_digest')),
 identity_digest text not null check (identity_digest ~ '^[a-f0-9]{64}$'),
 offer_id uuid references public.offers(id) on delete cascade,
 ingestion_item_id uuid references public.source_ingestion_items(id) on delete cascade,
 linked_at timestamptz not null default now(),
 constraint ebay_link_exactly_one_target check ((offer_id is not null) <> (ingestion_item_id is not null))
);
create unique index ebay_links_offer_identity_key on public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 where offer_id is not null;
create unique index ebay_links_item_identity_key on public.ebay_account_item_links(identity_kind,identity_digest,ingestion_item_id)
 where ingestion_item_id is not null;
create index ebay_links_offer_lookup on public.ebay_account_item_links(offer_id) where offer_id is not null;
create index ebay_links_item_lookup on public.ebay_account_item_links(ingestion_item_id) where ingestion_item_id is not null;

alter table public.ebay_account_item_links enable row level security;
revoke all on public.ebay_account_item_links from public,anon,authenticated,service_role;
grant select,insert on public.ebay_account_item_links to service_role;
revoke all on sequence public.ebay_account_item_links_id_seq from public,anon,authenticated,service_role;
grant usage on sequence public.ebay_account_item_links_id_seq to service_role;

-- Both referred records MUST belong to the eBay connector; no broad generic catalog links.
create function public.ebay_validate_account_item_link()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare v_source uuid;
begin
 if new.offer_id is not null then
   select o.source_id into v_source from public.offers o where o.id=new.offer_id;
 else
   select i.source_id into v_source from public.source_ingestion_items i where i.id=new.ingestion_item_id;
 end if;
 if v_source is null or not exists (
   select 1 from public.sources s where s.id=v_source and s.connector_key='ebay'
 ) then
   raise exception 'eBay account item link must belong to the eBay source';
 end if;
 return new;
end;
$$;
revoke all on function public.ebay_validate_account_item_link() from public,anon,authenticated;
create trigger ebay_account_item_link_source_gate before insert or update
on public.ebay_account_item_links for each row
execute function public.ebay_validate_account_item_link();

-- Restricted, *partial* erasure. Explicit linked eBay rows only; no broad text matching.
-- A failure rolls back the transaction. Receipt remains pending for full privacy review.
-- Not called by the webhook; must be separately audited and wired after inventory completion.
create function public.ebay_purge_mapped_account_rows(p_notification_digest text)
returns table(offers_erased bigint, ingestion_items_erased bigint, price_records_erased bigint, matches_erased bigint)
language plpgsql security definer set search_path = ''
as $$
declare
 v_receipt public.ebay_deletion_receipts%rowtype;
 v_source uuid;
 v_offers uuid[];
 v_items uuid[];
begin
 if p_notification_digest is null or p_notification_digest !~ '^[a-f0-9]{64}$' then
   raise exception 'Invalid eBay receipt digest';
 end if;
 select * into v_receipt
 from public.ebay_deletion_receipts r
 where r.notification_digest=p_notification_digest
 for update;
 if not found then raise exception 'Unrecognised eBay deletion receipt'; end if;
 select id into strict v_source from public.sources where connector_key='ebay';

 -- Exact owner digest matching: one receipt may carry more than one alias.
 select coalesce(array_agg(distinct l.offer_id),array[]::uuid[]) into v_offers
 from public.ebay_account_item_links l
 where l.offer_id is not null and (
  (l.identity_kind='user_id_digest' and l.identity_digest=v_receipt.user_id_digest) or
  (l.identity_kind='username_digest' and l.identity_digest=v_receipt.username_digest) or
  (l.identity_kind='eias_token_digest' and l.identity_digest=v_receipt.eias_token_digest)
 );
 select coalesce(array_agg(distinct l.ingestion_item_id),array[]::uuid[]) into v_items
 from public.ebay_account_item_links l
 where l.ingestion_item_id is not null and (
  (l.identity_kind='user_id_digest' and l.identity_digest=v_receipt.user_id_digest) or
  (l.identity_kind='username_digest' and l.identity_digest=v_receipt.username_digest) or
  (l.identity_kind='eias_token_digest' and l.identity_digest=v_receipt.eias_token_digest)
 );
 if exists (select 1 from public.offers o where o.id=any(v_offers) and o.source_id<>v_source)
   or exists (select 1 from public.source_ingestion_items i where i.id=any(v_items) and i.source_id<>v_source)
 then raise exception 'Cross-source eBay privacy linkage rejected'; end if;

 delete from public.price_history h where h.source_id=v_source and h.offer_id=any(v_offers);
 get diagnostics price_records_erased=row_count;
 delete from public.product_matches m where m.source_id=v_source and
  m.source_offer_id in (select o.source_offer_id from public.offers o where o.id=any(v_offers));
 get diagnostics matches_erased=row_count;
 delete from public.offers o where o.source_id=v_source and o.id=any(v_offers);
 get diagnostics offers_erased=row_count;
 delete from public.source_ingestion_items i where i.source_id=v_source and i.id=any(v_items);
 get diagnostics ingestion_items_erased=row_count;

 -- Do not set state='completed'. Other data stores, assets, backups and retention
 -- obligations still require a comprehensive independently reviewed process.
 return next;
end;
$$;
revoke all on function public.ebay_purge_mapped_account_rows(text)
 from public,anon,authenticated,service_role;
-- Keep the destructive partial operation DBA-only until privacy and referential
-- acceptance is complete. Production webhook has NO execute grant.
comment on function public.ebay_purge_mapped_account_rows(text) is
'DBA-only partial eBay row erasure. Does not establish compliance or complete a deletion receipt.';
