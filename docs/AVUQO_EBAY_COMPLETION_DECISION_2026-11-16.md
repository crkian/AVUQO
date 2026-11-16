# eBay compliance completion decision | 16 November 2026

## Critical new official eBay finding

eBay requires an application to **subscribe** to Marketplace Account Deletion/Closure notifications or **apply for an exemption** when it does not persist any eBay data. The official guidance states that successfully completing either process activates an eligible production keyset. Neither the exemption nor the activation has been submitted/verified by AVUQO yet.

**Authoritative:** [eBay Marketplace User Account Deletion, including opting out](https://www.developer.ebay.com/develop/guides/buy/marketplace-user-account-deletion), [eBay Buy API prerequisites](https://developer.ebay.com/api-docs/buy/buy-requirements.html).

### Independent AVUQO evidence reviewed, 16 November

- Public `/partners/ebay-uk`, `lib/ebay/epn-uk-links.ts`: fixed allowlisted outbound UK category-search URLs bearing EPN affiliate campaign `5339240499`. No seller identifiers, product catalogue writes or eBay price snapshots in these modules.
- Owner-only `app/api/internal/ebay-browse-preflight/route.ts`: aggregate counts only, reads source pause state, no eBay product inserts/updates, no raw item output. It is currently not operational with production OAuth credentials.
- Production Supabase eBay source `paused`, `sync_enabled=false`, `credential_status=not_configured`; eBay-associated `offers`, `source_ingestion_items`, `product_matches`, `price_history`, account item links, deletion receipts and partial erasure audits all **0**. Live Storage objects **0** at last audit; five eBay source/product write-lock triggers remain enabled.
- Production Vercel environment name check: only `EBAY_SANDBOX_CLIENT_ID` and `EBAY_SANDBOX_CLIENT_SECRET` listed. **No** production OAuth, deletion challenge or HMAC secrets listed.
- No evidence from this audit of eBay partner identifiers persisted in those reviewed systems. This is **NOT** proof of zero persisted eBay data across all historical backups, logs, Awin/other records, third-party click/analytics processors, or past API responses.

## Two legitimate pathways, NOT interchangeable

### Path A: owner-approved "Not persisting eBay data" exemption (only while true)

This is **potentially appropriate to AVUQO's present fixed EPN-link-only implementation**, *provided an owner first confirms no eBay data persists anywhere else*, including logs, external storage, backups and third parties. The eBay declaration applies to **any persisted eBay data**, not merely to user IDs or personal data. The observed fixed EPN campaign/URLs and page code are not enough to certify eligibility without that review. Do not automatically click the toggle or select exemption reason.

Owner action in eBay Developer Program:
1. Sign in at [Application Keys](https://developer.ebay.com/my/keys), choose the correct **Production** keyset, select **Notifications** / **Alerts & Notifications**.
2. Choose **Marketplace Account Deletion**, use **Not persisting eBay data** only if the statement is truthful for *every* AVUQO storage/processor.
3. Read the confirmation, choose an accurate **Exemption reason**, add a truthful limited-use explanation, then **Submit**. Preserve the success/accepted status screenshot in a private owner record; no public credential values.
4. Verify that the same **Production** keyset is genuinely **Active**. An exemption submission alone, without accepted status, is NOT activation. If portal rejects, record error and seek eBay Developer Support rather than declaring success.
5. The existing eBay source remains **paused** and DB-quarantined. eBay EPN search links can remain as they currently are. Do **not** turn on persistent individual product feeds, seller data, price snapshots, image caches or user-linked click histories under an exemption until eBay confirms continued eligibility or subscription replaces it.
6. Production Buy/Browse API growth check, separate API rights, traffic, EPN/Feed access and product display/refresh permissions still require independent verification. An active keyset is **not** a Browse API commercial approval.

**Candidate owner explanation, only after full facts check:** "AVUQO currently provides fixed outbound eBay UK affiliate category-search links, with product details shown on eBay. We do not persist eBay listing/product, seller or account information in AVUQO's application database or Storage. Any future feature that persists eBay data will be reviewed and the notification subscription established before activation." This is **not** a certified statement: amend or do not submit if the logs/processor/backup audit contradicts it.

### Path B: subscribe to signed account-deletion notifications (required if persisting eBay data)

This is the sustainable path for the originally planned **persisted priced item catalogue** and eBay account/seller-linked data. It requires owner-controlled production keys and a working challenge endpoint, a verified signature, **durable accepted event processing**, complete idempotent erasure/retention rules, future reimport suppression, real eBay test and monitoring. eBay explicitly permits **202 Accepted** after successful verified receipt; deletion obligations still apply and should be completed downstream with demonstrable evidence. A 202 status does NOT mean erasure completed. AVUQO's current POST deliberately returns 503 and is NOT registered or safe to register.

Current implementation has authenticated receipt HMAC journaling, strict DB source quarantine, permanent receipt tombstones, exact source mapped partial DBA-only erasure, and synthetic signature unit tests. It **does not** have complete cross-system erasure, approved retention/backup policy, automatic retry/dead-letter handling, safe 2xx acceptance, eBay production credentials or real provider integration tests. The previously recorded two-session lock test was inconclusive and cannot be claimed passed.

### Decision rule

**No owner attestation, no exemption. No live subscription, no persistent eBay product import.** Choose the path reflecting **current and intended** processing, not whichever merely unlocks production keys fastest. For AVUQO's original goal of persistent priced eBay product comparisons, prepare Path B before persisting any listing or seller data; a temporary Path A exemption is not permanent authorization for that future product.

## Immediate owner-dependent blocker

The assistant cannot sign into the owner's eBay Developer Program portal in this conversation, truthfully attest to unknown historic/third-party retention, approve external eBay rights, or retrieve/generate production Client Secret. User action is necessary at the compliance declaration and API-approval stages. Do not paste Client Secret, database URL, HMAC secret, OAuth bearer token or verification token into chat or GitHub.

## Engineering guard

`tests/ebay-current-no-persist-safety.test.mjs` and GitHub CI check that the current public affiliate category links are fixed, do not write seller/item records, that the private Browse diagnostic returns aggregate counts, that current eBay database write quarantine is present and that the deletion webhook still intentionally replies 503. These are **regression checks of known code**, not a complete data-retention or eBay exemption acceptance test.

## Handover and continuation

Begin with `docs/AVUQO_ACTIVE_HANDOVER.md` and this decision file. Preserve eBay source quarantine and existing Awin importer work. If owner chooses and confirms Path A, collect exemption accepted proof and production keyset status before stating activation. If owner chooses Path B, implement durable idempotent full-erasure workflow and production signed provider tests before portal registration. Track exact Git PR SHA, Vercel deployment and Supabase state in MD+JSON handovers and Git tracker; do not create more speculative scaffolding.
