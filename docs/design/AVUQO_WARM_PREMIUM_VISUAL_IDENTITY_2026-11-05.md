# AVUQO | Warm Premium Visual Identity v1

**Status:** proposed design specification and implementation reference, **not a frontend deployment**  
**Prepared:** 5 November 2026  
**Repository baseline reviewed:** `main` on 5 November 2026, including the living `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md` and original source-to-code audit  
**Promise:** **Find what's worth it.**

## 1. Creative direction

AVUQO should feel like a beautiful, welcoming place to shop, plan and compare. Think sunlight through a living-room window, elegant editorial presentation, carefully arranged products, approachable explanations and confident buying decisions. **Not** a dark trading terminal, aggressive coupon site, generic affiliate grid or endless admin dashboard.

Use warm ivory as the main canvas. Reserve deep navy and violet for brand recognition, navigation, primary actions and independent shopping intelligence. Let images and editorial content carry a category's personality. Comparison and analytical functionality should be visible, precise and quietly confident without overwhelming the shopper.

### Non-negotiable experience characteristics

- Warm, human, premium, calm, credible, accessible and responsive.
- Full-width photographic/editorial heroes supported by useful subcategory entry points.
- Cream surfaces, subtle borders, soft shadows and generous breathing room.
- Clear search, filters, comparison, save and Watch actions with recognisable affordances.
- Consistent reusable components, while seasonal and category pages get their own visual story.
- British-English microcopy; pricing in GBP only when real, eligible data is available.
- No fabricated price, review, percentage-off, stock, AVUQO Score, price history, ranking, savings or retailer approval.
- Affiliate or sponsored placements disclosed and never allowed to influence organic ranking.

## 2. Colour system

These are **design tokens**, not a silent replacement for existing CSS. Most match or closely preserve the current `app/globals.css`, `app/homepage-warm.module.css`, `components/lifestyle/LifestyleLanding.module.css`, and module-level styles.

| Role | Token | Hex | Usage |
|---|---|---|---|
| Warm background | `--avuqo-canvas` | `#FAF8F3` | Main public pages |
| Soft editorial wash | `--avuqo-cream` | `#F7F3EC` | Alternating sections and hero backing |
| Surface | `--avuqo-surface` | `#FFFFFF` | Cards, forms, popovers |
| Warm white surface | `--avuqo-surface-warm` | `#FFFDF9` | Lifestyle cards |
| Deep ink/navy | `--avuqo-ink` | `#17142B` | Body text, footer emphasis |
| Editorial ink | `--avuqo-editorial-ink` | `#302639` | Large headings |
| Muted copy | `--avuqo-muted` | `#716D80` | Descriptions and support text |
| Primary violet | `--avuqo-violet` | `#5B35F5` | Actions, active navigation, accents |
| Violet deep | `--avuqo-violet-dark` | `#3A20BD` | Action hover/focus contrast |
| Electric blue | `--avuqo-blue` | `#3478F6` | Violet-to-blue gradient highlight |
| Purple editorial | `--avuqo-plum` | `#6043A3` | Soft premium CTA variation |
| Border | `--avuqo-border` | `#E7E3EC` | Quiet surfaces and input outlines |
| Warm border | `--avuqo-border-warm` | `#E9E0DC` | Lifestyle imagery/cards |
| Evidenced positive | `--avuqo-positive` | `#087B5B` | Validated positive outcomes, not fabricated deal scores |
| Rose tint | `--avuqo-rose-wash` | `#F9E8EF` | Beauty, Valentine's, family |
| Butter tint | `--avuqo-butter-wash` | `#FFF0DC` | Home, crafts, gifts |
| Teal tint | `--avuqo-teal-wash` | `#E6F5F2` | Wellness, outdoors, travel |

**Primary CTA:** gradient `linear-gradient(135deg, #5B35F5 0%, #3A20BD 100%)`.  
**Editorial emphasis:** use a small amount of violet, never broad neon fills.  
**Contrast:** verify WCAG AA contrast and accessible keyboard focus independently. Do not rely on colour alone for trust statuses.

### Category tonal families

Support six moods already represented by `lib/categories/browse-tree.ts`: **violet, teal, amber, rose, blue, green**. These are *local accents*, not separate brand identities. Every page keeps shared AVUQO chrome and structure.

### Seasonal palettes

