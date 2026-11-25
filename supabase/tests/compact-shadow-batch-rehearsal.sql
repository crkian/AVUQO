do $test$
declare c jsonb:='{"title":"Synthetic tyre","metadata":{"feed_id":"26513","release_approved":false,"tyre_fitment_verified":false,"source_image_rights_confirmed":false,"source_description_rights_confirmed":false,"source_catalogue_fields":{"size":"205/55R16"}}}'; o jsonb:='{"price":"89.90","currency":"","status":"excluded","reasons":["explicit_currency_missing"],"source_currency_explicit":false,"termFields":{"delivery_cost":"5"}}'; v jsonb; r text;
begin
 for r in select unnest(array['anon','authenticated','service_role']) loop
 if has_function_privilege(r,'avuqo_compact_shadow.append_verified_batch(text,jsonb)','EXECUTE') or has_function_privilege(r,'avuqo_compact_shadow.seal_verified_snapshot(text)','EXECUTE') then raise exception 'unexpected API grant'; end if;
 end loop;
 v:=avuqo_compact_shadow.reconstruct_row('001',c,o,null);
 if v->>'merchant_product_id'<>'001' or v->>'price'<>'89.90' or v->'metadata'->'source_catalogue_fields'->>'delivery_cost'<>'5' or v->'metadata'->'source_catalogue_fields'->>'size'<>'205/55R16' or v->'metadata'->'source_updated_at' is distinct from 'null'::jsonb then raise exception 'reconstruction mismatch'; end if;
 begin perform avuqo_compact_shadow.reconstruct_row('001',c,o||'{"currency":"GBP"}',null); raise exception 'inferred currency accepted'; exception when check_violation then null; end;
 begin perform avuqo_compact_shadow.reconstruct_row('001',jsonb_set(c,'{metadata,release_approved}','true'),o,null); raise exception 'release flag accepted'; exception when check_violation then null; end;
 if avuqo_compact_shadow.legacy_row('00000000-0000-4000-8000-000000000099','001') is not null then raise exception 'missing legacy row accepted'; end if;
 if exists(select 1 from avuqo_compact_shadow.snapshots) then raise exception 'unexpected snapshot'; end if;
end $test$;
