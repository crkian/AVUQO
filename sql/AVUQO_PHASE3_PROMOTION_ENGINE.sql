-- AVUQO Phase 3: Affiliate Promotion Intelligence
-- Adds promotion, creative, publishing, attribution and revenue structures.
-- Does NOT change AVUQO Score or organic ranking logic.

create extension if not exists pgcrypto;

create table if not exists public.affiliate_programs (
  id uuid primary key default gen_random_uuid(), provider text not null, programme_name text not null,
  external_account_id text, region text, status text not null default 'pending',
  direct_social_links_permitted boolean, avuqo_landing_pages_permitted boolean,
  image_usage_rule text, disclosure_template text, terms_checked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique(provider, programme_name, region)
);

create table if not exists public.channel_connections (
  id uuid primary key default gen_random_uuid(), channel text not null, account_label text not null,
  external_account_id text, status text not null default 'disconnected', publishing_enabled boolean not null default false,
  requires_manual_approval boolean not null default true, scopes jsonb not null default '[]'::jsonb,
  last_verified_at timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(channel, account_label)
);

create table if not exists public.publishing_rules (
  id uuid primary key default gen_random_uuid(), scope_key text not null unique,
  minimum_avuqo_score integer not null default 75 check (minimum_avuqo_score between 0 and 100),
  minimum_confidence numeric(5,2) not null default 65 check (minimum_confidence between 0 and 100),
  minimum_promotion_score integer not null default 68 check (minimum_promotion_score between 0 and 100),
  require_approval boolean not null default true, daily_post_limit integer not null default 5 check (daily_post_limit >= 0),
  monthly_budget numeric(12,2) not null default 0, emergency_stop boolean not null default false,
  merchant_exclusions jsonb not null default '[]'::jsonb, category_exclusions jsonb not null default '[]'::jsonb,
  platform_rules jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
insert into public.publishing_rules(scope_key) values ('global') on conflict (scope_key) do nothing;

create table if not exists public.promotion_candidates (
  id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete cascade, affiliate_program_id uuid references public.affiliate_programs(id) on delete set null,
  target_channel text not null, avuqo_score integer not null check (avuqo_score between 0 and 100),
  avuqo_confidence numeric(5,2) not null check (avuqo_confidence between 0 and 100),
  promotion_score integer check (promotion_score between 0 and 100), promotion_tier text,
  destination_type text not null default 'avuqo', affiliate_eligible boolean not null default false,
  compliance_clear boolean not null default false, status text not null default 'candidate',
  rationale jsonb not null default '{}'::jsonb, economics jsonb not null default '{}'::jsonb,
  evaluated_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists promotion_candidates_status_idx on public.promotion_candidates(status, promotion_score desc);
create index if not exists promotion_candidates_offer_idx on public.promotion_candidates(offer_id);

create table if not exists public.promotion_score_components (
  id uuid primary key default gen_random_uuid(), promotion_candidate_id uuid not null references public.promotion_candidates(id) on delete cascade,
  component_name text not null, component_score numeric(8,3) not null, weight numeric(8,5) not null,
  evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), unique(promotion_candidate_id, component_name)
);

create table if not exists public.compliance_checks (
  id uuid primary key default gen_random_uuid(), promotion_candidate_id uuid references public.promotion_candidates(id) on delete cascade,
  check_type text not null, status text not null, severity text not null default 'medium', rule_source text,
  details jsonb not null default '{}'::jsonb, checked_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(), name text not null, campaign_type text not null default 'deal',
  status text not null default 'draft', objective text not null default 'affiliate_revenue', start_at timestamptz, end_at timestamptz,
  budget numeric(12,2) not null default 0, approval_mode text not null default 'manual', seasonal_event text,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.campaign_items (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  promotion_candidate_id uuid not null references public.promotion_candidates(id) on delete cascade,
  status text not null default 'draft', priority integer not null default 50, created_at timestamptz not null default now(),
  unique(campaign_id, promotion_candidate_id)
);

create table if not exists public.creative_assets (
  id uuid primary key default gen_random_uuid(), campaign_item_id uuid references public.campaign_items(id) on delete cascade,
  asset_type text not null, platform text not null, asset_url text, source_image_url text, source_image_permission text,
  headline text, description text, alt_text text, call_to_action text, disclosure_text text, generation_prompt text,
  generation_model text, status text not null default 'draft', validation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.scheduled_publications (
  id uuid primary key default gen_random_uuid(), campaign_item_id uuid not null references public.campaign_items(id) on delete cascade,
  creative_asset_id uuid references public.creative_assets(id) on delete set null,
  channel_connection_id uuid references public.channel_connections(id) on delete restrict,
  platform text not null, scheduled_for timestamptz, published_at timestamptz, external_post_id text,
  destination_url text, affiliate_url text, disclosure_text text, status text not null default 'pending_approval',
  failure_reason text, published_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists scheduled_publications_due_idx on public.scheduled_publications(status, scheduled_for);

create table if not exists public.attribution_events (
  id bigint generated always as identity primary key, publication_id uuid references public.scheduled_publications(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null, product_id uuid references public.products(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null, event_type text not null, channel text,
  external_click_id text, session_id text, user_id uuid references auth.users(id) on delete set null,
  value numeric(12,2), currency text default 'GBP', metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index if not exists attribution_events_campaign_time_idx on public.attribution_events(campaign_id, occurred_at desc);

create table if not exists public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(), affiliate_program_id uuid references public.affiliate_programs(id) on delete restrict,
  campaign_id uuid references public.campaigns(id) on delete set null, publication_id uuid references public.scheduled_publications(id) on delete set null,
  external_transaction_id text not null, merchant_name text, order_value numeric(12,2), estimated_commission numeric(12,2),
  confirmed_commission numeric(12,2), currency text not null default 'GBP', status text not null default 'estimated',
  ordered_at timestamptz, confirmed_at timestamptz, refunded_at timestamptz, raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), unique(affiliate_program_id, external_transaction_id)
);

create table if not exists public.revenue_reconciliations (
  id uuid primary key default gen_random_uuid(), affiliate_program_id uuid references public.affiliate_programs(id) on delete restrict,
  period_start date not null, period_end date not null, estimated_revenue numeric(12,2) not null default 0,
  confirmed_revenue numeric(12,2) not null default 0, refunded_revenue numeric(12,2) not null default 0,
  campaign_cost numeric(12,2) not null default 0, status text not null default 'open', reconciled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  unique(affiliate_program_id, period_start, period_end)
);

create table if not exists public.promotion_experiments (
  id uuid primary key default gen_random_uuid(), campaign_id uuid references public.campaigns(id) on delete cascade,
  name text not null, hypothesis text not null, metric text not null, status text not null default 'draft',
  allocation jsonb not null default '{}'::jsonb, safeguards jsonb not null default '{}'::jsonb, result jsonb,
  started_at timestamptz, ended_at timestamptz, created_at timestamptz not null default now()
);

alter table public.affiliate_programs enable row level security;
alter table public.channel_connections enable row level security;
alter table public.publishing_rules enable row level security;
alter table public.promotion_candidates enable row level security;
alter table public.promotion_score_components enable row level security;
alter table public.compliance_checks enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_items enable row level security;
alter table public.creative_assets enable row level security;
alter table public.scheduled_publications enable row level security;
alter table public.attribution_events enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.revenue_reconciliations enable row level security;
alter table public.promotion_experiments enable row level security;

revoke all on table public.affiliate_programs, public.channel_connections, public.publishing_rules,
  public.promotion_candidates, public.promotion_score_components, public.compliance_checks,
  public.campaigns, public.campaign_items, public.creative_assets, public.scheduled_publications,
  public.attribution_events, public.affiliate_conversions, public.revenue_reconciliations,
  public.promotion_experiments from anon, authenticated;

-- Keep the Control Centre server-side initially. Add owner/admin RLS only after the admin-role model is finalised.
