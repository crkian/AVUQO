# AVUQO PROJECT HANDOVER
**Status as of 30 October 2026**

## 1. Project overview

AVUQO (www.avuqo.com) is being developed as a premium UK shopping, comparison, deals, groceries and value-intelligence platform.

**Brand promise:** "Find what's worth it."

The objective is to build a highly polished, trustworthy platform with excellent shopping discovery, exact-product comparisons, genuine approved affiliate offers, supermarket basket intelligence, Saved items, Watches, shared shopping lists, budgeting, travel and a powerful integrated Control Centre.

The user has requested a complete site audit, fixes across the platform, a staged improvement plan, ongoing implementation, category expansion for approved/imported Awin merchants and a comprehensive taxonomy covering virtually every sensible retail category.

**Critical product principles:** Organic rankings and AVUQO Score must remain independent of affiliate commissions and advertising. Never invent prices, availability, discounts, product rights or complete basket comparisons. Do not publish unapproved merchant feeds.

## 2. Actual technical systems

- GitHub: `crkian/AVUQO`
- Vercel project: `avuqo`
- Website: `https://www.avuqo.com`
- Supabase project ID: `tfoukwcruaamrtgxzshh`
- Technology: Next.js 16, React 19, TypeScript and Supabase/PostgreSQL
- Local Windows directory: `C:\avuqo`
- Master delivery register: `docs/AVUQO_MASTER_DELIVERY_PLAN_2026-10-30.md`

The connected GitHub, Vercel and Supabase tools were used throughout the previous conversation. The old uploaded `build.zip` is historical and must not replace more recent GitHub work.

## 3. Original website audit

The whole platform was reviewed across frontend, backend, navigation, security, affiliate connections, marketing and operational readiness.

Key conclusions:

- The newer premium navigation and Control Centre architecture should be preserved.
- Search, actual retailer price comparisons, verified deals and affiliate attribution need further development.
- The existing `/compare` functionality includes illustrative contract comparisons rather than comprehensive product comparisons.
- Groceries has store and shopping-list foundations, but no verified, publicly published supermarket price coverage was established.
- Watches functionality exists, but automatic alerts were not confirmed operational.
- Affiliate programme connectivity, commission reconciliation and marketing publication remain incomplete.
- Budgeting, advanced travel comparison and full first-party analytics are planned capabilities, not confirmed finished systems.
- The site has a successful Vercel production build, but complete browser, mobile, accessibility and end-to-end testing has not been certified.

## 4. Security work completed directly in Supabase

A real production database hardening change was performed and verified:

- Removed publicly accessible execution permissions from four privileged helper functions.
- Corrected the `set_updated_at()` database function's search-path setting.

Outstanding warnings include two privileged publishing functions accessible to authenticated users and disabled leaked-password protection. These require further review.

## 5. GitHub work created

### Pull request #20: Affiliate approval security
https://github.com/crkian/AVUQO/pull/20

Branch: `fix/affiliate-approval-admin-guards-20261030`

Added owner-only approval requirements, validated promotion transitions, confirmed programme and offer eligibility, server-side compliance checks, database error handling and safer approval controls.

**Status:** Draft, automated checks passed at last review. Not deployed to production.

### Pull request #22: Saved, Watches and master plan
https://github.com/crkian/AVUQO/pull/22

Branch: `fix/phase1-saved-watches-routing-20261030`

Fixed incorrect saved/watch destinations:

- Verified UUID offers go to `/live/<UUID>`.
- Legacy demonstration items continue to `/deal/<slug>`.
- Unsafe or malformed identifiers cannot create dangerous navigation links.
- Watches wording no longer promises alerts that are not running.
- Regression tests and GitHub CI checks were added.
- A new master delivery plan was committed.

**Status:** Draft, automated checks and Vercel preview passed. Not deployed.

### Pull request #23: New Awin-related departments
https://github.com/crkian/AVUQO/pull/23

Branch: `feature/awin-departments-crafts-20261030`

Created three premium category pages using AVUQO's existing lifestyle design:

**Crafts & Hobbies:** Crystal Art, diamond painting, flower-making, card-making, papercraft, craft kits, tools, decorations and puzzles.

**Chocolate & Gifts:** Chocolate bars, boxes, hampers, personalised gifts, occasions and seasonal chocolate.

**Mechanical Keyboards:** Complete keyboards, UK/ISO layouts, switches, keycaps, accessories and refurbished models.

Also:

- Enhanced the existing Pets page with stricter publication gating.
- Added relevant category-directory, navigation, sitemap, Gifts and Technology links.
- Expanded the private Control Centre Feed Imports interface so individual Awin merchant imports can be selected and inspected.
- Added private product-category suggestions.
- Extended private record loading beyond the original 1,000-record limit.
- Added automated category tests.

**Status:** Draft, CI and Vercel preview passed. No merchant feeds were made live.

### Pull request #24: Initial canonical category records
https://github.com/crkian/AVUQO/pull/24

Branch: `feature/awin-canonical-private-taxonomy-20261030`

Created and executed a safe, idempotent database seed adding **25 inactive category records**, comprising four department nodes and 21 specialist subcategories.

At this stage the database contained:

- 8 original active categories
- 25 new inactive categories
- 33 categories total

The hierarchy includes Crafts, Chocolate & Gifts under Gifts, Keyboards under Technology and Pets.

**Status:** Database records actually created and verified. GitHub PR remains draft. No products activated.

### Pull request #25: Universal category expansion
https://github.com/crkian/AVUQO/pull/25

