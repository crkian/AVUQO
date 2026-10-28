-- Adds internal annotations only. Does not change validation status or publication state.
alter table public.feed_import_records
  add column if not exists review_decision text not null default 'pending',
  add column if not exists review_notes text not null default '',
  add column if not exists reviewed_by uuid references auth.users(id),
  add column if not exists reviewed_at timestamptz;

do $$ begin
 if not exists (select 1 from pg_constraint where conname = 'feed_import_review_decision_check') then
  alter table public.feed_import_records add constraint feed_import_review_decision_check
  check (review_decision in ('pending','checked','needs_attention'));
 end if;
end $$;

-- Explicitly allow owner/admin annotations only. Base imported feed fields are unchanged by API.
create policy "admin update feed review" on public.feed_import_records
 for update to authenticated
 using (exists (
   select 1 from public.feed_import_runs run where run.id = import_id and exists (
     select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role in ('owner','admin')
   )
 ))
 with check (exists (
   select 1 from public.feed_import_runs run where run.id = import_id and exists (
     select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role in ('owner','admin')
   )
 ));
