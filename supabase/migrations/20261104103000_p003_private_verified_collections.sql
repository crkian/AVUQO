-- P0-03: personal planning collections are owner-only, and only the
-- authenticated server verification route may create/change their snapshots.
-- Standard collaborative lists and the existing Saved/Watches policies remain.
-- Existing data is preserved; this migration does not insert customer rows.

begin;
alter table public.shared_lists enable row level security;
alter table public.shared_list_items enable row level security;
alter table public.shared_list_members enable row level security;

-- Exactly one private basket and wishlist per account, and one item key per list.
-- Partial uniqueness keeps the ability to have many "standard" named lists.
create unique index if not exists shared_lists_one_planning_kind_per_owner
  on public.shared_lists (owner_id,list_type)
  where list_type in ('wishlist','basket');
create unique index if not exists shared_list_items_one_key_per_list
  on public.shared_list_items (list_id,item_key)
  where item_key is not null;

-- Existing permissive owner/member policies are supplemented by restrictive
-- checks so a future permissive policy cannot accidentally re-enable writes.
create policy "planning lists owner-only read"
  on public.shared_lists as restrictive for select to authenticated
  using (list_type not in ('wishlist','basket') or owner_id=(select auth.uid()));

create policy "planning lists server-only create"
  on public.shared_lists as restrictive for insert to authenticated
  with check (list_type not in ('wishlist','basket'));

create policy "planning lists server-only change"
  on public.shared_lists as restrictive for update to authenticated
  using (list_type not in ('wishlist','basket'))
  with check (list_type not in ('wishlist','basket'));

create policy "planning items owner-only read"
  on public.shared_list_items as restrictive for select to authenticated
  using (exists (
    select 1 from public.shared_lists l where l.id=list_id
    and (l.list_type not in ('wishlist','basket') or l.owner_id=(select auth.uid()))
  ));

create policy "planning items server-only create"
  on public.shared_list_items as restrictive for insert to authenticated
  with check (
    added_by=(select auth.uid())
    and exists (select 1 from public.shared_lists l
      where l.id=list_id and l.list_type not in ('wishlist','basket'))
  );

create policy "planning items server-only change"
  on public.shared_list_items as restrictive for update to authenticated
  using (exists (select 1 from public.shared_lists l
    where l.id=list_id and l.list_type not in ('wishlist','basket')))
  with check (exists (select 1 from public.shared_lists l
    where l.id=list_id and l.list_type not in ('wishlist','basket')));

-- Owners can remove their personal items; extra members never can.
create policy "planning items owner-only removal"
  on public.shared_list_items as restrictive for delete to authenticated
  using (exists (select 1 from public.shared_lists l where l.id=list_id
    and (l.list_type not in ('wishlist','basket') or l.owner_id=(select auth.uid()))));

-- A private basket or wishlist cannot be turned into a collaborator-access list.
create policy "planning membership owner-only read"
  on public.shared_list_members as restrictive for select to authenticated
  using (exists (select 1 from public.shared_lists l where l.id=list_id
    and (l.list_type not in ('wishlist','basket') or l.owner_id=(select auth.uid()))));
create policy "planning membership server-only invitations"
  on public.shared_list_members as restrictive for insert to authenticated
  with check (exists (select 1 from public.shared_lists l where l.id=list_id
    and l.list_type not in ('wishlist','basket')));
create policy "planning membership server-only changes"
  on public.shared_list_members as restrictive for update to authenticated
  using (exists (select 1 from public.shared_lists l where l.id=list_id
    and l.list_type not in ('wishlist','basket')))
  with check (exists (select 1 from public.shared_lists l where l.id=list_id
    and l.list_type not in ('wishlist','basket')));

commit;
