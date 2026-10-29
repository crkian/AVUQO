# AVUQO: TWO DISTINCT MARKETING SYSTEMS
Status: binding product definition, 29 October 2026
Scope: AVUQO public website and its existing Control Centre
Source: owner clarification in project conversation

## A. AVUQO website advertising, sold TO OTHERS
This is the AVUQO site's on-site advertising / sponsorship product. It must support external advertisers buying placements on AVUQO pages. It is NOT the shared social-media system and must never automatically post to our brands' social accounts.

Required modules before external paid ads are enabled:
- Advertiser identity, company profile, business contact, contracted categories, creative/licensing proof and verification status
- Campaign booking, inventory zones, placement types (homepage rotating slot, category sponsorship, editorial-sponsored placement), start/end UTC, time zone and editorial restrictions
- Campaign-specific CTA with reviewed HTTPS target allowlist, landing-page evidence and affiliate/sponsored disclosure
- Explicit advertising-contract approval, pricing or billing records (no assumed payment gateway or revenue), budget and spend reconciliation where relevant
- Creative upload with alt text, image rights, moderation, rejection and expiration
- Separate impression/click measurement with consent/privacy review, bot exclusion and disclosed attribution
- Fair rotation, frequency caps, reporting, cancellation/kill switch, no mixing organic and sponsored order
- Clear labels such as "Advertisement" or "Sponsored" above paid content; all advertiser content must be distinguishable from independent AVUQO editorial
- No ad booking or invoices should be accepted until terms, legal/privacy notices and permissions are approved
- Isolation from AVUQO Score, price evidence, independent organic ranking and grocery comparisons

CURRENT TRUTH: public homepage rotating panel and marketing_home_placements are ONLY AVUQO-owned editorial features tied to owner-approved AVUQO facts and internal AVUQO paths. The presence of a 'sponsored' boolean does not create advertiser accounts, external landing-page approval, billing or external-ad inventory. These integrations remain NOT BUILT. Do not sell outside placements through the current editor.

## B. Four-brand social marketing, marketing OUR OWN websites
This is the shared Brand Social Marketing workspace hosted in AVUQO's secure Control Centre, with separate workspaces for:
1. AVUQO
2. Fantasy Lockr
3. Capshur
4. Cluedoku

It handles original brand content and media, owner-approved claims, AI creative (after provider/budget connection), social account verification, the draft/approval pipeline, calendars, future scheduling to authorised social channels, provider status reconciliation, and social analytics. Campaign evidence, login permissions, channels and audit are separate by brand.

CURRENT TRUTH: brand draft rules and editorial scheduler are installed. Social publishing/AI/provider connections have environment and database kill switches. Until credentials and end-to-end tests are approved, no account should be presented as connected or auto-posting.

ABSOLUTE FANTASY LOCKR FIREWALL: only manually entered, owner-approved facts and creative inside AVUQO. Never inspect/access or connect its source code, databases, website, APIs, games, results, fixtures, deadlines, Rival services or monitoring systems.

## Shared Control Centre, SEPARATE modules
Navigation:
- **Site Advertising** (future independently implemented advertiser/inventory/sponsored-placement controls)
- **Brand Social Marketing** (existing four-brand social pipeline)
- **AVUQO Editorial Rotation** (existing owner-reviewed internal site features, separate from paid site advertising)
- **Affiliate Promotion Engine** (existing AVUQO merchant / comparison engine, separate from both)

Do not reuse paid advertiser approval for a brand social-post approval, and do not let an ad buyer alter independent editorial rankings.

## Screenshot comparison: 29 Oct 2026, desktop
Screenshot at avuqo.com shows live v0 header with six main dropdowns and a signed-in owner/admin. Visible issues:
- "About AVUQO" encroaches on the shield/account controls
- Account label clips and "Sign out" wraps on two lines
- Desktop menus use the whole width, leaving no stable reserved account area
- Hero copy/photo and search layout otherwise visually intact
Fix PR: two-tier desktop header with six navigation headings in their own row, account buttons grouped separately, nonwrapping Sign out, compact accessible auth controls on mobile. Verify across normal/high browser zoom and mobile before declaring the visual issue resolved.
