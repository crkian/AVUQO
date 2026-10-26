-- Run in Supabase SQL Editor after reviewing against your production schema.
-- Published and draft content are isolated so anonymous users cannot read drafts.
create table if not exists public.site_content_drafts (
  key text primary key check (key in ('footer')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
create table if not exists public.site_content_published (
  key text primary key check (key in ('footer')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  version integer not null default 1,
  published_by uuid references auth.users(id),
  published_at timestamptz not null default now()
);
create table if not exists public.site_content_revisions (
  id bigint generated always as identity primary key,
  key text not null check (key in ('footer')),
  payload jsonb not null,
  version integer not null,
  published_by uuid references auth.users(id),
  published_at timestamptz not null default now(),
  unique(key,version)
);
alter table public.site_content_drafts enable row level security;
alter table public.site_content_published enable row level security;
alter table public.site_content_revisions enable row level security;
revoke all on public.site_content_drafts, public.site_content_published, public.site_content_revisions from anon, authenticated;
grant select on public.site_content_published to anon, authenticated;
grant select, insert, update on public.site_content_drafts to authenticated;
grant insert, update on public.site_content_published to authenticated;
grant select, insert on public.site_content_revisions to authenticated;
create policy "Public may read published website content" on public.site_content_published
  for select to anon, authenticated using (true);
create policy "Admins may edit website drafts" on public.site_content_drafts
  for all to authenticated using (public.is_avuqo_admin()) with check (public.is_avuqo_admin());
create policy "Admins may publish content" on public.site_content_published
  for insert to authenticated with check (public.is_avuqo_admin());
create policy "Admins may update published content" on public.site_content_published
  for update to authenticated using (public.is_avuqo_admin()) with check (public.is_avuqo_admin());
create policy "Admins may review revisions" on public.site_content_revisions
  for select to authenticated using (public.is_avuqo_admin());
create policy "Admins may create revisions" on public.site_content_revisions
  for insert to authenticated with check (public.is_avuqo_admin());
-- No default seed: public site retains its hard-coded trusted footer until explicitly published.
