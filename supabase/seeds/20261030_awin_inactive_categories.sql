-- AVUQO: private taxonomy staging for Awin feed categorisation.
-- Data-only, idempotent seed. Run only after reviewing merchant/product rights separately.
-- No imported products, offers, prices, affiliate status or source permissions are altered.
-- All new categories are is_active=false and therefore hidden by the existing public RLS SELECT policy.
-- Recorded as a seed, NOT a Supabase schema migration. Production applied through reviewed SQL.
begin;
do $preflight$
begin
  if not exists(select 1 from public.categories where slug='gifts')
     or not exists(select 1 from public.categories where slug='tech') then
    raise exception 'Existing Gifts and Tech parent categories are required';
  end if;
end;
$preflight$;
-- Parent departments, preserving existing rows in the event of a retry.
insert into public.categories (slug,name,parent_id,description,is_active)
select proposed.slug,proposed.name,parent.id,proposed.description,false
from (values
  ('crafts', 'Crafts & Hobbies', NULL, 'Creative kits, art-making, paper crafts and tools'),
  ('chocolate-gifts', 'Chocolate & Gifts', 'gifts', 'Chocolate bars, gift boxes, hampers and occasion treats'),
  ('keyboards', 'Keyboards & Accessories', 'tech', 'Mechanical keyboards, components, layouts and desktop accessories'),
  ('pets', 'Pets & Pet Care', NULL, 'Pet feeders, fountains and accessories')
) as proposed(slug,name,parent_slug,description)
left join public.categories parent on parent.slug=proposed.parent_slug
where proposed.parent_slug is null or parent.id is not null
on conflict (slug) do nothing;

-- Subdepartments cannot appear unless their parent is present.
insert into public.categories (slug,name,parent_id,description,is_active)
select proposed.slug,proposed.name,parent.id,proposed.description,false
from (values
  ('crystal-art', 'Crystal Art & diamond painting', 'crafts', 'Crystal art cards, motifs, diamond-painting-style kits'),
  ('flower-making', 'Flower-making & decorative crafts', 'crafts', 'Handmade floral decorations and making kits'),
  ('cards-papercraft', 'Cards & papercraft', 'crafts', 'Card-making, paper crafts and greetings'),
  ('craft-kits', 'Craft kits & creative gifts', 'crafts', 'General arts and crafts kits and projects'),
  ('craft-tools', 'Craft tools & accessories', 'crafts', 'Tools, stamps, adhesives, die-cutting accessories'),
  ('creative-puzzles', 'Puzzles & creative play', 'crafts', 'Puzzles, figurines and hands-on creative play'),
  ('chocolate-treats', 'Chocolate & sweet treats', 'chocolate-gifts', 'Chocolate and sweet treats requiring human review'),
  ('chocolate-bars', 'Chocolate bars & sharing', 'chocolate-gifts', 'Individual bars and sharing packs'),
  ('chocolate-boxes', 'Chocolate boxes & collections', 'chocolate-gifts', 'Gift boxes and chocolate selections'),
  ('chocolate-hampers', 'Chocolate hampers', 'chocolate-gifts', 'Hampers, baskets and gift bundles'),
  ('occasion-chocolate-gifts', 'Occasion & chocolate gifts', 'chocolate-gifts', 'Birthday, seasonal and personalised gifting'),
  ('pet-care-accessories', 'Pet care accessories', 'pets', 'Accessories and items needing category review'),
  ('pet-feeder-fountain-bundles', 'Feeder & fountain bundles', 'pets', 'Combined feeding and hydration kits'),
  ('pet-water-fountains', 'Water fountains', 'pets', 'Pet water fountains, reservoirs and dispensers'),
  ('automatic-pet-feeders', 'Automatic pet feeders', 'pets', 'Smart and automatic feeding devices'),
  ('pet-filters-parts', 'Filters & replacement parts', 'pets', 'Filters and spare parts for pet products'),
  ('keyboard-accessories', 'Keyboard & desktop accessories', 'keyboards', 'Desktop and keyboard accessories'),
  ('refurbished-keyboards', 'Refurbished keyboards', 'keyboards', 'Used/refurbished keyboards and condition-specific stock'),
  ('keycaps', 'Keycaps & customisation', 'keyboards', 'Keycap sets and keyboard personalisation'),
  ('keyboard-switches', 'Keyboard switches', 'keyboards', 'Mechanical switches and related components'),
  ('mechanical-keyboards', 'Mechanical keyboards', 'keyboards', 'Complete mechanical keyboards, with layout variants')
) as proposed(slug,name,parent_slug,description)
left join public.categories parent on parent.slug=proposed.parent_slug
where proposed.parent_slug is null or parent.id is not null
on conflict (slug) do nothing;

do $verify$
declare staged_count integer;
begin
  select count(*) into staged_count from public.categories
    where slug in ('crafts','chocolate-gifts','keyboards','pets','crystal-art','flower-making','cards-papercraft','craft-kits','craft-tools','creative-puzzles','chocolate-treats','chocolate-bars','chocolate-boxes','chocolate-hampers','occasion-chocolate-gifts','pet-care-accessories','pet-feeder-fountain-bundles','pet-water-fountains','automatic-pet-feeders','pet-filters-parts','keyboard-accessories','refurbished-keyboards','keycaps','keyboard-switches','mechanical-keyboards');
  if staged_count<>25 then
    raise exception 'Incomplete private taxonomy: % of 25 categories',staged_count;
  end if;
  if exists(select 1 from public.categories where slug in ('crafts','chocolate-gifts','keyboards','pets','crystal-art','flower-making','cards-papercraft','craft-kits','craft-tools','creative-puzzles','chocolate-treats','chocolate-bars','chocolate-boxes','chocolate-hampers','occasion-chocolate-gifts','pet-care-accessories','pet-feeder-fountain-bundles','pet-water-fountains','automatic-pet-feeders','pet-filters-parts','keyboard-accessories','refurbished-keyboards','keycaps','keyboard-switches','mechanical-keyboards') and is_active) then
    raise exception 'Staging seed must not activate public categories';
  end if;
  if exists(select 1 from public.categories c
    left join public.categories p on p.id=c.parent_id
    where c.slug in ('crystal-art','flower-making','cards-papercraft','craft-kits','craft-tools','creative-puzzles','chocolate-treats','chocolate-bars','chocolate-boxes','chocolate-hampers','occasion-chocolate-gifts','pet-care-accessories','pet-feeder-fountain-bundles','pet-water-fountains','automatic-pet-feeders','pet-filters-parts','keyboard-accessories','refurbished-keyboards','keycaps','keyboard-switches','mechanical-keyboards')
      and (p.id is null)) then
    raise exception 'Subcategory missing parent';
  end if;
end;
$verify$;
commit;

-- Read-only verification: SELECT slug,name,is_active,parent_id FROM public.categories
-- WHERE slug IN ('crafts','chocolate-gifts','keyboards','pets','crystal-art','flower-making','cards-papercraft','craft-kits','craft-tools','creative-puzzles','chocolate-treats','chocolate-bars','chocolate-boxes','chocolate-hampers','occasion-chocolate-gifts','pet-care-accessories','pet-feeder-fountain-bundles','pet-water-fountains','automatic-pet-feeders','pet-filters-parts','keyboard-accessories','refurbished-keyboards','keycaps','keyboard-switches','mechanical-keyboards') ORDER BY slug;
-- Rollback strategy if genuinely needed: remove only unreferenced, inactive rows by exact slug
-- after confirming no products, source mappings or dependent category rows reference them.
