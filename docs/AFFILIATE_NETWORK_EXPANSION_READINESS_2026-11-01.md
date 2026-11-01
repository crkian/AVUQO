# AVUQO Affiliate Network Expansion: Preparation Gate (1 November 2026)

**Status:** Draft implementation preparation, not deployment, application or active connection.
**Scope:** Eight affiliate publisher networks, excluding separate dropshipping/direct-selling operations.
**Existing foundation:** Awin ingestion code, paused/permission-aware source registry, private imports and Control Centre. Neither Awin feed use nor imported product publishing is assumed approved.

## Principle: one catalogue, eight network-specific adapters

Do not create separate public comparison engines, page designs, score calculations or ranking rules. Use shared canonical product identity, offers, condition, delivery, timestamps, price provenance, consent-aware click attribution, audit and independent scoring. A network's commercial payout may never affect AVUQO Score or organic ranking.

A dedicated *private, read-only* Control Centre planning page lists the target networks and checks the existing source registry. It has no publish, import, connect, approve or sync actions. It does not create database rows.

## Integration order and provider documentation

| Order | Network | Source route | Initial actions |
|---|---|---|---|
| 1 | Awin | Existing connector and private importer | Complete admin approval security PR; reconcile staged products, duplicates, individual advertiser rights, prices, links and image rights. |
| 2 | eBay Partner Network | [Browse API](https://developer.ebay.com/api-docs/buy/api-browse.html) | Publisher/developer access; condition, item identity, listing expiry, shipping, affiliateCampaignId and permitted returned affiliate URLs. |
| 3 | Webgains | [Publisher Smart Platform API](https://knowledgehub.webgains.com/home/what-api-connections-do-webgains-offer-for-publish) | Joined advertisers; program changes, authorised product SKUs, tracking and transaction reports. |
| 4 | impact.com | [Partner Integrations](https://integrations.impact.com/) | Brand partnership approvals, catalogue API scope and allowed publishing/attribution. |
| 5 | CJ Affiliate | [CJ developer portal](https://developers.cj.com/) | Publisher account, joined advertisers, API token/company identifiers, product GraphQL and commission reporting. |
| 6 | Tradedoubler | [Products API](https://dev.tradedoubler.com/products/publisher/) | Publisher account, advertiser relationships, product API access and feed rights. |
| 7 | Rakuten Advertising | [Developer portal](https://developers.rakutenadvertising.com/) | Publisher account, advertiser links, reporting and API tokens with permitted uses. |
| 8 | Amazon Associates UK | [UK Associates](https://affiliate-program.amazon.co.uk/) and [Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding) | UK approval; UK-scoped credentials; Amazon-specific content, caching, price/availability and comparison-shopping policies. |

Order is for **engineering**, not a requirement to delay applications. Apply where eligible while preparing the common adapter boundary. Each provider's current contract, terms, quotas, endpoint versions and content permissions must be reviewed after account approval. No API credentials, memberships, image/feed rights or traffic levels have been independently verified by this change.

## Universal launch gates

1. Explicit publisher programme approval.
2. Individual retailer/advertiser approval and eligible promotion method.
3. Permission for the proposed API or feed in the UK market.
4. Written/recorded product metadata, price and image rights, with expiry/caching limits.
5. Authorised deep links, disclosures, referral/sub-ID handling and tracking consent.
6. Server-side credential storage and rotation; no browser secrets or keys in Git.
7. Source-specific parser mapping, idempotent imports, deduplication and price history provenance.
8. Strict product/variant/pack/condition matching, honest delivery and stock states, freshness and expiry.
9. Negative permission tests, role/RLS, source pause/kill switch, exception queue, audit logs.
10. Verified click event to approved network conversion to confirmed commission reconciliation. Clicks are not sales.
11. Staging-only smoke tests, production build/security check, explicit owner publication approval and production browser verification.

The list in `lib/affiliate-networks/catalogue.ts` is **an operational planning aid**, not a publication permission engine. Existing and future server-side offer publication controls must enforce the actual rights.

## Next engineering milestones (not accomplished by this preparation)

- **M0:** Reconcile existing draft PR #20 (affiliate approval/security), #22–#25 where relevant, and latest main. Do not blindly merge overlapping branches or reseed inactive categories.
- **M1:** Complete Awin permission verification and private catalogue matching; exercise one small, authorised batch through full review gates.
- **M2:** Define connector adapter interfaces for all eight, with network-specific parsers and licence enforcement. Add eBay first behind a disabled feature flag; do not invent API responses.
- **M3:** Add Webgains, impact, CJ, Tradedoubler, Rakuten and Amazon adapters individually after approval. Validate per-network attribution and reversals.
- **M4:** Enable public merchant comparisons only with authorised, refreshed and independently verifiable products. Every release requires security tests, build, preview and production acceptance.

## User-account tasks (manual external dependencies)

For each provider, the owner must register/apply where necessary, supply truthful promotional-property and business information, accept merchant contracts and verify feed/image/link rights. Configure any approved API keys **only** in protected server environments. Some programmes require additional referrals, qualifying sales or content review before their APIs can be used.

## Operational safety

- No database migration or seed in this change.
- No publishing enabled, no background jobs scheduled and no external network/API called.
- No demo data moved into public production.
- No activation based solely on source `status=active`, credentials present or feed response success.
- Preview and production may share the same Supabase database: do not create synthetic partner or sales records in production.
