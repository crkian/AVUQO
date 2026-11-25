do $test$
declare d text:=repeat('a',64); h text; o text; rr text;
begin
 for rr in select unnest(array['anon','authenticated','service_role']) loop
  if has_function_privilege(rr,'avuqo_compact_shadow.begin_verified_snapshot(uuid,text)','EXECUTE') or has_function_privilege(rr,'avuqo_compact_shadow.pool_payload(text,text)','EXECUTE')
  then raise exception 'unexpected writer grant'; end if;
 end loop;
 begin
 h:=avuqo_compact_shadow.pool_payload('content','{"title":"Synthetic fixture"}');
 if h is distinct from avuqo_compact_shadow.pool_payload('content','{"title":"Synthetic fixture"}') or (select count(*) from avuqo_compact_shadow.content_payloads)<>1 then raise exception 'pool retry failed'; end if;
 o:=avuqo_compact_shadow.pool_payload('observation','{"currency":"","status":"excluded"}');
 begin perform avuqo_compact_shadow.pool_payload('invalid','{}'); raise exception 'invalid kind accepted'; exception when check_violation then null; end;
 begin
 insert into avuqo_compact_shadow.snapshots(digest,journal_job_id,legacy_import_id,object_key,observed_at,expected_rows,expected_excluded)
 values(d,'00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','pneus-online/15236/26513/'||d||'.csv.gz',now(),1,1);
 set constraints avuqo_compact_shadow.compact_snapshot_commit_guard immediate;
 raise exception 'unsealed commit accepted';
 exception when check_violation then null; end;
 insert into avuqo_compact_shadow.snapshots(digest,journal_job_id,legacy_import_id,object_key,observed_at,expected_rows,expected_excluded)
 values(d,'00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','pneus-online/15236/26513/'||d||'.csv.gz',now(),1,1);
 insert into avuqo_compact_shadow.memberships(snapshot_digest,sku,content_hash,observation_hash) values(d,'001',h,o);
 update avuqo_compact_shadow.snapshots set sealed_at=now() where digest=d;
 set constraints avuqo_compact_shadow.compact_snapshot_commit_guard immediate;
 raise exception 'rollback fixture' using errcode='PZ003';
 exception when sqlstate 'PZ003' then null; end;
 if exists(select 1 from avuqo_compact_shadow.snapshots) or exists(select 1 from avuqo_compact_shadow.memberships) or exists(select 1 from avuqo_compact_shadow.content_payloads) or exists(select 1 from avuqo_compact_shadow.observation_payloads) then raise exception 'fixture cleanup failed'; end if;
end $test$;