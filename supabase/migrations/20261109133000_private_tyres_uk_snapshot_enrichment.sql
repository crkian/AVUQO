-- Private, fail-closed, resumable Tyres UK enrichment from current Awin snapshots.
-- This migration MUST be applied before enabling AWIN_TYRE_AUTO_ENRICH_ENABLED.
-- The original 5 Nov 2026 private import, prices and publication flags are immutable.
create table if not exists public.awin_tyres_spec_enrichment_jobs (
 id uuid primary key default gen_random_uuid(),
 target_import_id uuid not null references public.feed_import_runs(id),
 advertiser_id text not null default '12715' check (advertiser_id='12715'),
 feed_id text not null default '93988' check (feed_id='93988'),
 source_digest text not null check (source_digest ~ '^[a-f0-9]{64}$'),
 snapshot_object_key text not null check (snapshot_object_key ~ '^tyre-spec/12715/93988/[a-f0-9]{64}\\.csv\\.gz$'),
 source_row_count integer not null check (source_row_count between 1 and 100000),
 next_row integer not null default 0 check (next_row>=0),
 candidate_count integer not null default 0 check (candidate_count>=0),
 updated_count integer not null default 0 check (updated_count>=0),
 skipped_count integer not null default 0 check (skipped_count>=0),
 state text not null default 'queued' check (state in ('queued','running','completed','failed')),
 lease_token uuid,
 lease_until timestamptz,
 last_failure_code text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 completed_at timestamptz,
 unique(target_import_id,source_digest),
 check (next_row<=source_row_count)
);
create index if not exists awin_tyres_enrichment_state_idx
 on public.awin_tyres_spec_enrichment_jobs(state,created_at);
alter table public.awin_tyres_spec_enrichment_jobs enable row level security;
revoke all on public.awin_tyres_spec_enrichment_jobs from public,anon,authenticated;
grant select,insert,update on public.awin_tyres_spec_enrichment_jobs to service_role;

-- Atomic claim: two cron invocations cannot both own the same snapshot.
create or replace function public.claim_private_tyres_uk_snapshot_job(p_job_id uuid)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare j public.awin_tyres_spec_enrichment_jobs%rowtype;
begin
 update public.awin_tyres_spec_enrichment_jobs
 set state='running',lease_token=gen_random_uuid(),
     lease_until=now()+interval '120 seconds',updated_at=now()
 where id=p_job_id and state in ('queued','running')
   and (lease_until is null or lease_until < now())
 returning * into j;
 if not found then return null; end if;
 return jsonb_build_object('id',j.id,'source_digest',j.source_digest,
  'snapshot_object_key',j.snapshot_object_key,'source_row_count',j.source_row_count,
  'next_row',j.next_row,'lease_token',j.lease_token);
end;
$$;

-- Appends *only* unverified technical candidates to existing review records.
-- New Awin snapshots are NOT represented as the original exact-digest file.
create or replace function public.apply_private_tyres_uk_snapshot_batch(
 p_job_id uuid,p_lease_token uuid,p_start integer,p_end integer,p_rows jsonb
) returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare
 j public.awin_tyres_spec_enrichment_jobs%rowtype;
 v_count integer;
 v_updated integer;
