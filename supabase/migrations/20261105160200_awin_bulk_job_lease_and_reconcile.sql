-- Lease control for future worker, with fail-closed private import checks.
-- No route, scheduler, downloader or worker is installed by this migration.
alter table public.awin_bulk_import_jobs
 add column if not exists lease_token uuid;

-- Never expose privileged RPCs through PUBLIC's default function EXECUTE grant.
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
 if not exists(
  select 1 from public.sources where connector_key='awin'
   and status='paused' and sync_enabled=false
 ) then raise exception 'Awin publication source must remain paused'; end if;
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

-- Reconcile with authoritative chunk session; callers cannot supply counts.
-- Must be called *after* the existing append RPC succeeds.
create or replace function public.reconcile_private_awin_bulk_job(
 p_job_id uuid,
 p_lease_token uuid,
 p_release boolean default true
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
 j public.awin_bulk_import_jobs%rowtype;
 r public.feed_import_runs%rowtype;
 s public.large_feed_import_sessions%rowtype;
 v_state text;
begin
 if p_job_id is null or p_lease_token is null then
  raise exception 'Invalid private checkpoint request';
 end if;
 select * into j from public.awin_bulk_import_jobs where id=p_job_id for update;
 if not found or j.state<>'running' or j.lease_token is distinct from p_lease_token
    or j.lease_expires_at is null or j.lease_expires_at<=now()
 then raise exception 'Invalid or expired bulk job lease'; end if;
 select * into r from public.feed_import_runs where id=j.private_import_id for update;
 select * into s from public.large_feed_import_sessions
  where import_id=j.private_import_id for update;
 if r.id is null or s.import_id is null or s.source_digest<>j.snapshot_sha256
    or r.merchant_id<>j.advertiser_id
    or r.permission_status<>'unverified'
    or r.filename not like ('GENAWIN__'||j.feed_id||'__%')
    or r.status not in ('importing','private_review')
    or s.next_sequence<j.next_sequence or s.committed_count<j.committed_rows
    or s.committed_count>j.validated_total
    or s.committed_count>250*s.next_sequence
 then raise exception 'Authoritative checkpoint mismatch'; end if;
 if r.status='private_review' then
  if s.completed_at is null or s.committed_count<>j.validated_total then
   raise exception 'Completed import count mismatch'; end if;
  v_state:='completed';
 elsif p_release then v_state:='retryable';
 else v_state:='running';
 end if;
 update public.awin_bulk_import_jobs
 set next_sequence=s.next_sequence,committed_rows=s.committed_count,
     state=v_state,
     completed_at=case when v_state='completed' then now() else null end,
     lease_token=case when v_state='running' then lease_token else null end,
     lease_expires_at=case when v_state='running' then lease_expires_at else null end,
     updated_at=now()
 where id=p_job_id;
 return jsonb_build_object('state',v_state,'next_sequence',s.next_sequence,
  'committed_rows',s.committed_count,'private_only',true);
end
$function$;

revoke all on function public.claim_private_awin_bulk_job(uuid,integer) from public,anon,authenticated;
revoke all on function public.reconcile_private_awin_bulk_job(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.claim_private_awin_bulk_job(uuid,integer) to service_role;
grant execute on function public.reconcile_private_awin_bulk_job(uuid,uuid,boolean) to service_role;
