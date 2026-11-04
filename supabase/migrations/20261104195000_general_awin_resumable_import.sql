-- General owner-only Awin resumable feed staging, using existing atomic sessions.
-- Different merchant feeds MUST contain an explicit row advertiser ID.
-- No publication, offer release, source activation or image rights granted.
create or replace function public.append_general_awin_feed_chunk(
 p_import_id uuid,p_sequence integer,p_digest text,p_rows jsonb
) returns jsonb language plpgsql security definer set search_path=''
as $$
declare
 v_session public.large_feed_import_sessions%rowtype;
 v_run public.feed_import_runs%rowtype;
 v_existing public.large_feed_import_chunks%rowtype;
 v_count integer;v_review integer;v_excluded integer;
begin
 if p_sequence is null or p_sequence<0 or p_digest !~ '^[a-f0-9]{64}$'
   or jsonb_typeof(p_rows)<>'array' then raise exception 'Invalid batch metadata';end if;
 v_count:=jsonb_array_length(p_rows);
 if v_count<1 or v_count>250 then raise exception 'Batch must have 1–250 records';end if;
 select * into v_session from public.large_feed_import_sessions where import_id=p_import_id for update;
 if not found then raise exception 'No import session';end if;
 select * into v_run from public.feed_import_runs where id=p_import_id;
 if v_run.status<>'importing' or v_run.filename !~ '^GENAWIN__[A-Za-z0-9_-]{1,30}__' or v_session.completed_at is not null
    or v_run.merchant_id !~ '^[0-9]{1,9}$'
    or v_run.permission_status<>'unverified' then raise exception 'Import not writable';end if;
 select * into v_existing from public.large_feed_import_chunks
 where import_id=p_import_id and sequence=p_sequence;
 if found then
  if v_existing.digest<>p_digest or v_existing.row_count<>v_count then raise exception 'Retry mismatch';end if;
  return jsonb_build_object('next_sequence',v_session.next_sequence,'committed',v_session.committed_count,'duplicate_retry',true);
 end if;
 if v_session.next_sequence<>p_sequence then raise exception 'Out-of-order batch';end if;
 if exists(select 1 from jsonb_array_elements(p_rows) as item
  where item->>'merchant_id' is distinct from v_run.merchant_id
   or nullif(item->>'merchant_product_id','') is null
   or nullif(item->>'title','') is null
   or item->>'status' not in ('review','excluded')
   or item->'metadata'->>'permission_status' is distinct from 'unverified'
   or item->'metadata'->>'source_image_rights_confirmed' is distinct from 'false'
   or item->'metadata'->>'source_format' not in ('awin-csv','google-retail')
 ) then raise exception 'Invalid row identity, source format or rights status';end if;
 if (select count(distinct item->>'merchant_product_id') from jsonb_array_elements(p_rows) item)<>v_count
 then raise exception 'Duplicate merchant product IDs in batch';end if;
 if exists(select 1 from jsonb_array_elements(p_rows) item
  join public.feed_import_records r on r.import_id=p_import_id and r.merchant_product_id=item->>'merchant_product_id')
 then raise exception 'Duplicate merchant product IDs across batches';end if;
 select count(*) filter(where item->>'status'='review'),
        count(*) filter(where item->>'status'='excluded')
 into v_review,v_excluded from jsonb_array_elements(p_rows) item;
 insert into public.feed_import_records(
  import_id,merchant_id,merchant_product_id,awin_product_id,title,price,currency,brand,category,status,reasons,image_url,metadata)
 select p_import_id,v_run.merchant_id,item->>'merchant_product_id',
   coalesce(item->>'awin_product_id',''),left(item->>'title',500),
   nullif(item->>'price','')::numeric,item->>'currency',
   left(coalesce(item->>'brand',''),250),left(coalesce(item->>'category',''),500),
   item->>'status',
   array(select jsonb_array_elements_text(coalesce(item->'reasons','[]'::jsonb))),
   item->>'image_url',item->'metadata'
 from jsonb_array_elements(p_rows) item;
 insert into public.large_feed_import_chunks(import_id,sequence,digest,row_count)
 values(p_import_id,p_sequence,p_digest,v_count);
 update public.large_feed_import_sessions
 set next_sequence=next_sequence+1,committed_count=committed_count+v_count,
 review_count=review_count+v_review,excluded_count=excluded_count+v_excluded
 where import_id=p_import_id returning * into v_session;
 return jsonb_build_object('next_sequence',v_session.next_sequence,'committed',v_session.committed_count,
 'review',v_session.review_count,'excluded',v_session.excluded_count,'duplicate_retry',false);
end $$;
revoke all on function public.append_general_awin_feed_chunk(uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.append_general_awin_feed_chunk(uuid,integer,text,jsonb) to service_role;

create or replace function public.finish_general_awin_feed_import(
 p_import_id uuid,p_total integer
) returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_session public.large_feed_import_sessions%rowtype;v_run public.feed_import_runs%rowtype;
begin
 select * into v_session from public.large_feed_import_sessions where import_id=p_import_id for update;
 if not found then raise exception 'Session missing';end if;
 select * into v_run from public.feed_import_runs where id=p_import_id;
 if v_run.status='private_review' and v_session.completed_at is not null then
  if v_session.committed_count<>p_total then raise exception 'Completed total mismatch';end if;
  return jsonb_build_object('total',p_total,'review',v_session.review_count,'excluded',v_session.excluded_count);
 end if;
 if v_run.status<>'importing' or v_run.filename !~ '^GENAWIN__[A-Za-z0-9_-]{1,30}__' or v_run.permission_status<>'unverified' then raise exception 'Not writable';end if;
 if p_total is null or p_total<1 or p_total>500000 or p_total<>v_session.committed_count
 then raise exception 'Import count mismatch';end if;
 update public.feed_import_runs set status='private_review',total_count=p_total,
   review_count=v_session.review_count,excluded_count=v_session.excluded_count where id=p_import_id;
 update public.large_feed_import_sessions set completed_at=now() where import_id=p_import_id;
 return jsonb_build_object('total',p_total,'review',v_session.review_count,'excluded',v_session.excluded_count);
end $$;
revoke all on function public.finish_general_awin_feed_import(uuid,integer) from public,anon,authenticated;
grant execute on function public.finish_general_awin_feed_import(uuid,integer) to service_role;
