-- Candidate only until reviewed, applied, and verified. No eBay source activation.
-- Durable DBA-only queue for erasure review. Does NOT perform deletion,
-- mark receipts completed, validate external evidence, or acknowledge webhook.
create table public.ebay_erasure_work_items (
 receipt_id bigint not null references public.ebay_deletion_receipts(id) on delete restrict,
 surface text not null check (surface in (
  'mapped_catalogue','indirect_identifiers','analytics_attribution',
  'storage_media','application_cdn_logs','backups_restoration','external_processors'
 )),
 state text not null default 'pending'
  check (state in ('pending','leased','awaiting_evidence','blocked')),
 attempts integer not null default 0 check (attempts >= 0),
 lease_until timestamptz,
 available_at timestamptz not null default now(),
 last_failure_code text check (last_failure_code is null
   or last_failure_code ~ '^[A-Z][A-Z0-9_]{0,63}$'),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key (receipt_id,surface),
 constraint ebay_erasure_lease_consistency
  check ((state='leased') = (lease_until is not null))
);
create index ebay_erasure_work_claim_idx
 on public.ebay_erasure_work_items(state,available_at,receipt_id);
alter table public.ebay_erasure_work_items enable row level security;
revoke all on public.ebay_erasure_work_items
 from public,anon,authenticated,service_role;

-- Automatic idempotent work item creation on a signed receipt journal INSERT.
-- Trigger cannot mark the journal complete or run any data erasure.
create function public.ebay_seed_erasure_work_items()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 insert into public.ebay_erasure_work_items(receipt_id,surface)
 select new.id,s.surface
 from (values
  ('mapped_catalogue'),('indirect_identifiers'),('analytics_attribution'),
  ('storage_media'),('application_cdn_logs'),('backups_restoration'),
  ('external_processors')
 ) as s(surface)
 on conflict(receipt_id,surface) do nothing;
 return new;
end;
$$;
revoke all on function public.ebay_seed_erasure_work_items()
 from public,anon,authenticated,service_role;
create trigger ebay_deletion_receipt_seed_erasure_queue
after insert on public.ebay_deletion_receipts for each row
execute function public.ebay_seed_erasure_work_items();

-- Backfill only existing unresolved receipts. No account data deleted.
insert into public.ebay_erasure_work_items(receipt_id,surface)
select r.id,s.surface from public.ebay_deletion_receipts r
cross join (values
 ('mapped_catalogue'),('indirect_identifiers'),('analytics_attribution'),
 ('storage_media'),('application_cdn_logs'),('backups_restoration'),
 ('external_processors')
) as s(surface)
where r.state <> 'completed'
on conflict(receipt_id,surface) do nothing;

-- DBA-only leasing. Safe under concurrent workers: SKIP LOCKED and bounded
-- leases permit crash recovery. No identity digest is returned.
create function public.ebay_claim_erasure_work(p_lease_seconds integer default 90)
returns table(receipt_id bigint,surface text,attempt integer,lease_expires timestamptz)
language plpgsql volatile security definer set search_path = ''
as $$
declare v_row record;
begin
 if p_lease_seconds not between 30 and 300 then
  raise exception 'Invalid eBay work lease';
 end if;
 select w.receipt_id,w.surface into v_row
 from public.ebay_erasure_work_items w
 join public.ebay_deletion_receipts r on r.id=w.receipt_id
 where r.state <> 'completed'
  and ((w.state='pending' and w.available_at<=clock_timestamp())
    or (w.state='leased' and w.lease_until<clock_timestamp()))
 order by w.available_at,w.receipt_id,w.surface
 for update of w skip locked
 limit 1;
 if not found then return; end if;
 return query
 update public.ebay_erasure_work_items w
 set state='leased',
     attempts=w.attempts+1,
     lease_until=clock_timestamp()+make_interval(secs=>p_lease_seconds),
     updated_at=clock_timestamp()
 where w.receipt_id=v_row.receipt_id and w.surface=v_row.surface
 returning w.receipt_id,w.surface,w.attempts,w.lease_until;
