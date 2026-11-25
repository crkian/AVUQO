-- AVUQO private compact catalogue foundation: Pneus 15236:26513 only.
-- No live reader/writer, no grants to the Data API, no data copy or retention.
create schema avuqo_compact_shadow;
revoke all on schema avuqo_compact_shadow from public, anon, authenticated, service_role;

create table avuqo_compact_shadow.content_payloads (
 hash text primary key check (hash ~ '^[a-f0-9]{64}$'),
 payload jsonb not null check (jsonb_typeof(payload)='object'),
 created_at timestamptz not null default now()
);
create table avuqo_compact_shadow.observation_payloads (
 hash text primary key check (hash ~ '^[a-f0-9]{64}$'),
 payload jsonb not null check (jsonb_typeof(payload)='object' and coalesce(payload->>'status','') in ('review','excluded')),
 created_at timestamptz not null default now()
);
create table avuqo_compact_shadow.snapshots (
 digest text primary key check (digest ~ '^[a-f0-9]{64}$'),
 scope text not null default 'awin:15236:26513' check (scope='awin:15236:26513'),
 format_version text not null default 'pneus-shadow-v1' check (format_version='pneus-shadow-v1'),
 journal_job_id uuid not null unique,
 legacy_import_id uuid not null unique,
 object_key text not null check (object_key='pneus-online/15236/26513/'||digest||'.csv.gz'),
 observed_at timestamptz not null,
 expected_rows integer not null check (expected_rows between 1 and 100000),
 expected_excluded integer not null check (expected_excluded between 0 and expected_rows),
 sealed_at timestamptz,
 created_at timestamptz not null default now()
);
create table avuqo_compact_shadow.memberships (
 snapshot_digest text not null references avuqo_compact_shadow.snapshots(digest),
 sku text not null check (char_length(sku) between 1 and 250 and sku=btrim(sku)),
 content_hash text not null references avuqo_compact_shadow.content_payloads(hash),
 observation_hash text not null references avuqo_compact_shadow.observation_payloads(hash),
 source_updated_at text,
 primary key(snapshot_digest,sku)
);
create index compact_shadow_membership_content on avuqo_compact_shadow.memberships(content_hash);
create index compact_shadow_membership_observation on avuqo_compact_shadow.memberships(observation_hash);

alter table avuqo_compact_shadow.content_payloads enable row level security;
alter table avuqo_compact_shadow.observation_payloads enable row level security;
alter table avuqo_compact_shadow.snapshots enable row level security;
alter table avuqo_compact_shadow.memberships enable row level security;
revoke all on all tables in schema avuqo_compact_shadow from public, anon, authenticated, service_role;

create function avuqo_compact_shadow.deny_mutation() returns trigger
language plpgsql security invoker set search_path=pg_catalog as $$
begin raise exception 'compact shadow rows are immutable' using errcode='23514'; end;
$$;
create function avuqo_compact_shadow.guard_membership() returns trigger
language plpgsql security invoker set search_path=pg_catalog as $$
declare v_sealed timestamptz;
begin
 select sealed_at into v_sealed from avuqo_compact_shadow.snapshots where digest=new.snapshot_digest for update;
 if not found then raise exception 'unknown snapshot' using errcode='23503'; end if;
 if v_sealed is not null then raise exception 'snapshot already sealed' using errcode='23514'; end if;
 return new;
end;
$$;
create function avuqo_compact_shadow.guard_snapshot() returns trigger
language plpgsql security invoker set search_path=pg_catalog as $$
declare v_count bigint; v_excluded bigint;
begin
 if tg_op='DELETE' then raise exception 'snapshot deletion not permitted' using errcode='23514'; end if;
 if tg_op='INSERT' then
  if new.sealed_at is not null then raise exception 'cannot insert sealed snapshot' using errcode='23514'; end if;
  return new;
 end if;
 if old.sealed_at is not null or new.sealed_at is null or
   (to_jsonb(old)-'sealed_at') is distinct from (to_jsonb(new)-'sealed_at')
 then raise exception 'snapshot mutation not permitted' using errcode='23514'; end if;
 select count(*),count(*) filter(where o.payload->>'status'='excluded')
 into v_count,v_excluded
 from avuqo_compact_shadow.memberships m
 join avuqo_compact_shadow.observation_payloads o on o.hash=m.observation_hash
 where m.snapshot_digest=old.digest;
 if v_count<>old.expected_rows or v_excluded<>old.expected_excluded
 then raise exception 'snapshot completeness mismatch' using errcode='23514'; end if;
 return new;
end;
$$;
create trigger compact_content_immutable before update or delete on avuqo_compact_shadow.content_payloads for each row execute function avuqo_compact_shadow.deny_mutation();
create trigger compact_observation_immutable before update or delete on avuqo_compact_shadow.observation_payloads for each row execute function avuqo_compact_shadow.deny_mutation();
create trigger compact_membership_immutable before update or delete on avuqo_compact_shadow.memberships for each row execute function avuqo_compact_shadow.deny_mutation();
create trigger compact_membership_insert before insert on avuqo_compact_shadow.memberships for each row execute function avuqo_compact_shadow.guard_membership();
create trigger compact_snapshot_guard before insert or update or delete on avuqo_compact_shadow.snapshots for each row execute function avuqo_compact_shadow.guard_snapshot();
revoke all on all functions in schema avuqo_compact_shadow from public, anon, authenticated, service_role;

comment on schema avuqo_compact_shadow is 'Dormant private Pneus compact shadow. No Data API grants, no public reader, no automatic ingestion, no retention.';
comment on column avuqo_compact_shadow.snapshots.sealed_at is 'Structural count seal only. Not source digest verification, historical parity, rights approval, or permission to delete legacy evidence.';
comment on column avuqo_compact_shadow.snapshots.journal_job_id is 'External provenance reference; no production foreign key or cascade. Future authorised writer must verify exact binding and restore evidence.';
