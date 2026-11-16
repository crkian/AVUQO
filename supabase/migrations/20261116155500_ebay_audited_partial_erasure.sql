-- Audited, DBA-only execution of an EXISTING partial eBay erasure.
-- This operation is intentionally unavailable to the service role and webhook.
-- It does not acknowledge or complete account deletion and must not be
-- mistaken for a full-store privacy/data-retention process.
create table public.ebay_partial_erasure_audit (
 id bigint generated always as identity primary key,
 receipt_id bigint not null references public.ebay_deletion_receipts(id) on delete restrict,
 attempted_at timestamptz not null default now(),
 offers_erased bigint not null check (offers_erased >= 0),
 ingestion_items_erased bigint not null check (ingestion_items_erased >= 0),
 price_records_erased bigint not null check (price_records_erased >= 0),
 matches_erased bigint not null check (matches_erased >= 0),
 result text not null default 'partial_rows_purged'
  check (result='partial_rows_purged')
);
create index ebay_partial_erasure_audit_receipt_idx
 on public.ebay_partial_erasure_audit(receipt_id, attempted_at desc);
alter table public.ebay_partial_erasure_audit enable row level security;
revoke all on public.ebay_partial_erasure_audit from public,anon,authenticated,service_role;
revoke all on sequence public.ebay_partial_erasure_audit_id_seq
 from public,anon,authenticated,service_role;

create function public.ebay_run_audited_partial_erasure(p_notification_digest text)
returns table(audit_id bigint, offers_erased bigint, ingestion_items_erased bigint,
 price_records_erased bigint, matches_erased bigint)
language plpgsql security definer set search_path = ''
as $$
declare
 v_receipt_id bigint;
 v_counts record;
 v_audit_id bigint;
begin
 if p_notification_digest is null or p_notification_digest !~ '^[a-f0-9]{64}$' then
  raise exception 'Invalid receipt digest';
 end if;
 select id into v_receipt_id
 from public.ebay_deletion_receipts
 where notification_digest=p_notification_digest
 for update;
 if v_receipt_id is null then raise exception 'Unknown eBay deletion receipt'; end if;

 -- Existing DBA-only function does the exact ID-based source-isolated deletion.
 -- It also locks the receipt. This wrapper, all deletes and audit INSERT form
 -- one SQL transaction and are rolled back as a unit on any error.
 select * into strict v_counts
 from public.ebay_purge_mapped_account_rows(p_notification_digest);

 -- A linked target must never remain for ANY of the receipt's account digests.
 if exists (
  select 1 from public.ebay_account_item_links l
   join public.ebay_deletion_receipts r on r.id=v_receipt_id
  where (l.identity_kind='user_id_digest' and l.identity_digest=r.user_id_digest)
     or (l.identity_kind='username_digest' and l.identity_digest=r.username_digest)
     or (l.identity_kind='eias_token_digest' and l.identity_digest=r.eias_token_digest)
 ) then
  raise exception 'Partial eBay erasure left mapped data behind';
 end if;
 insert into public.ebay_partial_erasure_audit
  (receipt_id,offers_erased,ingestion_items_erased,price_records_erased,matches_erased)
 values (v_receipt_id,v_counts.offers_erased,v_counts.ingestion_items_erased,
  v_counts.price_records_erased,v_counts.matches_erased)
 returning id into v_audit_id;

 return query select v_audit_id,v_counts.offers_erased,
  v_counts.ingestion_items_erased,v_counts.price_records_erased,v_counts.matches_erased;
end;
$$;
revoke all on function public.ebay_run_audited_partial_erasure(text)
 from public,anon,authenticated,service_role;

comment on function public.ebay_run_audited_partial_erasure(text) is
'DBA-only auditable partial erasure of exact eBay-linked catalog rows; does not acknowledge or complete account deletion.';
comment on table public.ebay_partial_erasure_audit is
'Private count-only history of mapped eBay row purges; no raw account identifiers and no compliance-complete status.';
