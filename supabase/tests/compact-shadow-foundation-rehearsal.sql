do $rehearse$
declare d text:=repeat('a',64); d2 text:=repeat('b',64); c text:=repeat('c',64); o text:=repeat('d',64); r text;
begin
 for r in select unnest(array['anon','authenticated','service_role']) loop
  if has_schema_privilege(r,'avuqo_compact_shadow','USAGE') or
   has_table_privilege(r,'avuqo_compact_shadow.memberships','SELECT') or
   has_table_privilege(r,'avuqo_compact_shadow.snapshots','INSERT') or
   has_function_privilege(r,'avuqo_compact_shadow.guard_snapshot()','EXECUTE')
  then raise exception 'unexpected shadow access: %',r; end if;
 end loop;
 begin
  insert into avuqo_compact_shadow.content_payloads(hash,payload) values(c,'{"title":"Synthetic fixture"}');
  insert into avuqo_compact_shadow.observation_payloads(hash,payload) values(o,'{"status":"excluded","currency":""}');
  insert into avuqo_compact_shadow.snapshots(digest,journal_job_id,legacy_import_id,object_key,observed_at,expected_rows,expected_excluded) values
    (d,'00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','pneus-online/15236/26513/'||d||'.csv.gz',now(),2,2),
    (d2,'00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004','pneus-online/15236/26513/'||d2||'.csv.gz',now(),1,1);
  begin
   update avuqo_compact_shadow.snapshots set sealed_at=now() where digest=d;
   raise exception 'incomplete snapshot accepted';
  exception when check_violation then null; end;
  insert into avuqo_compact_shadow.memberships(snapshot_digest,sku,content_hash,observation_hash) values(d,'001',c,o);
  begin
   insert into avuqo_compact_shadow.memberships(snapshot_digest,sku,content_hash,observation_hash) values(d,'001',c,o);
   raise exception 'duplicate SKU accepted';
  exception when unique_violation then null; end;
  begin
   insert into avuqo_compact_shadow.memberships(snapshot_digest,sku,content_hash,observation_hash) values(d,'002',repeat('e',64),o);
   raise exception 'unknown payload accepted';
  exception when foreign_key_violation then null; end;
  insert into avuqo_compact_shadow.memberships(snapshot_digest,sku,content_hash,observation_hash) values(d,'002',c,o),(d2,'001',c,o);
  update avuqo_compact_shadow.snapshots set sealed_at=now() where digest in(d,d2);
  if (select count(*) from avuqo_compact_shadow.snapshots where sealed_at is not null)<>2 then raise exception 'seal failed'; end if;
  begin
   insert into avuqo_compact_shadow.memberships(snapshot_digest,sku,content_hash,observation_hash) values(d,'003',c,o);
   raise exception 'sealed snapshot accepted new member';
  exception when check_violation then null; end;
  begin
   update avuqo_compact_shadow.content_payloads set payload='{}' where hash=c;
   raise exception 'mutable payload accepted';
  exception when check_violation then null; end;
  begin
   delete from avuqo_compact_shadow.memberships where snapshot_digest=d;
   raise exception 'membership deletion accepted';
  exception when check_violation then null; end;
  raise exception 'rollback synthetic fixture' using errcode='PZ001';
 exception when sqlstate 'PZ001' then null;
 end;
 if exists(select 1 from avuqo_compact_shadow.snapshots) or exists(select 1 from avuqo_compact_shadow.memberships) or exists(select 1 from avuqo_compact_shadow.content_payloads) or exists(select 1 from avuqo_compact_shadow.observation_payloads) then raise exception 'fixture cleanup failed'; end if;
end
$rehearse$;
