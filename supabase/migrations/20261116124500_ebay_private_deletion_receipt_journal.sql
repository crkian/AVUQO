-- eBay marketplace account deletion: private immutable receipt journal.
-- Records only keyed one-way digests; no raw eBay identifiers, notifications or credentials.
-- Receipt does not itself signify completed erasure and must not be acknowledged as success.
create table if not exists public.ebay_deletion_receipts (
  id bigint generated always as identity primary key,
  notification_digest text not null unique
    check (notification_digest ~ '^[a-f0-9]{64}$'),
  user_id_digest text
    check (user_id_digest is null or user_id_digest ~ '^[a-f0-9]{64}$'),
  username_digest text
    check (username_digest is null or username_digest ~ '^[a-f0-9]{64}$'),
  eias_token_digest text
    check (eias_token_digest is null or eias_token_digest ~ '^[a-f0-9]{64}$'),
  state text not null default 'pending_privacy_review'
    check (state in ('pending_privacy_review','processing','completed','blocked')),
  first_received_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint ebay_deletion_identifier_present
    check (user_id_digest is not null or username_digest is not null or eias_token_digest is not null),
  constraint ebay_deletion_completed_consistent
    check ((state='completed') = (completed_at is not null))
);
create index if not exists ebay_deletion_receipts_state_idx
  on public.ebay_deletion_receipts(state,first_received_at);

alter table public.ebay_deletion_receipts enable row level security;
revoke all on table public.ebay_deletion_receipts from public, anon, authenticated, service_role;
grant select,insert on table public.ebay_deletion_receipts to service_role;
revoke all on sequence public.ebay_deletion_receipts_id_seq from public, anon, authenticated, service_role;
grant usage on sequence public.ebay_deletion_receipts_id_seq to service_role;
-- No policies: anon/auth remain denied. Service-role reads/inserts bypass RLS.
-- No browser-owned mutations, no blanket delete and no public RPC.
