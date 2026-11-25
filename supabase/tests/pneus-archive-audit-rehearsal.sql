do $test$ begin
 if has_table_privilege('anon','public.awin_pneus_archive_audits','SELECT') or has_table_privilege('authenticated','public.awin_pneus_archive_audits','SELECT') or has_table_privilege('service_role','public.awin_pneus_archive_audits','DELETE') then raise exception 'unexpected grant'; end if;
 begin
 insert into public.awin_pneus_archive_audits default values;
 begin insert into public.awin_pneus_archive_audits default values; raise exception 'duplicate daily lease accepted'; exception when unique_violation then null; end;
 begin update public.awin_pneus_archive_audits set outcome='exact_normalized_parity',finished_at=now(); raise exception 'false parity accepted'; exception when check_violation then null; end;
 update public.awin_pneus_archive_audits set outcome='exact_normalized_parity',finished_at=now(),observed_at=now(),archive_digest_verified=true,archive_rows=2,checked=2,matched=2,mismatched=0;
 begin update public.awin_pneus_archive_audits set matched=1; raise exception 'completed audit mutable'; exception when check_violation then null; end;
 raise exception 'rollback fixture' using errcode='PZ008';
 exception when sqlstate 'PZ008' then null; end;
 if exists(select 1 from public.awin_pneus_archive_audits) then raise exception 'fixture remains'; end if;
end $test$;