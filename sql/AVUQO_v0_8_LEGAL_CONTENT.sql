-- Review in staging before applying. Requires existing public.is_avuqo_admin().
-- Separate legal tables avoid the original footer-only key constraints.
create table if not exists public.legal_content_drafts (
 slug text primary key check (slug in ('privacy','terms','cookies','affiliate-disclosure')),
 payload jsonb not null check (jsonb_typeof(payload)='object'),
 updated_by uuid references auth.users(id), updated_at timestamptz not null default now()
);
create table if not exists public.legal_content_published (
 slug text primary key check (slug in ('privacy','terms','cookies','affiliate-disclosure')),
 payload jsonb not null check (jsonb_typeof(payload)='object'),
 version integer not null check (version > 0), published_by uuid references auth.users(id), published_at timestamptz not null default now()
);
create table if not exists public.legal_content_revisions (
 slug text not null check (slug in ('privacy','terms','cookies','affiliate-disclosure')),
 version integer not null check (version > 0), payload jsonb not null,
 published_by uuid references auth.users(id), published_at timestamptz not null default now(),
 primary key(slug,version)
);
alter table public.legal_content_drafts enable row level security;
alter table public.legal_content_published enable row level security;
alter table public.legal_content_revisions enable row level security;
revoke all on public.legal_content_drafts, public.legal_content_published, public.legal_content_revisions from anon, authenticated;
grant select,insert,update on public.legal_content_drafts to authenticated;
grant select on public.legal_content_published to anon,authenticated;
grant select on public.legal_content_revisions to authenticated;
create policy "Legal admin draft select" on public.legal_content_drafts for select to authenticated using (public.is_avuqo_admin());
create policy "Legal admin draft insert" on public.legal_content_drafts for insert to authenticated with check (public.is_avuqo_admin() and updated_by = auth.uid());
create policy "Legal admin draft update" on public.legal_content_drafts for update to authenticated using (public.is_avuqo_admin()) with check (public.is_avuqo_admin() and updated_by = auth.uid());
create policy "Legal published visible" on public.legal_content_published for select to anon,authenticated using (true);
create policy "Legal admin revisions visible" on public.legal_content_revisions for select to authenticated using (public.is_avuqo_admin());
-- Atomic publish and revision insert; only owner may invoke. SECURITY DEFINER never trusts client-supplied payload.
create or replace function public.publish_avuqo_legal(p_slug text) returns integer
language plpgsql security definer set search_path = '' as $$
declare v_role text; v_payload jsonb; v_version integer;
begin
 if auth.uid() is null or p_slug not in ('privacy','terms','cookies','affiliate-disclosure') then raise exception 'Not authorized'; end if;
 select role into v_role from public.user_roles where user_id=auth.uid();
 if v_role is distinct from 'owner' then raise exception 'Only owner can publish'; end if;
 select payload into v_payload from public.legal_content_drafts where slug=p_slug;
 if v_payload is null then raise exception 'Draft not found'; end if;
 if jsonb_typeof(v_payload) <> 'object' or length(coalesce(v_payload->>'body',''))=0 or length(coalesce(v_payload->>'title',''))=0 then raise exception 'Invalid draft'; end if;
 perform pg_advisory_xact_lock(hashtext('avuqo_legal_' || p_slug));
 select coalesce(max(version),0)+1 into v_version from public.legal_content_revisions where slug=p_slug;
 insert into public.legal_content_revisions(slug,version,payload,published_by) values(p_slug,v_version,v_payload,auth.uid());
 insert into public.legal_content_published(slug,version,payload,published_by,published_at)
 values(p_slug,v_version,v_payload,auth.uid(),now())
 on conflict(slug) do update set version=excluded.version,payload=excluded.payload,published_by=excluded.published_by,published_at=excluded.published_at;
 return v_version;
end $$;
revoke all on function public.publish_avuqo_legal(text) from public,anon;
grant execute on function public.publish_avuqo_legal(text) to authenticated;
