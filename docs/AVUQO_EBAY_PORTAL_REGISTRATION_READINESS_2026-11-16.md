# eBay Developer Portal production registration readiness

**16 November 2026** | **£0 additional spending** | **NO DOCKER** | **STATUS: DO NOT SUBSCRIBE YET**

## Screen verified from owner screenshot

The page is **Alerts and Notifications → Production → Marketplace Account Deletion**. The alert email `support@avuqo.com` displays **Email settings successfully saved**. The **Marketplace account deletion notification endpoint** and mandatory **Verification token** are empty and the **Save** and **Send Test Notification** controls are disabled. The exemption toggle appears off.

The existing production AVUQO receiver URL is:

`https://www.avuqo.com/api/ebay/account-deletion`

**This URL is an intended future registration value, not permission to save it now.**

## Exactly what eBay requires

eBay sends `GET /api/ebay/account-deletion?challenge_code=<challenge>` after the URL and verification token are saved. The server must respond with JSON `{"challengeResponse":"<hex sha256>"}` where the SHA-256 input is the challenge value **then** the verification token **then** the exact endpoint string. The token must be 32–80 characters chosen from letters, numbers, hyphen or underscore. eBay will then deliver `MARKETPLACE_ACCOUNT_DELETION` notifications to the same URL via HTTPS POST and expects a successful 2xx response. The account data must be handled according to retention and deletion obligations. Official documentation: https://developer.ebay.com/develop/guides/buy/marketplace-user-account-deletion.

AVUQO's current GET route already implements the documented challenge algorithm, but returns **503** unless both `EBAY_DELETION_ENDPOINT_URL` and `EBAY_DELETION_VERIFICATION_TOKEN` have been configured on Vercel. Neither environment variable value should be copied into the repository or disclosed in screenshots. Do not generate or enter a real token in the eBay portal until the POST receiver is release-ready.

AVUQO's current POST route verifies notification signatures and attempts a private, HMAC-only deletion receipt journal when properly configured, but always returns **503** even after recording a valid notification. This is deliberate to avoid falsely claiming deletion support. Subscription now would result in repeated notifications, callback-down alerts and possible non-compliance.

## Newly implemented safety evidence

`tests/ebay-portal-registration-runtime.test.mjs` transpiles and invokes the actual Next.js route in a local Node VM with **random synthetic verification tokens**. It checks the correct canonical URL hash, response headers, exact challenge query validation, mismatched/missing configuration, POST credential fail-closed, invalid signature refusal and signed recorded/duplicate/unavailable receipts all yielding **503**, never 2xx. CI runs it automatically, no production outbound eBay calls or secrets.

## Release gates before filling the two empty portal fields

1. Prove complete, idempotent account erasure/retention handling for all relevant data surfaces and external processors; legal/backup requirements approved.
2. Apply and safely validate the private work journal and audited executor migrations through the normal reviewed release process. Implement the trusted worker and its durable retry/exception mechanism; prove success and failure paths under controlled tests.
3. Prove genuine signed eBay notifications and the verified, secure 2xx acknowledgment semantics; ensure the receipt can only be acknowledged once durably and lawfully accepted.
4. Provision the production verification token securely **in Vercel**, never GitHub source, and configure the canonical endpoint URL; verify the actual production GET challenge without revealing the token.
5. Only then enter the exact matching URL and token in the eBay Developer Portal, press **Save**, run **Send Test Notification** and inspect privacy processor/audit evidence. Do not select the exemption toggle without an actual substantiated exemption.
6. Confirm source permissions and activation independently; keep Awin feed processing unaffected.

**Current release:** eBay source `paused`, sync disabled, imports quarantined, deletion POST HTTP 503, portal unregistered. eBay **NO-GO**. No production database changes, Docker, extra services or added cost.
