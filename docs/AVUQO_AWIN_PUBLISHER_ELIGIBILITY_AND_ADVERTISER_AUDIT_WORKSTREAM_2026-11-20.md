# AVUQO Awin publisher eligibility, advertiser access and recovery workstream
**Handover date:** 20 November 2026  
**Context:** Independent UK retail park, product discovery, shopping directory and evidence-led comparison.  
**Status:** Investigation complete; remediation and direct Awin classification verification outstanding.

## Why this exists
Some Awin programme applications have been declined for publisher-type incompatibility, perceived brand/URL fit, inaccessible or not-yet-auditable public content, and other programme-specific concerns. A private review of advertiser correspondence established that these are *different* failure modes. It does not establish AVUQO's current registered primary or secondary Awin publisher types or prove any particular advertiser permits comparison use.

**Privacy:** This is a public-repository-safe operational handover. Do not commit email text, Gmail IDs, manager addresses, rejection-by-advertiser records, confidential commissions or unpublished programme communications to the public GitHub repository. Full evidence remains in the owner's private investigation handover and linked communications.

## Core truth and positioning
AVUQO is an independent UK product discovery, shopping directory, product comparison and editorial buying-information platform. Organic ranking must not be adjusted for affiliate commissions. Use only actually supported publisher classifications and never call AVUQO a paid Google Comparison Shopping Service unless it runs that separate activity. Affiliate acceptance does not independently authorise product images, feed reuse, individual price publication or merchant trademarks.

## Workstreams and release gates

### A. Verify Awin account classification and programme eligibility
- Inspect the authenticated Awin publisher account, or request an official Awin support confirmation of its recorded primary and additional promotional types.
- Ask whether these types determine programme eligibility, whether multiple genuine methods may be declared, and whether rejected programmes permit AVUQO's actual comparison/directory/editorial traffic methods.
- Record dated, advertiser-specific permissions and any appeal guidance *privately* in the owner Control Centre; do not infer acceptance from programme marketing pages.
- Reconcile any conflicting advertiser IDs before feed activation or public promotion.

### B. Make merchant-facing website content independently auditable
- Test public, unauthenticated access to homepage, /catalogue, /shop (once released), /products, /partners, appropriate /categories paths, retailer pages, pricing evidence explanations, privacy/terms and affiliate disclosures.
- Include real HTTP status, populated HTML/stream completion, broken images/deep links, canonical metadata, bot/firewall restrictions, mobile usability and seller relevance. **HTTP 200 alone is insufficient**; React streaming may return 200 with a failed server component.
- Match the application URL to a genuinely relevant public category or editorial page, not a placeholder.
- Re-audit historically rejected dead/blocked URLs after production release before requesting reconsideration.

### C. Recover applications where evidence supports reconsideration
- Classify reason separately: publisher-type policy, inaccessible URL, weak brand/category fit, content depth, GDPR concern, and unknown/other.
- Record evidence of fixes, the exact public URL to review, correct promotional types, and realistic traffic methods; do not manufacture reach, conversion statistics or availability.
- Use direct programme-manager clarification or official Awin support when the response is ambiguous.
- Track each case privately through: pending, approved, rejected, type-incompatible, website issue, rights-unverified, ready for reconsideration and closed.

### D. Expand useful shopping breadth lawfully
- Focus merchant/product expansion on approved programmes with specific permitted data use, GBP price evidence, freshness, valid stock and live own-publisher affiliate links.
- Treat website partnership pages, authorised product feeds, product photos, and cross-merchant total-price comparisons as separate rights and evidence gates.
- Do not weaken the existing verified-offer filters to improve shop density or make the site look more attractive to advertisers.

## Implementation relationship to current release
PR #330 is a **separate shopping and private tyre cross-match candidate**. Its new /shop page must be runtime-verified in an environment with appropriate server credentials, and must fail safely if those credentials are unavailable. The diagnostic tyre SQL remains service-role-only and must not publish private tyre data. No advertiser rejection remediation or Awin publisher-classification change can be claimed as complete merely because #330 passes CI.

## Next evidence required
1. Official Awin classification and each target advertiser's acceptable publisher models.
2. An authenticated/private advertiser-compatibility register (not an unrestricted public JSON or source-code list).
3. A third-party audit of important public pages, bot accessibility and broken merchant/application URLs.
4. Evidence-backed outreach decisions and separately recorded programme feed and image permissions.
5. A dated implementation/release log with exact production SHA, checks and remaining blockers.

**Preserve all earlier AVUQO handovers, original 25 departments, 21 current partner pages and 29-workstream/12-gap backlog. Nothing in this document grants new publication rights.**