| Campaign | Warm theme | Accents | Art direction |
|---|---|---|---|
| Christmas | cream and warm candlelight | cranberry `#A43B54`, fir `#2F6851`, brass `#C59656` | Cosy fireside, thoughtful parcels, warm lighting |
| Black Friday | warm off-white with concentrated contrast | midnight `#211B2F`, plum `#6D3F88`, violet | Intense but tasteful; no false urgency or countdowns |
| Easter | soft cream and spring light | lilac `#CBAEE8`, blush `#F7DCE9`, daffodil `#F6DC8A` | Spring flowers, eggs, family settings |
| Valentine's | ivory and warm blush | rose `#C04470`, wine `#873C58`, lavender | Personal gifting, flowers, intimate table settings |
| Sales & clearance | ivory and warm sandstone | terracotta `#A36549`, soft peach `#F9EEE4` | Understated value and genuine verification |
| Summer | sunlit cream | sea blue `#438EAE`, sage `#DCEBDD`, coral | Outdoor living, travel, everyday adventures |

## 3. Typography

**Current implementation** largely inherits `Arial, Helvetica, sans-serif` from `app/globals.css`. That remains the implementation fallback until approved font assets are integrated.

**Design proposal:** restrained editorial serif *only* for selected hero/display titles, e.g. `Fraunces, Georgia, serif`, with a clear modern sans for all labels, paragraphs and shopping UI, e.g. `Inter, Arial, sans-serif`. Font licences, loading, performance and fallbacks must be reviewed before implementation. Do not copy vendor font files into the repository without rights.

- Hero: 48–88px desktop, 36–48px mobile, careful line-height `1.02–1.13`.
- Page title: 36–56px desktop, 30–38px mobile.
- Section title: 26–40px; card title: 17–23px.
- Body: 16–18px with generous 1.5–1.7 leading.
- Labels, breadcrumbs, supporting statuses: 12–14px, readable and never dense.
- Sentence case for editorial headings; avoid incessant uppercase shouting.

## 4. Layout, cards and controls

- Public page max-width: keep current `shell` baseline around **1180px**, expanding only by deliberate design decision.
- Desktop: flexible two-column editorial hero, clear search priority, 3–4 category stories per row; responsive product lists.
- Mobile: single column, comfortably spaced; keep existing `MobileDock` navigation.
- Card radii: 18–28px; hero/editorial frame up to 32px.
- Inputs/buttons: minimum interactive target 44 × 44 CSS px, visible focus state, descriptive labels.
- Shadows: subdued, warm, e.g. `0 10px 32px rgba(45,31,54,.07)`; avoid thick neon glows.
- Product images: light neutral backdrop; display the real *matched variant* when usage rights permit.
- Editorial images: authentic-looking natural light, familiar British homes, thoughtful compositions; meaningful alt text.
- Photography must not imply the depicted item is available, approved, discounted, in stock or merchant-affiliated.

## 5. Shared customer-facing shell

Maintain the active `Header`, `MegaNav`, `DepartmentExplorer`, `Footer` and `MobileDock`, rather than creating a disconnected seasonal site.

The code-defined **seven primary groups** are: Discover, Deals & Sales, Compare, Groceries, Categories, Travel and More. Categories should expand to the **25 curated departments** and grouped browse topics in `lib/categories/browse-tree.ts`, with search and a detail pane.

Use a broad, legible universal search; keep Saved, Watches, Lists and Account easy to reach. Avoid adding dead nav links for future pages or declaring inactive taxonomy as shoppable stock.

## 6. Photography and brand assets

**Hero formula:** lifestyle scene + one clear headline + brief useful explanation + one primary action + optional secondary action. Keep copy separate from the photo's visual focal point and do not render essential text into raster backgrounds.

Use real, licensed product/merchant assets only where source and image display rights are established. Concept-generation assets may contain fictitious UI numbers, brand depictions and visually plausible products: **they are design references only, never publishing assets or price evidence**.

AVUQO identity: preserve current public logo behaviour until approved vector artwork is integrated. AI-generated mockups may approximate the AVUQO mark; do not use their imprecise logo as the production brand source.

## 7. Trust and inclusive design

- No invented verified deals, scores, reviews, historical charts, supermarket basket totals or analytics KPIs.
- Display **No verified offers yet**, **Price unavailable**, **Last checked [real timestamp]**, **Partial basket** or **No complete comparison available** as appropriate.
- A complete grocery basket requires valid prices for *every* requested line. Missing prices never count as £0.
- Distinguish customers' own grocery prices from independently checked prices.
- Show disclosure, provider eligibility and confidence when applicable.
- Signed-in account screens show real user-specific counts only; empty state is not a failure.
- Accessible fonts, focus rings, headings, reduced motion and responsive image cropping.

## 8. Relationship to implementation

This document **proposes a unified visual system**, not a claim that the illustrative visuals are live. Reuse the current Next.js/React/TypeScript structure and apply changes incrementally after owner review.

The next implementation should start with shared tokens and header/mega menu polishing, then the homepage, existing seasonal pages, lifestyle categories, product detail, groceries, Saved/Watches/Lists/Account, and mobile QA. Separate release work from image approval. Tests, production build, access checks and Vercel readiness remain required for a deployable change.
