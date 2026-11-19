-- Owner-authorised active Awin must not strand a vetted, immutable private
-- 15236:26513 tyre snapshot at snapshot_ready after source activation.
-- This corrects only the private bulk-claim admission gate. The worker still
-- quarantines unverified currency and never publishes any tyre.
-- Existing checkpoints, leases, row identity and failure ceilings stay intact.
create or replace function public.claim_private_awin_bulk_job(
 p_job_id uuid,
 p_lease_seconds integer default 90
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
 j public.awin_bulk_import_jobs%rowtype;
 r public.feed_import_runs%rowtype;
 s public.large_feed_import_sessions%rowtype;
 v_token uuid;
begin
 if p_job_id is null or p_lease_seconds not between 30 and 120 then
  raise exception 'Invalid private lease request';
 end if;
 select * into j from public.awin_bulk_import_jobs where id=p_job_id for update;
 if not found then raise exception 'Bulk job unavailable'; end if;
 if j.state not in ('snapshot_ready','retryable','running')
    or (j.state='running' and (j.lease_expires_at is null or j.lease_expires_at>now()))
    or j.attempt_count>=20
    or j.snapshot_sha256 is null or j.snapshot_object_key is null
    or j.validated_total is null or j.private_import_id is null
 then raise exception 'Bulk job is not claimable'; end if;
 -- The private worker must continue after owner-authorised activation of
 -- Awin, while preserving the historic paused-only private-import pathway.
 -- This is NOT a public offer release approval or tyre fitment verification.
 if not exists(
  select 1 from public.sources src
  where src.connector_key='awin'
   and (
    (src.status='paused' and src.sync_enabled=false)
    or (
     src.status='active' and src.sync_enabled=true and
     src.credential_status='ready' and
     src.metadata->>'owner_attested_release_enabled'='true' and
     exists (
      select 1 from public.affiliate_programs ap
      where ap.provider='awin' and ap.region='GB' and
       ap.external_account_id=j.advertiser_id and
       ap.metadata->>'publication_approved'='true' and
       ap.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted'
     )
    )
   )
 ) then raise exception 'Awin private bulk source is not authorised'; end if;
 if not exists (
  select 1 from public.system_controls c
  where c.control_key='source_ingestion' and c.enabled=true
 ) or exists (
  select 1 from public.system_controls c
  where c.control_key='global_emergency_stop' and c.enabled=true
 ) then raise exception 'Awin source ingestion or emergency stop blocks private bulk claim'; end if;
 select * into r from public.feed_import_runs where id=j.private_import_id for update;
 if r.id is null or r.merchant_id<>j.advertiser_id
    or r.filename not like ('GENAWIN__'||j.feed_id||'__%')
    or r.status<>'importing' or r.permission_status<>'unverified'
 then raise exception 'Private import identity/status mismatch'; end if;
 select * into s from public.large_feed_import_sessions
 where import_id=j.private_import_id for update;
 if s.import_id is null or s.completed_at is not null
    or s.source_digest<>j.snapshot_sha256
    or s.next_sequence<j.next_sequence
    or s.committed_count<j.committed_rows
    or s.committed_count>j.validated_total
    or s.committed_count>250*s.next_sequence
 then raise exception 'Private import checkpoint mismatch'; end if;
 v_token:=gen_random_uuid();
 update public.awin_bulk_import_jobs
 set state='running', lease_token=v_token,
     next_sequence=s.next_sequence,committed_rows=s.committed_count,
     lease_expires_at=now()+make_interval(secs=>p_lease_seconds),
     attempt_count=attempt_count+1,updated_at=now(),
     last_failure_code=null
 where id=p_job_id;
 return jsonb_build_object('job_id',p_job_id,'lease_token',v_token,
   'next_sequence',s.next_sequence,'committed_rows',s.committed_count,
   'private_only',true);
end
$function$;

revoke all on function public.claim_private_awin_bulk_job(uuid,integer) from public,anon,authenticated;
grant execute on function public.claim_private_awin_bulk_job(uuid,integer) to service_role;
