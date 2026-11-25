-- Dormant DBA-only compact transaction boundary; no API grants or source cutover.
create function avuqo_compact_shadow.require_complete_at_commit() returns trigger
language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if not exists(select 1 from avuqo_compact_shadow.snapshots s where s.digest=new.digest and s.sealed_at is not null)
 then raise exception 'unsealed compact transaction' using errcode='23514'; end if;
 return null;
end;
$$;
create constraint trigger compact_snapshot_commit_guard after insert or update on avuqo_compact_shadow.snapshots
 deferrable initially deferred for each row execute function avuqo_compact_shadow.require_complete_at_commit();

create function avuqo_compact_shadow.pool_payload(p_kind text,p_canonical text) returns text
language plpgsql security invoker set search_path=pg_catalog as $$
declare v jsonb; h text; old_payload jsonb;
begin
 if p_kind is null or p_kind not in ('content','observation') or p_canonical is null or octet_length(p_canonical)>262144
 then raise exception 'invalid compact payload' using errcode='23514'; end if;
 v:=p_canonical::jsonb;
 if jsonb_typeof(v)<>'object' then raise exception 'invalid compact object' using errcode='23514'; end if;
 h:=encode(sha256(convert_to('pneus-shadow-v1'||chr(10)||p_kind||chr(10)||p_canonical,'UTF8')),'hex');
 if p_kind='content' then
  insert into avuqo_compact_shadow.content_payloads(hash,payload) values(h,v) on conflict(hash) do nothing;
  select payload into old_payload from avuqo_compact_shadow.content_payloads where hash=h;
 else
  insert into avuqo_compact_shadow.observation_payloads(hash,payload) values(h,v) on conflict(hash) do nothing;
  select payload into old_payload from avuqo_compact_shadow.observation_payloads where hash=h;
 end if;
 if old_payload is distinct from v then raise exception 'compact hash collision' using errcode='23514'; end if;
 return h;
end;
$$;

create function avuqo_compact_shadow.require_pneus_rights() returns void
language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if (select count(*) from public.system_controls where (control_key='source_ingestion' and enabled=true) or (control_key='global_emergency_stop' and enabled=false))<>2
 or not exists(select 1 from public.sources s where s.connector_key='awin' and s.status='active' and s.sync_enabled and s.credential_status='ready'
  and s.metadata->>'owner_attested_release_enabled'='true'
  and s.metadata->'owner_publication_authorization'->>'status'='granted'
  and s.metadata->'owner_publication_authorization'->>'automation_requested'='true'
  and s.metadata->'owner_permission_attestation_2026_11_17'->>'evidence_kind'='explicit_owner_chat_attestation'
  and s.metadata->'owner_permission_attestation_2026_11_17'->>'not_a_merchant_terms_expiry_claim'='true'
  and s.metadata->'owner_permission_attestation_2026_11_17'->>'scope_as_stated'='all accepted Awin programmes, public product listings and publisher-supplied product images'
  and (s.metadata->'owner_permission_attestation_2026_11_17'->>'recorded_date')::timestamptz between clock_timestamp()-interval '30 days' and clock_timestamp()+interval '5 minutes'
  and (select count(*) from jsonb_array_elements(s.metadata->'awin_advertisers') a where a->>'advertiser_id'='15236' and a->>'joined_programme_observed'='true')=1
  and exists(select 1 from jsonb_array_elements(s.metadata->'awin_advertisers') a where a->>'advertiser_id'='15236' and a->>'joined_programme_observed'='true' and (nullif(a->>'valid_until','') is null or (a->>'valid_until')::timestamptz>clock_timestamp())))
 or not exists(select 1 from public.affiliate_programs p where p.provider='awin' and p.region='GB' and p.external_account_id='15236'
 and p.metadata->>'publication_approved'='true' and p.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted')
 then raise exception 'private source rights or controls blocked' using errcode='23514'; end if;
end;
$$;

create function avuqo_compact_shadow.begin_verified_snapshot(p_job uuid,p_digest text) returns text
language plpgsql security invoker set search_path=pg_catalog as $$
declare j public.awin_bulk_import_jobs%rowtype; r public.feed_import_runs%rowtype; s public.large_feed_import_sessions%rowtype;
begin
 perform avuqo_compact_shadow.require_pneus_rights();
 select * into j from public.awin_bulk_import_jobs where id=p_job and advertiser_id='15236' and feed_id='26513' and state='completed';
 if not found or p_digest is null or p_digest is distinct from j.snapshot_sha256
 or j.validated_total is null or j.validated_total not between 1 and 25000 or j.committed_rows is distinct from j.validated_total
 or j.snapshot_object_key is distinct from 'pneus-online/15236/26513/'||p_digest||'.csv.gz'
 then raise exception 'invalid snapshot journal' using errcode='23514'; end if;
 perform pg_advisory_xact_lock(hashtextextended('avuqo-pneus:'||p_digest,0));
 select * into r from public.feed_import_runs where id=j.private_import_id;
 select * into s from public.large_feed_import_sessions where import_id=j.private_import_id;
 if r.id is null or r.merchant_id is distinct from '15236' or r.status is distinct from 'private_review'
 or r.permission_status is distinct from 'unverified' or r.total_count is distinct from j.validated_total
 or r.excluded_count is null or s.completed_at is null or s.source_digest is distinct from p_digest
 or s.committed_count is distinct from j.validated_total
 or not exists(select 1 from storage.objects o where o.bucket_id='awin-bulk-private-snapshots' and o.name=j.snapshot_object_key)
 then raise exception 'legacy journal mismatch' using errcode='23514'; end if;
 if exists(select 1 from avuqo_compact_shadow.snapshots where digest=p_digest)
 then raise exception 'snapshot already exists' using errcode='23514'; end if;
 insert into avuqo_compact_shadow.snapshots(digest,journal_job_id,legacy_import_id,object_key,observed_at,expected_rows,expected_excluded)
 values(p_digest,j.id,r.id,j.snapshot_object_key,j.created_at,j.validated_total,r.excluded_count);
 return p_digest;
end;
$$;
revoke all on all functions in schema avuqo_compact_shadow from public,anon,authenticated,service_role;
comment on function avuqo_compact_shadow.begin_verified_snapshot(uuid,text) is 'Dormant DBA-only entry. Caller must independently verify actual archive bytes and parity; this function verifies journal binding, not actual bytes. No retention or publication authority.';
