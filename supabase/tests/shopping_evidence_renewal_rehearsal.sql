-- Operator-only rollback rehearsal against a real already-approved current cohort. Do not run on empty databases.
begin;
do $probe$
declare o record; r jsonb; before_count bigint;
begin
 select x.id,x.source_id,x.source_offer_id,m.metadata->>'external_id' advertiser,(x.raw_data->>'live_feed_verified_at')::timestamptz observed,v.approved_by actor
 into strict o from public.awin_shopping_release_reviews v join public.offers x on x.id=v.offer_id join public.merchants m on m.id=x.merchant_id
 where v.status='approved' and v.reviewed_offer_at=(x.raw_data->>'live_feed_verified_at')::timestamptz and x.last_seen_at>=now()-interval '48 hours' order by x.id limit 1;
 if shopping_private.automatic_shopping_review_mode(o.id,o.source_id,o.advertiser,o.source_offer_id,o.observed,o.actor)<>'held' then raise exception 'unchanged evidence'; end if;
 if shopping_private.automatic_shopping_review_mode(o.id,o.source_id,o.advertiser,o.source_offer_id,o.observed+interval '1 second',o.actor)<>'renew' then raise exception 'new evidence'; end if;
 if shopping_private.automatic_shopping_review_mode(o.id,o.source_id,o.advertiser,o.source_offer_id,o.observed+interval '1 second',null)<>'held' then raise exception 'actor'; end if;
 if shopping_private.automatic_shopping_review_mode(o.id,o.source_id,o.advertiser,'different',o.observed+interval '1 second',o.actor)<>'held' then raise exception 'identity'; end if;
 if shopping_private.automatic_shopping_review_mode(o.id,o.source_id,o.advertiser,o.source_offer_id,now()-interval '49 hours',o.actor)<>'held' then raise exception 'stale'; end if;
 begin
  perform 1 from public.offers where id=o.id for update;
  select count(*) into before_count from public.awin_shopping_release_audit where offer_id=o.id;
  update public.awin_shopping_release_reviews set reviewed_offer_at=o.observed-interval '1 second' where offer_id=o.id;
  r:=public.auto_review_active_shopping(2);
  if (r->>'renewed')::int<>1 or (r->>'failed')::int<>0 then raise exception 'renewal worker: %',r; end if;
  if not exists(select 1 from public.awin_shopping_release_reviews where offer_id=o.id and reviewed_offer_at=o.observed and status='approved') then raise exception 'review not renewed'; end if;
  if (select count(*) from public.awin_shopping_release_audit where offer_id=o.id)<>before_count+1 then raise exception 'audit missing'; end if;
  update public.awin_shopping_release_reviews set status='withdrawn',reviewed_offer_at=o.observed-interval '1 second' where offer_id=o.id;
  if shopping_private.automatic_shopping_review_mode(o.id,o.source_id,o.advertiser,o.source_offer_id,o.observed,o.actor)<>'held' then raise exception 'withdrawal'; end if;
  update public.awin_shopping_release_reviews set status='approved' where offer_id=o.id;
  update public.awin_shopping_release_audit set note='Manual test approval' where id=(select max(id) from public.awin_shopping_release_audit where offer_id=o.id);
  if shopping_private.automatic_shopping_review_mode(o.id,o.source_id,o.advertiser,o.source_offer_id,o.observed,o.actor)<>'held' then raise exception 'manual approval'; end if;
  raise exception using errcode='PZ001',message='test rollback';
 exception when sqlstate 'PZ001' then null; end;
end $probe$;
rollback;