Branch: `feature/universal-categories-inactive-20261030`

This is the largest category implementation.

A broad AVUQO taxonomy was built containing 75 specialist group definitions, including 74 additional department/section records and 1,277 detailed product or service categories.

**An additional 1,351 inactive records were created and verified in the actual Supabase database.**

The final verified database figures are:

| Category status | Count |
|---|---:|
| Original active categories | 8 |
| Earlier Awin category additions | 25 |
| Universal category additions | 1,351 |
| **Total category records** | **1,384** |
| **Total inactive** | **1,376** |

These categories cover computers, mobile phones, electronics, gaming, furniture, appliances, kitchens, garden, DIY, groceries, clothing, footwear, baby products, toys, sport, camping, cycling, beauty, wellbeing, crafts, pets, chocolates, gifts, motoring, electric vehicles, travel, music, books, education, business products, insurance, utilities and services.

Crafting includes specialist areas such as crochet, knitting, sewing, embroidery, resin supplies, model-making, painting, stationery, card-making and more.

The code added:

- `lib/taxonomy/universal-categories.mjs`
- `scripts/generate-universal-taxonomy-seed.mjs`
- `supabase/seeds/20261030_universal_inactive_categories.sql`
- `tests/universal-categories.test.mjs`
- Private Control Centre route `/control-centre/taxonomy`

The new private Control Centre screen lets owners/admins search the entire category database, filter by department and visibility, and navigate all 1,384 records.

**Status:** Database rows have been added and verified. GitHub tests, lint, build, secret scan and Vercel preview passed. The new Control Centre page and other frontend code remain in draft PRs, not deployed to production.

## 6. Awin feeds discovered

The actual Supabase database contains five private import runs from four merchants:

| Merchant | Imported rows | Review | Excluded |
|---|---:|---:|---:|
| Craft Buddy Shop | 1,299 | 1,233 | 66 |
| Cadbury Gifts Direct | 1,371 | 1,371 | 0 |
| Petlibro UK | 98 | 49 | 49 |
| AKKO UK | 910 per upload | 811 | 99 |

**AKKO was imported twice**, resulting in 1,820 stored rows, but these must not be counted as 1,820 distinct products.

Total staged import records: **4,588**.

The user reports some advertisers have been accepted through Awin. However, AVUQO's own five import records were all marked `permission_status=unverified` when examined.

Awin source credentials were also recorded as not configured, and the affiliate programme registry contained zero records.

This means the feeds can be organised privately, but merchant feed usage, image rights, affiliate-link rights, product matching and freshness must be validated before publication.

The category work did not change those approval statuses.

## 7. Implemented versus live

**Live in Supabase:** Security hardening, 25 initial inactive Awin categories, 1,351 additional inactive universal categories. Database total confirmed at 1,384.

**Implemented on draft GitHub branches:** Affiliate approval repairs, Saved/Watches routing, new Crafts/Chocolate/Keyboards pages, improved private import review, category suggestions, category tests and the private Category Taxonomy Control Centre page.

**Not yet completed:** Full product-to-category mapping, AKKO deduplication, product-variant validation, merchant rights verification, public offer activation, working grocery feeds, affiliate revenue reconciliation, production social publishing, complete site advertising, full budgeting and first-party analytics.

No new imported Awin products have been launched through this work.

## 8. Master delivery plan

The project delivery plan now covers:

1. **Security and customer-journey fixes:** Complete PR #20 and PR #22.
2. **Awin categories and universal taxonomy:** Review PR #23, #24 and #25, complete product mapping and permissions.
3. **Search, Products, Compare and Deals:** Accurate matching, verified prices, filtering, actual retailer comparisons and buy/wait explanations.
4. **Groceries, Lists and Watches:** Real authorised prices, complete-basket logic, sharing and working notifications.
5. **Affiliate and revenue platform:** Approved network/merchant feeds, affiliate redirects, transaction attribution and confirmed commission.
6. **Brand Social Marketing and Site Advertising:** Two separate workflows with proper controls, rights, audit and verified publishing.
7. **Budgeting, Travel, Analytics and premium UX:** Extend functionality once the core platform is reliable.

## 9. Important precautions for the next assistant

Do not rebuild AVUQO from scratch or overwrite its newer premium navigation.

Do not assume that a successful build means a PR has been merged or deployed.

Do not recreate the 1,384 category records or accidentally switch the inactive categories to active.

Do not publicly display staged Awin product prices, images or links until the applicable rights and source checks pass.

Do not create 1,384 empty indexable pages. Public navigation needs curated departments and working customer journeys.

Use the current GitHub repository, actual Supabase tables and current Vercel deployment as the implementation authority. Keep code changes reviewed, versioned and tested.

PR #22, #23, #24 and #25 were developed as a stacked series. PR #20 is independent. Check their current status and merge/rebase safely in dependency order.

## 10. What to do next

Continue AVUQO development by verifying the current state of PRs #20, #22, #23, #24 and #25 and the live database.

The next major technical milestone is **mapping the private imported Awin products to canonical category IDs**, with precise classification, duplicate detection (especially AKKO), variant matching, merchant provenance and owner review.

After that, complete formal merchant-rights verification and the publication pipeline for genuinely approved, fresh offers.

Review frontend/mobile styling, private Control Centre security and production release gates before merging or deploying.

**Always update the AVUQO master delivery plan as work is completed, and explicitly distinguish live production changes, staged database changes, draft GitHub code and planned features.**