# Awin read-only joined-programme diagnostic

**Release:** v0.3.1. Route: `/control-centre/awin`.

The owner/admin-only diagnostic calls Awin's authenticated `GET /publishers/{publisherId}/programmes?relationship=joined` endpoint **only on explicit user request**. It prints a bounded list of programme names and IDs, never the OAuth token or raw provider response. SSO-protected Vercel Preview and `requireControlCentreAccess()` both guard the route.

## Provider response witnessed by the owner, 4 November 2026

The owner copied the signed-in **preview diagnostic's** success output into the project conversation:
- API result: `Joined programmes retrieved`, **16 valid joined programmes**.
- **Cadbury Gifts Direct 736: Found in joined programmes.**
- **Petlibro UK Affiliate Program 77952: Found in joined programmes.**
- 14 additional joined programme IDs were returned. See [the 16-programme onboarding queue](./AWIN_JOINED_PROGRAMMES_2026-11-04.md) once merged.

**Evidence distinction:** This is an owner-reported result of the preview's server-to-Awin request, not independent access to the owner's live authenticated browser and not a licence to republish product data. No anonymous or non-admin browser acceptance evidence was provided. Membership may change, so reconfirm before any activation.

## Acceptance and restrictions
- GitHub CI build/lint/secret scanner pass and preview deploy READY.
- Access is gated by Supabase `auth.getUser()` and `user_roles` owner/admin checks before reading server secrets.
- No data is written, no source is resumed, no product feed imported, no link created, no offer publicised and no image or price rights inferred.
- **Still open:** direct negative browser tests (signed out and non-admin), external programme terms, exact merchant feed format/availability, deep-link rights, price/image permission, fresh sample, offer validation and an owner release test. The Awin connector still uses a single `AWIN_ADVERTISER_ID` at a time.
