-- AVUQO: DRAFT, INACTIVE Tyres UK snapshot lease primitives.
-- Depends on the separately deployed blocked-by-default job journal (PR #157).
-- No worker/cron/trigger, no job insertion, no queue transition, no feed download,
-- no price, image, product, fitment, permission or publication modifications.
-- Do not apply until live migration history is reconciled and SQL integration-tested.

create or replace function public.claim_private_tyres_uk_snapshot_job(p_job_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_job public.awin_tyres_spec_enrichment_jobs%rowtype;
  v_now timestamptz := clock_timestamp();
begin
  -- Jobs default to BLOCKED; this function deliberately cannot unblock them.
  -- An expired RUNNING lease can be reclaimed by only one caller because the
  -- UPDATE takes the row lock and re-evaluates these predicates.
  update public.awin_tyres_spec_enrichment_jobs as j
     set state = 'running',
         lease_token = gen_random_uuid(),
         lease_until = v_now + interval '120 seconds',
         updated_at = v_now
   where j.id = p_job_id
     and (
       (j.state = 'queued' and j.lease_token is null and j.lease_until is null)
       or (j.state = 'running' and j.lease_until < v_now)
     )
     and exists (
       select 1 from public.sources s
        where s.connector_key = 'awin'
          and s.status = 'paused'
          and s.sync_enabled = false
     )
   returning j.* into v_job;
  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'id', v_job.id,
    'target_import_id', v_job.target_import_id,
    'advertiser_id', v_job.advertiser_id,
    'feed_id', v_job.feed_id,
    'source_digest', v_job.source_digest,
    'snapshot_object_key', v_job.snapshot_object_key,
    'source_row_count', v_job.source_row_count,
    'next_row', v_job.next_row,
    'lease_token', v_job.lease_token,
    'lease_until', v_job.lease_until
  );
end;
$$;

create or replace function public.renew_private_tyres_uk_snapshot_lease(
  p_job_id uuid, p_lease_token uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_updated integer;
begin
  if p_lease_token is null then return false; end if;
  update public.awin_tyres_spec_enrichment_jobs as j
     set lease_until = v_now + interval '120 seconds',
         updated_at = v_now
   where j.id = p_job_id
     and j.state = 'running'
     and j.lease_token = p_lease_token
     and j.lease_until > v_now
     and exists (
       select 1 from public.sources s
        where s.connector_key = 'awin'
          and s.status = 'paused'
          and s.sync_enabled = false
     );
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

-- Postgres grants EXECUTE to PUBLIC by default. Revoke explicitly.
revoke all on function public.claim_private_tyres_uk_snapshot_job(uuid)
 from PUBLIC, anon, authenticated;
revoke all on function public.renew_private_tyres_uk_snapshot_lease(uuid,uuid)
 from PUBLIC, anon, authenticated;
grant execute on function public.claim_private_tyres_uk_snapshot_job(uuid)
 to service_role;
grant execute on function public.renew_private_tyres_uk_snapshot_lease(uuid,uuid)
 to service_role;
