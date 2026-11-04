-- Private, resumable import: atomic, idempotent chunk inserts. No product publishing.
-- Existing run status only allows private_review; an unfinished run must not appear complete.
alter table public.feed_import_runs drop constraint if exists feed_import_runs_status_check;
alter table public.feed_import_runs add constraint feed_import_runs_status_check
 check(status in ('importing','private_review'));
create table if not exists public.large_feed_import_sessions (
 import_id uuid primary key references public.feed_import_runs(id) on delete cascade,
 source_digest text not null check (source_digest ~ '^[a-f0-9]{64} next_sequence integer not null default 0 check (next_sequence>=0),
 committed_count integer not null default 0 check (committed_count>=0),
 review_count integer not null default 0 check (review_count>=0),
 excluded_count integer not null default 0 check (excluded_count>=0),
 created_at timestamptz not null default now(),
 completed_at timestamptz
);
create table if not exists public.large_feed_import_chunks (
 import_id uuid not null references public.large_feed_import_sessions(import_id) on delete cascade,
 sequence integer not null check (sequence>=0),
 digest text not null check (digest ~ '^[a-f0-9]{64}$'),
 row_count integer not null check (row_count between 1 and 250),
 primary key(import_id,sequence)
);
create index if not exists feed_import_records_run_product_lookup
 on public.feed_import_records(import_id,merchant_product_id);
alter table public.large_feed_import_sessions enable row level security;
alter table public.large_feed_import_chunks enable row level security;
revoke all on table public.large_feed_import_sessions from public,anon,authenticated;
revoke all on table public.large_feed_import_chunks from public,anon,authenticated;
grant select,insert,update,delete on table public.large_feed_import_sessions to service_role;
grant select,insert,update,delete on table public.large_feed_import_chunks to service_role;

create or replace function public.append_tooled_up_large_feed_chunk(
 p_import_id uuid,p_sequence integer,p_digest text,p_rows jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
 v_session public.large_feed_import_sessions%rowtype;
 v_run public.feed_import_runs%rowtype;
 v_existing public.large_feed_import_chunks%rowtype;
 v_count integer;
 v_review integer;
 v_excluded integer;
begin
 if p_sequence is null or p_sequence < 0 or p_digest !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(p_rows) <> 'array' then raise exception 'Invalid chunk arguments'; end if;
 v_count:=jsonb_array_length(p_rows);
 if v_count < 1 or v_count > 250 then raise exception 'Chunk must contain 1-250 records'; end if;
 select * into v_session from public.large_feed_import_sessions
 where import_id=p_import_id for update;
 if not found then raise exception 'Import session is missing'; end if;
 select * into v_run from public.feed_import_runs where id=p_import_id;
 if v_run.merchant_id<>'496' or v_run.status<>'importing' or v_session.completed_at is not null then
  raise exception 'This import session is not writable';
 end if;
 select * into v_existing from public.large_feed_import_chunks
 where import_id=p_import_id and sequence=p_sequence;
 if found then
  if v_existing.digest<>p_digest or v_existing.row_count<>v_count then
   raise exception 'Retry does not match the original chunk';
  end if;
  return jsonb_build_object('next_sequence',v_session.next_sequence,
    'committed',v_session.committed_count,'duplicate_retry',true);
 end if;
 if v_session.next_sequence<>p_sequence then raise exception 'Chunk sequence is out of order'; end if;
 if exists(select 1 from jsonb_array_elements(p_rows) as item
  where item->>'merchant_id'<>'496'
   or item->>'merchant_product_id' is null
   or item->>'merchant_product_id'=''
   or item->>'status' not in ('review','excluded')) then
  raise exception 'Chunk contains invalid or cross-advertiser records';
 end if;
 if exists(select 1 from jsonb_array_elements(p_rows) as item
  join public.feed_import_records existing
  on existing.import_id=p_import_id and existing.merchant_product_id=item->>'merchant_product_id') then
  raise exception 'Merchant product IDs already exist in this run';
 end if;
 if (select count(distinct item->>'merchant_product_id') from jsonb_array_elements(p_rows) item)<>v_count then
  raise exception 'Duplicate product IDs in chunk';
 end if;
 select count(*) filter(where item->>'status'='review'),
        count(*) filter(where item->>'status'='excluded')
 into v_review,v_excluded from jsonb_array_elements(p_rows) item;
 insert into public.feed_import_records(
   import_id,merchant_id,merchant_product_id,awin_product_id,title,
   price,currency,brand,category,status,reasons,image_url,metadata)
 select p_import_id,'496',item->>'merchant_product_id',item->>'awin_product_id',
   left(item->>'title',500),nullif(item->>'price','')::numeric,
   item->>'currency',left(coalesce(item->>'brand',''),250),
   left(coalesce(item->>'category',''),500),item->>'status',
   array(select jsonb_array_elements_text(coalesce(item->'reasons','[]'::jsonb))),
   item->>'image_url',coalesce(item->'metadata','{}'::jsonb)
 from jsonb_array_elements(p_rows) item;
 insert into public.large_feed_import_chunks(import_id,sequence,digest,row_count)
 values(p_import_id,p_sequence,p_digest,v_count);
 update public.large_feed_import_sessions
 set next_sequence=next_sequence+1,committed_count=committed_count+v_count,
     review_count=review_count+v_review,excluded_count=excluded_count+v_excluded
 where import_id=p_import_id
 returning * into v_session;
 return jsonb_build_object('next_sequence',v_session.next_sequence,
   'committed',v_session.committed_count,'review',v_session.review_count,
   'excluded',v_session.excluded_count,'duplicate_retry',false);
end $$;
revoke all on function public.append_tooled_up_large_feed_chunk(uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.append_tooled_up_large_feed_chunk(uuid,integer,text,jsonb) to service_role;

create or replace function public.finish_tooled_up_large_feed_import(
 p_import_id uuid,p_total integer
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare v_session public.large_feed_import_sessions%rowtype;v_run public.feed_import_runs%rowtype;
begin
 select * into v_session from public.large_feed_import_sessions where import_id=p_import_id for update;
 if not found then raise exception 'Import session is missing';end if;
 select * into v_run from public.feed_import_runs where id=p_import_id;
 if v_run.status='private_review' and v_session.completed_at is not null then
  if v_session.committed_count<>p_total then raise exception 'Completed import total does not match';end if;
  return jsonb_build_object('total',p_total,'review',v_session.review_count,'excluded',v_session.excluded_count);
 end if;
 if v_run.merchant_id<>'496' or v_run.status<>'importing' then raise exception 'Import cannot be finished';end if;
 if p_total is null or p_total<1 or p_total<>v_session.committed_count then raise exception 'Imported row total mismatch';end if;
 update public.feed_import_runs
 set status='private_review',total_count=p_total,
 review_count=v_session.review_count,excluded_count=v_session.excluded_count
 where id=p_import_id;
 update public.large_feed_import_sessions set completed_at=now() where import_id=p_import_id;
 return jsonb_build_object('total',p_total,'review',v_session.review_count,'excluded',v_session.excluded_count);
end $$;
revoke all on function public.finish_tooled_up_large_feed_import(uuid,integer) from public,anon,authenticated;
grant execute on function public.finish_tooled_up_large_feed_import(uuid,integer) to service_role;
),
 next_sequence integer not null default 0 check (next_sequence>=0),
 committed_count integer not null default 0 check (committed_count>=0),
 review_count integer not null default 0 check (review_count>=0),
 excluded_count integer not null default 0 check (excluded_count>=0),
 created_at timestamptz not null default now(),
 completed_at timestamptz
);
create table if not exists public.large_feed_import_chunks (
 import_id uuid not null references public.large_feed_import_sessions(import_id) on delete cascade,
 sequence integer not null check (sequence>=0),
 digest text not null check (digest ~ '^[a-f0-9]{64}$'),
 row_count integer not null check (row_count between 1 and 250),
 primary key(import_id,sequence)
);
create index if not exists feed_import_records_run_product_lookup
 on public.feed_import_records(import_id,merchant_product_id);
alter table public.large_feed_import_sessions enable row level security;
alter table public.large_feed_import_chunks enable row level security;
revoke all on table public.large_feed_import_sessions from public,anon,authenticated;
revoke all on table public.large_feed_import_chunks from public,anon,authenticated;
grant select,insert,update,delete on table public.large_feed_import_sessions to service_role;
grant select,insert,update,delete on table public.large_feed_import_chunks to service_role;

create or replace function public.append_tooled_up_large_feed_chunk(
 p_import_id uuid,p_sequence integer,p_digest text,p_rows jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
 v_session public.large_feed_import_sessions%rowtype;
 v_run public.feed_import_runs%rowtype;
 v_existing public.large_feed_import_chunks%rowtype;
 v_count integer;
 v_review integer;
 v_excluded integer;
begin
 if p_sequence is null or p_sequence < 0 or p_digest !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(p_rows) <> 'array' then raise exception 'Invalid chunk arguments'; end if;
 v_count:=jsonb_array_length(p_rows);
 if v_count < 1 or v_count > 250 then raise exception 'Chunk must contain 1-250 records'; end if;
 select * into v_session from public.large_feed_import_sessions
 where import_id=p_import_id for update;
 if not found then raise exception 'Import session is missing'; end if;
 select * into v_run from public.feed_import_runs where id=p_import_id;
 if v_run.merchant_id<>'496' or v_run.status<>'importing' or v_session.completed_at is not null then
  raise exception 'This import session is not writable';
 end if;
 select * into v_existing from public.large_feed_import_chunks
 where import_id=p_import_id and sequence=p_sequence;
 if found then
  if v_existing.digest<>p_digest or v_existing.row_count<>v_count then
   raise exception 'Retry does not match the original chunk';
  end if;
  return jsonb_build_object('next_sequence',v_session.next_sequence,
    'committed',v_session.committed_count,'duplicate_retry',true);
 end if;
 if v_session.next_sequence<>p_sequence then raise exception 'Chunk sequence is out of order'; end if;
 if exists(select 1 from jsonb_array_elements(p_rows) as item
  where item->>'merchant_id'<>'496'
   or item->>'merchant_product_id' is null
   or item->>'merchant_product_id'=''
   or item->>'status' not in ('review','excluded')) then
  raise exception 'Chunk contains invalid or cross-advertiser records';
 end if;
 if exists(select 1 from jsonb_array_elements(p_rows) as item
  join public.feed_import_records existing
  on existing.import_id=p_import_id and existing.merchant_product_id=item->>'merchant_product_id') then
  raise exception 'Merchant product IDs already exist in this run';
 end if;
 if (select count(distinct item->>'merchant_product_id') from jsonb_array_elements(p_rows) item)<>v_count then
  raise exception 'Duplicate product IDs in chunk';
 end if;
 select count(*) filter(where item->>'status'='review'),
        count(*) filter(where item->>'status'='excluded')
 into v_review,v_excluded from jsonb_array_elements(p_rows) item;
 insert into public.feed_import_records(
   import_id,merchant_id,merchant_product_id,awin_product_id,title,
   price,currency,brand,category,status,reasons,image_url,metadata)
 select p_import_id,'496',item->>'merchant_product_id',item->>'awin_product_id',
   left(item->>'title',500),nullif(item->>'price','')::numeric,
   item->>'currency',left(coalesce(item->>'brand',''),250),
   left(coalesce(item->>'category',''),500),item->>'status',
   array(select jsonb_array_elements_text(coalesce(item->'reasons','[]'::jsonb))),
   item->>'image_url',coalesce(item->'metadata','{}'::jsonb)
 from jsonb_array_elements(p_rows) item;
 insert into public.large_feed_import_chunks(import_id,sequence,digest,row_count)
 values(p_import_id,p_sequence,p_digest,v_count);
 update public.large_feed_import_sessions
 set next_sequence=next_sequence+1,committed_count=committed_count+v_count,
     review_count=review_count+v_review,excluded_count=excluded_count+v_excluded
 where import_id=p_import_id
 returning * into v_session;
 return jsonb_build_object('next_sequence',v_session.next_sequence,
   'committed',v_session.committed_count,'review',v_session.review_count,
   'excluded',v_session.excluded_count,'duplicate_retry',false);
end $$;
revoke all on function public.append_tooled_up_large_feed_chunk(uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.append_tooled_up_large_feed_chunk(uuid,integer,text,jsonb) to service_role;

create or replace function public.finish_tooled_up_large_feed_import(
 p_import_id uuid,p_total integer
) returns jsonb
language plpgsql security definer set search_path=''
as $$
declare v_session public.large_feed_import_sessions%rowtype;v_run public.feed_import_runs%rowtype;
begin
 select * into v_session from public.large_feed_import_sessions where import_id=p_import_id for update;
 if not found then raise exception 'Import session is missing';end if;
 select * into v_run from public.feed_import_runs where id=p_import_id;
 if v_run.status='private_review' and v_session.completed_at is not null then
  if v_session.committed_count<>p_total then raise exception 'Completed import total does not match';end if;
  return jsonb_build_object('total',p_total,'review',v_session.review_count,'excluded',v_session.excluded_count);
 end if;
 if v_run.merchant_id<>'496' or v_run.status<>'importing' then raise exception 'Import cannot be finished';end if;
 if p_total is null or p_total<1 or p_total<>v_session.committed_count then raise exception 'Imported row total mismatch';end if;
 update public.feed_import_runs
 set status='private_review',total_count=p_total,
 review_count=v_session.review_count,excluded_count=v_session.excluded_count
 where id=p_import_id;
 update public.large_feed_import_sessions set completed_at=now() where import_id=p_import_id;
 return jsonb_build_object('total',p_total,'review',v_session.review_count,'excluded',v_session.excluded_count);
end $$;
revoke all on function public.finish_tooled_up_large_feed_import(uuid,integer) from public,anon,authenticated;
grant execute on function public.finish_tooled_up_large_feed_import(uuid,integer) to service_role;
