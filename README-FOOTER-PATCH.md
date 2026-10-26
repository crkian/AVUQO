# AVUQO v0.8 Phase 2 — Footer and Legal Navigation

Files to copy into your project at the same relative paths:
- components/layout/Footer.tsx (replacement)
- app/globals.css (replacement; preserves existing CSS and appends styles)
- app/cookies/page.tsx (new)

The existing `/about`, `/trust`, `/privacy`, `/terms`, `/contact`, `/affiliate-disclosure` and `/score` pages are retained and linked. The footer uses your existing violet-blue Q identity.

## Before publishing widely
- Set NEXT_PUBLIC_CONTACT_EMAIL to a monitored, tested address; confirm whether support@avuqo.com group receives external mail and can reply properly.
- Privacy and Terms pages currently contain launch-stage language. Complete an accurate legal review with the operator's identity/contact, data purposes and lawful bases, retention, processor list, rights and complaints contact, and applicable business disclosures.
- Audit actual cookies, analytics and affiliate trackers. `app/cookies/page.tsx` is informational, NOT a consent-management mechanism. Implement prior consent controls where legally required, with refusal and withdrawal options, before enabling non-essential technologies.
- Label individual affiliate-linked content/ads near the actual links where necessary; a generic footer disclosure by itself is not sufficient.
- Check all footer URLs in production, mobile layout, and run project build checks before deployment.
