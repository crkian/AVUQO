-- Rollback-only writer rehearsal against a complete existing journal.
-- Builds split payloads from legacy DB records, NOT archive bytes.
-- Never use this as an actual import or proof of archive parity.
do $test$
declare j public.awin_bulk_import_jobs%rowtype; f record; d text; c jsonb; o jsonb; m jsonb; terms text[]:=array['rrp_price','store_price','sale_price','sale_price_effective_date','saving','savings_percent','delivery_cost','delivery_time','shipping','unit_pricing_measure','unit_pricing_base_measure','stock_quantity','valid_from','valid_to']; batch jsonb:='[]'; v jsonb; n integer:=0; started timestamptz:=clock_timestamp(); wrong jsonb;
begin
 if exists(select 1 from avuqo_compact_shadow.snapshots) then raise exception 'rehearsal requires empty shadow'; end if;
 select * into j from public.awin_bulk_import_jobs where advertiser_id='15236' and feed_id='26513' and state='completed' order by created_at desc limit 1;
 if not found or j.validated_total>25000 then raise exception 'bounded completed snapshot missing'; end if;
 begin
 d:=avuqo_compact_shadow.begin_verified_snapshot(j.id,j.snapshot_sha256);
 for f in select * from public.feed_import_records where import_id=j.private_import_id order by merchant_product_id loop
 m:=f.metadata;
 c:=jsonb_build_object('awin_product_id',f.awin_product_id,'title',f.title,'brand',f.brand,'category',f.category,'image_url',f.image_url,
 'metadata',(m-array['availability','availability_source','source_updated_at','source_catalogue_fields','source_currency_explicit','price_observation_kind'])||jsonb_build_object('source_catalogue_fields',(m->'source_catalogue_fields')-terms));
 o:=jsonb_build_object('price',f.price::text,'currency',f.currency,'status',f.status,'reasons',f.reasons,'availability',m->'availability','availability_source',m->'availability_source','source_currency_explicit',m->'source_currency_explicit','price_observation_kind',m->'price_observation_kind','termFields',(select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from jsonb_each(m->'source_catalogue_fields') where key=any(terms)));
 v:=jsonb_build_object('sku',f.merchant_product_id,'content_text',c::text,'observation_text',o::text,'source_updated_at',m->'source_updated_at');
 if n=0 then
  wrong:=v||jsonb_build_object('content_text',(c||jsonb_build_object('title','Synthetic mismatch'))::text);
  begin perform avuqo_compact_shadow.append_verified_batch(d,jsonb_build_array(wrong)); raise exception 'mismatch accepted'; exception when check_violation then null; end;
 end if;
 batch:=batch||jsonb_build_array(v); n:=n+1;
 if jsonb_array_length(batch)=250 then
  if avuqo_compact_shadow.append_verified_batch(d,batch)<>250 then raise exception 'batch count mismatch'; end if;
  batch:='[]';
 end if;
 end loop;
 if jsonb_array_length(batch)>0 then perform avuqo_compact_shadow.append_verified_batch(d,batch); end if;
 if n<>j.validated_total then raise exception 'unexpected source count'; end if;
 if avuqo_compact_shadow.seal_verified_snapshot(d)<>n then raise exception 'seal count mismatch'; end if;
 set constraints avuqo_compact_shadow.compact_snapshot_commit_guard immediate;
 raise notice 'rollback-only legacy rehearsal: % rows',n;
 raise exception 'rollback successful fixture' using errcode='PZ007';
 exception when sqlstate 'PZ007' then null; end;
 if exists(select 1 from avuqo_compact_shadow.snapshots) or exists(select 1 from avuqo_compact_shadow.memberships) or exists(select 1 from avuqo_compact_shadow.content_payloads) or exists(select 1 from avuqo_compact_shadow.observation_payloads) then raise exception 'rollback failed'; end if;
end $test$;