-- Guard private eBay deletion receipts against accidental false completion or
-- suppression-tombstone loss while cross-store erasure/legal retention is unfinished.
-- This does not process/acknowledge account deletion. Migration is non-destructive.
create function public.ebay_protect_pending_deletion_receipt()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
 if tg_op = 'DELETE' then
  raise exception 'eBay deletion receipt tombstones cannot be deleted';
 end if;
 if tg_op = 'TRUNCATE' then
  raise exception 'eBay deletion receipt tombstones cannot be truncated';
 end if;
 if tg_op = 'INSERT' then
  if new.state <> 'pending_privacy_review' or new.completed_at is not null then
   raise exception 'eBay deletion receipts must begin pending';
  end if;
  return new;
 end if;
 if tg_op = 'UPDATE' then
  if old.id is distinct from new.id
   or old.notification_digest is distinct from new.notification_digest
   or old.user_id_digest is distinct from new.user_id_digest
   or old.username_digest is distinct from new.username_digest
   or old.eias_token_digest is distinct from new.eias_token_digest
   or old.first_received_at is distinct from new.first_received_at
  then
   raise exception 'eBay receipt identity/tombstone is immutable';
  end if;
  if new.state='completed' or new.completed_at is not null then
   raise exception 'eBay deletion completion blocked until full privacy workflow is approved';
  end if;
  if old.state='completed' then
   raise exception 'Completed legacy receipt requires manual compliance review';
  end if;
  if old.state='blocked' and new.state is distinct from 'blocked' then
   raise exception 'Blocked eBay receipt requires manual review before transition';
  end if;
  if old.state='processing' and new.state='pending_privacy_review' then
   raise exception 'eBay receipt processing cannot be silently reset';
  end if;
  return new;
 end if;
 raise exception 'Unsupported deletion receipt operation';
end;
$$;
revoke all on function public.ebay_protect_pending_deletion_receipt()
 from public, anon, authenticated, service_role;
create trigger ebay_deletion_receipt_insert_lock
before insert on public.ebay_deletion_receipts for each row
execute function public.ebay_protect_pending_deletion_receipt();
create trigger ebay_deletion_receipt_update_lock
before update on public.ebay_deletion_receipts for each row
execute function public.ebay_protect_pending_deletion_receipt();
create trigger ebay_deletion_receipt_delete_lock
before delete on public.ebay_deletion_receipts for each row
execute function public.ebay_protect_pending_deletion_receipt();
create trigger ebay_deletion_receipt_truncate_lock
before truncate on public.ebay_deletion_receipts for each statement
execute function public.ebay_protect_pending_deletion_receipt();

comment on function public.ebay_protect_pending_deletion_receipt() is
'Forbid fake deletion completion or suppression tombstone destruction. Future reviewed release migration must supply full evidence before relaxing this lock.';
