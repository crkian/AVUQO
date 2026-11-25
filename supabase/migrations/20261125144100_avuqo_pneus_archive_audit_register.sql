-- Aggregate-only recovery evidence, isolated from catalogue writes.
create table public.awin_pneus_archive_audits (
 audit_day date primary key default ((now() at time zone 'UTC')::date),
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 outcome text not null default 'started' check(outcome in ('started','exact_normalized_parity','normalized_parity_mismatch','source_rights_or_controls_blocked','completed_snapshot_unavailable','journal_binding_mismatch','archive_unavailable_or_size_limit','parity_time_limit','legacy_page_incomplete','legacy_count_changed','recovery_unavailable','unexpected_result')),
 observed_at timestamptz,
 archive_digest_verified boolean not null default false,
 archive_rows integer check(archive_rows between 1 and 25000),
 checked integer check(checked between 0 and 25000),
 matched integer check(matched between 0 and 25000),
 mismatched integer check(mismatched between 0 and 25000),
 compressed_bytes integer check(compressed_bytes between 2 and 37748736),
 check((outcome='started')=(finished_at is null)),
 check(outcome<>'exact_normalized_parity' or (archive_digest_verified and observed_at is not null and archive_rows is not null and checked is not null and matched is not null and mismatched is not null and archive_rows=checked and checked=matched and mismatched=0))
);
alter table public.awin_pneus_archive_audits enable row level security;
revoke all on public.awin_pneus_archive_audits from public,anon,authenticated,service_role;
grant select,insert,update on public.awin_pneus_archive_audits to service_role;
create function public.guard_pneus_archive_audit() returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
 if tg_op='INSERT' then
  if new.outcome<>'started' or new.audit_day<>((now() at time zone 'UTC')::date) or new.finished_at is not null or new.archive_digest_verified or new.observed_at is not null or new.archive_rows is not null or new.checked is not null or new.matched is not null or new.mismatched is not null or new.compressed_bytes is not null then raise exception 'audit must start empty' using errcode='23514'; end if;
 elsif old.outcome<>'started' or new.outcome='started' or new.audit_day<>old.audit_day or new.started_at<>old.started_at or new.finished_at<old.started_at then raise exception 'audit is immutable after completion' using errcode='23514';
 end if;
 return new;
end $$;
revoke all on function public.guard_pneus_archive_audit() from public,anon,authenticated,service_role;
create trigger guard_pneus_archive_audit before insert or update on public.awin_pneus_archive_audits for each row execute function public.guard_pneus_archive_audit();
comment on table public.awin_pneus_archive_audits is 'Daily private aggregate audit evidence only. No supplier payload, digest, SKU, URL or deletion/publication authority; service API writes only.';