end;
$$;
revoke all on function public.ebay_claim_erasure_work(integer)
 from public,anon,authenticated,service_role;

-- DBA-only attempt outcome. No 'completed' or 'verified' outcome exists.
-- The caller must own the current attempt and an unexpired lease.
create function public.ebay_record_erasure_work_outcome(
 p_receipt_id bigint,p_surface text,p_attempt integer,
 p_outcome text,p_failure_code text default null
) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare v_count integer;
begin
 if p_outcome not in ('retry','awaiting_evidence','blocked')
  or (p_outcome='retry' and
    (p_failure_code is null or p_failure_code !~ '^[A-Z][A-Z0-9_]{0,63}$'))
  or (p_failure_code is not null and
    p_failure_code !~ '^[A-Z][A-Z0-9_]{0,63}$') then
  raise exception 'Invalid erasure attempt outcome';
 end if;
 update public.ebay_erasure_work_items w
 set state=case when p_outcome='retry' then 'pending' else p_outcome end,
     lease_until=null,
     available_at=case when p_outcome='retry'
      then clock_timestamp() + make_interval(secs=>least(3600,2^least(w.attempts,10))::integer)
      else w.available_at end,
     last_failure_code=p_failure_code,
     updated_at=clock_timestamp()
 where w.receipt_id=p_receipt_id and w.surface=p_surface
  and w.attempts=p_attempt and w.state='leased'
  and w.lease_until>clock_timestamp();
 get diagnostics v_count=row_count;
 if v_count<>1 then
  raise exception 'Stale, expired or nonexistent eBay erasure work lease';
 end if;
end;
$$;
revoke all on function public.ebay_record_erasure_work_outcome(bigint,text,integer,text,text)
 from public,anon,authenticated,service_role;

comment on table public.ebay_erasure_work_items is
'Private durable erasure review work journal. No personal payload, no completed state, not evidence of compliance.';
comment on function public.ebay_claim_erasure_work(integer) is
'DBA-only SKIP LOCKED erasure work lease; no erasure execution and no provider acknowledgment.';
comment on function public.ebay_record_erasure_work_outcome(bigint,text,integer,text,text) is
'DBA-only retry or evidence-review disposition; NEVER completes a deletion receipt.';


-- Service-role proof of atomic receipt-plus-seven-item queue acceptance ONLY.
-- The existing AFTER INSERT trigger runs in the same transaction as receipt insert.
-- This SQL-visible boolean gate cannot erase data or mark a receipt completed.
-- It deliberately returns no receipt IDs, digests, user identifiers or work rows.
-- This is versioned candidate SQL, not installed production SQL.
create function public.ebay_receipt_queue_ready(p_notification_digest text)
returns boolean
language sql stable security definer set search_path = ''
as $$
 select coalesce(
   p_notification_digest ~ '^[a-f0-9]{64}$'
   and exists (
     select 1
     from public.ebay_deletion_receipts r
     where r.notification_digest=p_notification_digest
       and r.state in ('pending_privacy_review','processing')
       and (select count(*) from public.ebay_erasure_work_items w
            where w.receipt_id=r.id)=7
       and not exists (
         select 1 from (values
           ('mapped_catalogue'),('indirect_identifiers'),('analytics_attribution'),
           ('storage_media'),('application_cdn_logs'),('backups_restoration'),
           ('external_processors')
         ) required(surface)
         where not exists(
           select 1 from public.ebay_erasure_work_items w
           where w.receipt_id=r.id and w.surface=required.surface
             and w.state in ('pending','leased','awaiting_evidence','blocked')
         )
       )
   ),false);
$$;
revoke all on function public.ebay_receipt_queue_ready(text)
 from public,anon,authenticated,service_role;
grant execute on function public.ebay_receipt_queue_ready(text) to service_role;
comment on function public.ebay_receipt_queue_ready(text) is
'Boolean-only proof of seven durable work items for a recorded eBay notification. Never proves erasure or provider/legal approval.';
