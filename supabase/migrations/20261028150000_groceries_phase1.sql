-- Additive migration. Public product prices require independent rights verification.
create table if not exists public.grocery_stores (
 id text primary key, name text not null unique, is_active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.grocery_products (
 id uuid primary key default gen_random_uuid(), name text not null, brand text, pack_size text not null,
 category text not null, gtin text, status text not null default 'draft' check(status in ('draft','published','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.grocery_prices (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.grocery_products(id) on delete cascade,
 store_id text not null references public.grocery_stores(id), price_pence integer not null check(price_pence>=0),
 currency text not null default 'GBP' check(currency='GBP'), source_id text not null, source_kind text not null,
 usage_rights_confirmed boolean not null default false, status text not null default 'draft' check(status in ('draft','published','withdrawn')),
 is_available boolean not null default false, last_checked_at timestamptz not null,
 expires_at timestamptz, product_url text, updated_at timestamptz not null default now(),
 unique(product_id,store_id)
);
insert into public.grocery_stores(id,name) values
 ('tesco','Tesco'),('asda','Asda'),('sainsburys','Sainsbury''s'),('morrisons','Morrisons'),('aldi','Aldi'),('lidl','Lidl'),('waitrose','Waitrose'),('iceland','Iceland'),('ocado','Ocado')
on conflict(id) do nothing;
alter table public.grocery_stores enable row level security;
alter table public.grocery_products enable row level security;
alter table public.grocery_prices enable row level security;
revoke all on public.grocery_stores,public.grocery_products,public.grocery_prices from anon,authenticated;
grant select on public.grocery_stores,public.grocery_products,public.grocery_prices to anon,authenticated;
grant insert,update,delete on public.grocery_stores,public.grocery_products,public.grocery_prices to authenticated;
grant all on public.grocery_stores,public.grocery_products,public.grocery_prices to service_role;
create policy "grocery public stores" on public.grocery_stores for select to anon,authenticated using (is_active);
create policy "grocery public products" on public.grocery_products for select to anon,authenticated using (status='published');
create policy "grocery public prices" on public.grocery_prices for select to anon,authenticated using (
 status='published' and usage_rights_confirmed and is_available and currency='GBP'
 and last_checked_at <= now() and last_checked_at >= now()-interval '7 days'
 and (expires_at is null or expires_at > now())
 and exists(select 1 from public.grocery_products gp where gp.id=product_id and gp.status='published')
 and exists(select 1 from public.grocery_stores gs where gs.id=store_id and gs.is_active)
);
create policy "grocery admin read stores" on public.grocery_stores for select to authenticated using ((select private.is_avuqo_admin()));
create policy "grocery admin read products" on public.grocery_products for select to authenticated using ((select private.is_avuqo_admin()));
create policy "grocery admin read prices" on public.grocery_prices for select to authenticated using ((select private.is_avuqo_admin()));
create policy "grocery admin write stores" on public.grocery_stores for all to authenticated using ((select private.is_avuqo_admin())) with check ((select private.is_avuqo_admin()));
create policy "grocery admin write products" on public.grocery_products for all to authenticated using ((select private.is_avuqo_admin())) with check ((select private.is_avuqo_admin()));
create policy "grocery admin write prices" on public.grocery_prices for all to authenticated using ((select private.is_avuqo_admin())) with check ((select private.is_avuqo_admin()));
create index if not exists grocery_prices_store_product_idx on public.grocery_prices(store_id,product_id);
