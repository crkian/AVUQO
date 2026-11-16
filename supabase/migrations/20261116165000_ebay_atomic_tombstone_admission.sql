-- Enforce deletion suppression at the eBay account-ownership mapping boundary.
-- Existing eBay product quarantine is left intact. This is NOT an import approval.
-- Locks are transaction-scoped and consistent across receipt and ownership inserts.
-- A prior mapped row may still exist when a new deletion receipt arrives; it must
-- be erased by the separately reviewed privacy processor.
create index ebay_deletion_receipts_user_digest_idx
 on public.ebay_deletion_receipts(user_id_digest) where user_id_digest is not null;
create index ebay_deletion_receipts_username_digest_idx
 on public.ebay_deletion_receipts(username_digest) where username_digest is not null;
create index ebay_deletion_receipts_eias_digest_idx
 on public.ebay_deletion_receipts(eias_token_digest) where eias_token_digest is not null;

-- VOLATILE ensures the post-lock check gets a fresh READ COMMITTED snapshot.\n-- DBA/service-role only via existing private receipt table privileges.
-- No public RPC grants. Only exact HMAC digest equality, never text markers.
create function public.ebay_is_account_digest_suppressed(
 p_kind text, p_digest text
) returns boolean language plpgsql volatile security invoker
set search_path = ''
as $$
begin
 if p_digest is null or p_digest !~ '^[a-f0-9]{64}$'
  or p_kind not in ('user_id_digest','username_digest','eias_token_digest') then
  raise exception 'Invalid eBay account fingerprint';
 end if;
 if p_kind='user_id_digest' then
  return exists(select 1 from public.ebay_deletion_receipts
    where user_id_digest=p_digest);
 elsif p_kind='username_digest' then
  return exists(select 1 from public.ebay_deletion_receipts
    where username_digest=p_digest);
 else
  return exists(select 1 from public.ebay_deletion_receipts
    where eias_token_digest=p_digest);
 end if;
end;
$$;
revoke all on function public.ebay_is_account_digest_suppressed(text,text)
 from public,anon,authenticated,service_role;

-- Account-link gate runs as its restricted function owner so it can read the\n-- private receipt ledger; it exposes no direct RPC and only returns NEW/raises.\n-- Sort by the resulting lock key, not raw domain/name, to avoid taking
-- multiple advisory keys in divergent order between concurrent receipts.
create function public.ebay_lock_deletion_receipt_accounts()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare v_key bigint;
begin
 for v_key in
  select distinct pg_catalog.hashtextextended(
    'avuqo-ebay-account:'||v.kind||':'||v.digest,0
  ) as lock_key
  from (values
    ('user_id_digest',new.user_id_digest),
    ('username_digest',new.username_digest),
    ('eias_token_digest',new.eias_token_digest)
  ) v(kind,digest)
  where v.digest is not null
  order by lock_key
 loop
  perform pg_catalog.pg_advisory_xact_lock(v_key);
 end loop;
 return new;
end;
$$;
revoke all on function public.ebay_lock_deletion_receipt_accounts()
 from public,anon,authenticated,service_role;
create trigger ebay_deletion_receipt_account_lock
before insert on public.ebay_deletion_receipts for each row
execute function public.ebay_lock_deletion_receipt_accounts();

create function public.ebay_reject_tombstoned_account_item_link()
returns trigger language plpgsql security definer set search_path = ''
as $
begin
 if new.identity_kind not in ('user_id_digest','username_digest','eias_token_digest')
  or new.identity_digest is null
  or new.identity_digest !~ '^[a-f0-9]{64}$' then
  raise exception 'Invalid account identity link';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended(
   'avuqo-ebay-account:'||new.identity_kind||':'||new.identity_digest,0
  )
 );
 if public.ebay_is_account_digest_suppressed(new.identity_kind,new.identity_digest) then
  raise exception 'Deleted eBay account cannot be relinked';
 end if;
 return new;
end;
$$;
revoke all on function public.ebay_reject_tombstoned_account_item_link()
 from public,anon,authenticated,service_role;
create trigger ebay_account_item_tombstone_gate
before insert or update on public.ebay_account_item_links for each row
execute function public.ebay_reject_tombstoned_account_item_link();

comment on function public.ebay_reject_tombstoned_account_item_link() is
'Atomic account ownership admission check against private deletion fingerprints; does not unlock eBay products or complete deletion.';