begin
 select * into j from public.awin_tyres_spec_enrichment_jobs where id=p_job_id for update;
 if not found or j.state<>'running' or j.lease_token is distinct from p_lease_token
   or j.lease_until is null or j.lease_until<=now() then
   raise exception 'tyres_auto_enrichment_lease_invalid';
 end if;
 if p_start<>j.next_row or p_end<=p_start or p_end>j.source_row_count
    or p_end-p_start>250 or jsonb_typeof(p_rows) is distinct from 'array'
 then raise exception 'tyres_auto_enrichment_checkpoint_invalid';end if;
 v_count:=jsonb_array_length(p_rows);
 if v_count>p_end-p_start then raise exception 'tyres_auto_enrichment_batch_too_large'; end if;
 if not exists(
   select 1 from public.feed_import_runs r
   join public.large_feed_import_sessions s on s.import_id=r.id
   join public.user_roles u on u.user_id=r.created_by
   where r.id=j.target_import_id and r.merchant_id='12715'
   and r.status='private_review' and r.permission_status='unverified'
   and u.role='owner' and s.committed_count=r.total_count
   and s.completed_at is not null
 ) or not exists(
  select 1 from public.sources where connector_key='awin'
  and status='paused' and sync_enabled=false
 ) then raise exception 'tyres_auto_enrichment_private_gates_failed'; end if;
 if exists(
  select 1 from jsonb_array_elements(p_rows) e
  where jsonb_typeof(e)<>'object'
   or coalesce(e->>'merchant_product_id','') !~ '^[A-Za-z0-9_-]{1,120}$'
   or length(coalesce(e->>'title','')) not between 1 and 500
   or coalesce(e->>'price','') !~ '^[0-9]{1,7}(\\.[0-9]{1,2})?$'
   or (e->>'price')::numeric<=0
   or coalesce(e->>'width_mm','') !~ '^[1-3][0-9]{2}$'
   or coalesce(e->>'aspect_ratio','') !~ '^[0-9]{2}$'
   or coalesce(e->>'rim_inches','') !~ '^[0-9]{2}$'
   or coalesce(e->>'load_index','') !~ '^[0-9]{2,3}(/[0-9]{2,3})?$'
   or coalesce(e->>'speed_rating','') !~ '^[A-Z]$'
   or coalesce(e->>'corroborated','')<>'true'
 ) then raise exception 'tyres_auto_enrichment_evidence_invalid'; end if;
 if exists(
  select 1 from jsonb_array_elements(p_rows) e
  group by e->>'merchant_product_id' having count(*)>1
 ) then raise exception 'tyres_auto_enrichment_duplicate_ids'; end if;

 with input as (
  select e->>'merchant_product_id' product_id,e->>'title' title,
   (e->>'width_mm')::integer width_mm,
   (e->>'aspect_ratio')::integer aspect_ratio,
   (e->>'rim_inches')::integer rim_inches,
   e->>'load_index' load_idx,e->>'speed_rating' speed
  from jsonb_array_elements(p_rows) e
 )
 update public.feed_import_records rec
 set metadata=rec.metadata||jsonb_build_object(
  'load_index_candidate',input.load_idx,
  'speed_rating_candidate',input.speed,
  'tyre_spec_source','current_awin_private_snapshot_crosschecked',
  'tyre_spec_snapshot_sha256',j.source_digest,
  'tyre_technical_spec_candidate',jsonb_build_object(
   'cross_checked_against_description',true,
   'source_columns','custom_1...custom_5',
   'width_mm',input.width_mm,'aspect_ratio',input.aspect_ratio,
   'rim_inches',input.rim_inches,
   'load_index_candidate',input.load_idx,
   'speed_rating_candidate',input.speed,
   'load_index_verified',false,'speed_rating_verified',false,
   'fitment_verified',false)
 )
 from input
 where rec.import_id=j.target_import_id
  and rec.merchant_id='12715' and rec.status='review'
  and rec.merchant_product_id=input.product_id
  and rec.title=input.title and rec.currency='GBP'
  and rec.metadata->>'feed_id'='93988'
  and rec.metadata->>'tyre_adapter'='tyres_uk_private_v1'
  and rec.metadata->>'permission_status'='unverified'
  and rec.metadata->>'release_approved'='false'
  and rec.metadata->>'auto_match_approved'='false'
  and rec.metadata->>'load_index_candidate' is null
  and rec.metadata->>'speed_rating_candidate' is null
  and rec.metadata #>> '{tyre_size_candidate,width_mm}'=input.width_mm::text
  and rec.metadata #>> '{tyre_size_candidate,aspect_ratio}'=input.aspect_ratio::text
  and rec.metadata #>> '{tyre_size_candidate,rim_inches}'=input.rim_inches::text
  and (select count(*) from public.feed_import_records r2
       where r2.import_id=j.target_import_id and r2.merchant_id='12715'
        and r2.merchant_product_id=input.product_id)=1;
 get diagnostics v_updated=row_count;

 update public.awin_tyres_spec_enrichment_jobs
 set next_row=p_end,candidate_count=candidate_count+v_count,
  updated_count=updated_count+v_updated,
  skipped_count=skipped_count+v_count-v_updated,
  state=case when p_end=source_row_count then 'completed' else 'running' end,
  completed_at=case when p_end=source_row_count then now() else completed_at end,
  lease_token=case when p_end=source_row_count then null else lease_token end,
  lease_until=case when p_end=source_row_count then null else lease_until end,
  updated_at=now()
 where id=j.id;
 return jsonb_build_object('scanned',p_end-p_start,'eligible',v_count,
   'updated',v_updated,'skipped',v_count-v_updated,
   'completed',p_end=j.source_row_count,'private_only',true,'no_publication',true);
end;
$$;

revoke all on function public.claim_private_tyres_uk_snapshot_job(uuid) from public,anon,authenticated;
revoke all on function public.apply_private_tyres_uk_snapshot_batch(uuid,uuid,integer,integer,jsonb) from public,anon,authenticated;
grant execute on function public.claim_private_tyres_uk_snapshot_job(uuid) to service_role;
grant execute on function public.apply_private_tyres_uk_snapshot_batch(uuid,uuid,integer,integer,jsonb) to service_role;
