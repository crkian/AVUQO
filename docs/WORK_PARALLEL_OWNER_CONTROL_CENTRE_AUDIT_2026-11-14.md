# Parallel Work task: read-only owner Control Centre acceptance

Prepared 14 November 2026 after production PR #195. **Not launched automatically.** Use ChatGPT **Work mode** when credits are available and owner explicitly authorises the signed-in browser session. Keep this task **read only** and independent of current GitHub engineering.

## Authority
1. Re-read current `crkian/AVUQO` `main` and `AVUQO_START_HERE.md`; verify latest production Vercel READY SHA and `www.avuqo.com` alias. Do not trust this dated brief if newer releases exist.
2. Read `docs/AVUQO_CONTROL_CENTRE_OWNER_AUDIT_2026-11-14.md` and `docs/CONTROL_CENTRE_OWNER_AUDIT_RECONCILIATION_2026-11-14.md`.
3. The original owner session rendered **56** Control Centre pages plus **14** linked variants, but did not exercise Save, Publish, Import, Retry, or settings changes. Code now uses authenticated server-admin clients for private Awin observations; database count at the latest read-only check was **74**.

## Read-only browser route acceptance
- In the owner's **already authorised signed-in** browser, inspect `/control-centre/marketplace`, `/control-centre/source-atlas` and `/control-centre/awin-feed-updates`. Record each actual Awin observation metric, timestamp and screenshot **without any customer/merchant personal information**. If metrics differ from 74, report actual values, page loading outcome, permitted role and read-only query error; database may change in future.
- Inspect `/control-centre/content/pages?page=home`, `?page=about`, `?page=trust`. Confirm that private editor renders, owner-only Publish UI is appropriately gated, and no error appears. Check current Vercel runtime logs for fresh `Date.now()`, prerender or 5xx errors, with request time/path. **Do not click Save or Publish.**
- Inspect `/control-centre/live-data` and measure page navigation until visible metrics and candidate shortlist separately. Note blank/lack of intermediate loading UI and rough timing in an ordinary owner browser. Record existing 5,000-row capped scan and repeated 200-row pages; **do not run custom writes, source syncs, retries, or large-data exports**.
- Observe Endpoint Checker unconfigured targets and Open Food Facts sample status; a transient upstream HTTP 503 is not a local product-data permission approval.
- On customer site, inspect `/products` and all four named research model routes for actual identity/claims, then `/products/pilot-cadbury-heroes-pouch-300g` and a clearly fake slug. Record the **actual HTTP response status** from browser network/developer tools if available, not just not-found page text. The latest inspected production response for draft and unknown slugs was **HTTP 200**, an open defect after PR #194.
- Check 390px and 1440px viewports for navigation/overflow on product and Control Centre pages, accessible error labels and no unlicensed retailer photos. Do not log in as additional people or view user/customer records.

## Deliverable
Create a single consolidated read-only finding report with columns:
`route | role/viewport | observed status/metric | elapsed time | screenshot or log evidence | expected result | issue priority | code area | what was not independently verified`.

End with five small PR-ready remediation recommendations prioritising P0 product 404, P1 owner metric parity, P1 Live Data page first paint, P1 editor runtime warnings, and safe controlled fixture-based admin writes in a **separate** approved test environment. Cite dates, production SHA and actual browser evidence.

## Safety / coordination
- **No Git pushes, PRs, merges, deployments, Supabase writes, RLS changes, content Save/Publish, campaign creation, Awin feed activation, retries, imports, scripts with side effects or Tyres UK/Pneus schedule changes.**
- Work and the engineering chat must not edit the same PR/branch concurrently. Work returns independent evidence for a follow-up small engineering PR.
- Existing privacy, source-rights, product image/price and marketing emergency-stop gates remain unchanged. Do not try to bypass the owner's auth.
