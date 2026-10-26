-- Apply after existing Control Centre role migration. Review and test in staging.
create table if not exists public.editorial_drafts (
 key text primary key check (key in ('home','about','trust')),
 payload jsonb not null check (jsonb_typeof(payload)='object'),
 updated_by uuid references auth.users(id), updated_at timestamptz default now() not null
);
create table if not exists public.editorial_published (
 key text primary key check (key in ('home','about','trust')),
 payload jsonb not null check (jsonb_typeof(payload)='object'),
 version integer default 0 not null,
 published_by uuid references auth.users(id), published_at timestamptz default now() not null
);
create table if not exists public.editorial_revisions (
 key text not null check (key in ('home','about','trust')),
 version integer not null, payload jsonb not null,
 published_by uuid references auth.users(id), published_at timestamptz default now() not null,
 primary key(key,version)
);
alter table public.editorial_drafts enable row level security;
alter table public.editorial_published enable row level security;
alter table public.editorial_revisions enable row level security;
revoke all on public.editorial_drafts,public.editorial_published,public.editorial_revisions from anon, authenticated;
grant select on public.editorial_published to anon,authenticated;
grant select,insert,update on public.editorial_drafts to authenticated;
grant select on public.editorial_revisions to authenticated;
create policy "editors read drafts" on public.editorial_drafts for select to authenticated using (public.is_avuqo_admin());
create policy "editors insert drafts" on public.editorial_drafts for insert to authenticated with check (public.is_avuqo_admin());
create policy "editors update drafts" on public.editorial_drafts for update to authenticated using (public.is_avuqo_admin()) with check (public.is_avuqo_admin());
create policy "public reads published editorial" on public.editorial_published for select to anon,authenticated using (true);
create policy "editors read editorial revisions" on public.editorial_revisions for select to authenticated using (public.is_avuqo_admin());
-- Atomic publication. SECURITY DEFINER needed since browser role has no table write privileges.
create or replace function public.publish_editorial(p_key text)
returns integer language plpgsql security definer set search_path = public, pg_temp as $$
declare v_payload jsonb; v_version integer; v_role text;
begin
 select role into v_role from public.user_roles where user_id=auth.uid();
 if v_role is distinct from 'owner' then raise exception 'Only owner may publish'; end if;
 if p_key not in ('home','about','trust') then raise exception 'Invalid page'; end if;
 select payload into v_payload from public.editorial_drafts where key=p_key;
 if v_payload is null then raise exception 'Save draft first'; end if;
 if jsonb_typeof(v_payload) <> 'object' then raise exception 'Invalid data'; end if;
 select version into v_version from public.editorial_published where key=p_key for update;
 v_version := coalesce(v_version,0)+1;
 insert into public.editorial_published(key,payload,version,published_by,published_at)
 values(p_key,v_payload,v_version,auth.uid(),now())
 on conflict(key) do update set payload=excluded.payload, version=excluded.version,published_by=excluded.published_by,published_at=excluded.published_at;
 insert into public.editorial_revisions(key,payload,version,published_by)
 values(p_key,v_payload,v_version,auth.uid());
 return v_version;
end $$;
revoke all on function public.publish_editorial(text) from public, anon;
grant execute on function public.publish_editorial(text) to authenticated;
