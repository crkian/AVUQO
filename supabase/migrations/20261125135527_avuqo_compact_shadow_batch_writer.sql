-- Dormant DBA-only writer. No API exposure; caller must independently verify archive bytes.
create function avuqo_compact_shadow.reconstruct_row(p_sku text,p_content jsonb,p_observation jsonb,p_updated text) returns jsonb
language plpgsql immutable security invoker set search_path=pg_catalog as $$
declare m jsonb;
begin
 m:=p_content->'metadata';
 if p_sku is null or length(p_sku) not between 1 and 250
 or jsonb_typeof(p_content) is distinct from 'object' or jsonb_typeof(p_observation) is distinct from 'object'
 or jsonb_typeof(m) is distinct from 'object' or jsonb_typeof(m->'source_catalogue_fields') is distinct from 'object'
 or jsonb_typeof(p_observation->'termFields') is distinct from 'object'
 or m->>'feed_id' is distinct from '26513' or m->>'release_approved' is distinct from 'false'
 or m->>'tyre_fitment_verified' is distinct from 'false' or m->>'source_image_rights_confirmed' is distinct from 'false'
 or m->>'source_description_rights_confirmed' is distinct from 'false'
 or (p_observation->>'source_currency_explicit' is distinct from 'true' and (p_observation->>'status' is distinct from 'excluded' or p_observation->>'currency' is distinct from ''))
 then raise exception 'private row gate failed' using errcode='23514'; end if;
 return (p_content-'metadata')||jsonb_build_object('merchant_id','15236','merchant_product_id',p_sku,
 'price',nullif(p_observation->>'price','')::numeric,'currency',p_observation->'currency','status',p_observation->'status','reasons',p_observation->'reasons',
 'metadata',(m-'source_catalogue_fields')||(p_observation-array['price','currency','status','reasons','termFields'])
 ||jsonb_build_object('source_updated_at',p_updated,'source_catalogue_fields',(m->'source_catalogue_fields')||(p_observation->'termFields')));
end;
$$;
create function avuqo_compact_shadow.legacy_row(p_import uuid,p_sku text) returns jsonb
language sql stable security invoker set search_path=pg_catalog as $$
 select case when count(*)=1 then (jsonb_agg(jsonb_build_object('merchant_id',f.merchant_id,'merchant_product_id',f.merchant_product_id,
 'awin_product_id',f.awin_product_id,'title',f.title,'price',f.price,'currency',f.currency,'brand',f.brand,'category',f.category,
 'status',f.status,'reasons',f.reasons,'image_url',f.image_url,'metadata',f.metadata)))->0 else null end
 from public.feed_import_records f where f.import_id=p_import and f.merchant_product_id=p_sku and f.merchant_id='15236';
$$;
create function avuqo_compact_shadow.append_verified_batch(p_digest text,p_rows jsonb) returns integer
language plpgsql security invoker set search_path=pg_catalog as $$
declare s avuqo_compact_shadow.snapshots%rowtype; x jsonb; c jsonb; o jsonb; sku text; ch text; oh text; n integer;
begin
 perform avuqo_compact_shadow.require_pneus_rights();
 if p_rows is null or jsonb_typeof(p_rows)<>'array' or octet_length(p_rows::text)>16777216 then raise exception 'invalid batch' using errcode='23514'; end if;
 n:=jsonb_array_length(p_rows);
 if n not between 1 and 250 then raise exception 'invalid batch size' using errcode='23514'; end if;
 select * into s from avuqo_compact_shadow.snapshots where digest=p_digest for update;
 if not found or s.sealed_at is not null then raise exception 'snapshot not writable' using errcode='23514'; end if;
 if (select count(*) from avuqo_compact_shadow.memberships where snapshot_digest=p_digest)+n>s.expected_rows then raise exception 'batch exceeds expected rows' using errcode='23514'; end if;
 for x in select value from jsonb_array_elements(p_rows) loop
  if jsonb_typeof(x)<>'object' or jsonb_typeof(x->'sku') is distinct from 'string'
  or jsonb_typeof(x->'content_text') is distinct from 'string' or jsonb_typeof(x->'observation_text') is distinct from 'string'
  or coalesce(jsonb_typeof(x->'source_updated_at'),'missing') not in ('string','null')
  or octet_length(x->>'content_text')>262144 or octet_length(x->>'observation_text')>262144
  then raise exception 'invalid batch row' using errcode='23514'; end if;
  sku:=x->>'sku'; c:=(x->>'content_text')::jsonb; o:=(x->>'observation_text')::jsonb;
  if avuqo_compact_shadow.reconstruct_row(sku,c,o,x->>'source_updated_at') is distinct from avuqo_compact_shadow.legacy_row(s.legacy_import_id,sku)
  then raise exception 'legacy normalized row mismatch' using errcode='23514'; end if;
  ch:=avuqo_compact_shadow.pool_payload('content',x->>'content_text'); oh:=avuqo_compact_shadow.pool_payload('observation',x->>'observation_text');
  insert into avuqo_compact_shadow.memberships(snapshot_digest,sku,content_hash,observation_hash,source_updated_at)
  values(p_digest,sku,ch,oh,x->>'source_updated_at');
 end loop;
 return n;
end;
$$;
create function avuqo_compact_shadow.seal_verified_snapshot(p_digest text) returns integer
language plpgsql security invoker set search_path=pg_catalog as $$
declare s avuqo_compact_shadow.snapshots%rowtype; n bigint;
begin
 perform avuqo_compact_shadow.require_pneus_rights();
 select * into s from avuqo_compact_shadow.snapshots where digest=p_digest for update;
 if not found or s.sealed_at is not null then raise exception 'snapshot not writable' using errcode='23514'; end if;
 select count(*) into n from public.feed_import_records f where f.import_id=s.legacy_import_id;
 if n<>s.expected_rows then raise exception 'legacy count drift' using errcode='23514'; end if;
 if exists(select 1 from avuqo_compact_shadow.memberships m join avuqo_compact_shadow.content_payloads c on c.hash=m.content_hash
 join avuqo_compact_shadow.observation_payloads o on o.hash=m.observation_hash where m.snapshot_digest=p_digest
 and avuqo_compact_shadow.reconstruct_row(m.sku,c.payload,o.payload,m.source_updated_at) is distinct from avuqo_compact_shadow.legacy_row(s.legacy_import_id,m.sku))
 then raise exception 'legacy parity drift' using errcode='23514'; end if;
 update avuqo_compact_shadow.snapshots set sealed_at=clock_timestamp() where digest=p_digest;
 return s.expected_rows;
end;
$$;
revoke all on all functions in schema avuqo_compact_shadow from public,anon,authenticated,service_role;
comment on function avuqo_compact_shadow.seal_verified_snapshot(text) is 'DBA-only structural and normalized legacy parity seal; does not independently prove archive recovery or authorize retention.';
