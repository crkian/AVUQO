# P0-03: signed-in Wishlist, Basket, Saved and Watches acceptance

## Baseline on 4 November 2026
- Github `main` software version 0.2.2 before this work. Historic Wishlist, shared Lists, Saved and Watches have **zero** rows in Supabase. No customer rows were changed during this audit.
- Existing RLS on Saved/Watches is account-scoped. Shared Lists use `private.user_shared_list_ids()` for owner and member access; personal Wishlists/Baskets need separate owner-only restrictions.
- Legacy wishlist/basket save buttons directly send client-controlled merchant, title and price snapshots into Supabase and do not enforce one item per list at the database level.
- Signed-in customer browser sessions, registered merchant offers and deliverable mail clients are not available in this review. **Do not mark full customer acceptance completed on build success alone.**

## P0-03 release behaviour
1. Both product-page save buttons send **only product/offer identifiers** to `POST /api/collections/items`. It authenticates with `auth.getUser`, requires a currently eligible `verifiedProduct` and matching offer, derives canonical title, merchant, price and timestamp on the server, then writes one private user collection.
2. A basket's **named copy** is created from the authenticated user's own server-side basket by `POST /api/collections/save-basket`, never from client-supplied items or prices. On failed copy, the new parent list is removed.
3. The SQL migration creates per-owner/per-kind and per-list/item unique indexes and **restrictive RLS rules**. Anonymous or signed-in REST requests may not create/modify planning list snapshots directly. Existing normal shared lists and personal Saved/Watches operations remain.
4. Saved price snapshots are **historical**, not live market quotes. Removed, paused, expired or unapproved offers fail verification at the moment of a new add; old saved selections re-open an AVUQO product page which may now show no eligible offer.
5. Email remains a **user-initiated mailto draft**, not email sent by AVUQO. Only the first 18 items appear, the overflow is disclosed, links must remain internal and email body fields have control characters stripped.
6. Independent AVUQO Score continues to exclude affiliate commission and no retailer feed or email service is activated.

## Release order
- Review CI build/lint/collection tests, merge v0.2.3 PR and verify production Vercel SHA.
- Apply `supabase/migrations/20261104103000_p003_private_verified_collections.sql` after the server endpoints are live, through the official migration tool.
- Recheck policies, `pg_indexes`, and that Saved/Watches ownership policies remain. Confirm no data loss and no unapproved Awin offers.
- Run role and session acceptance with a **test account pair on a test environment**, not real users:
  - Anonymous: POST without login returns 401. Direct Supabase writes to a planning list fail.
  - User A: saving an eligible product/offer creates one private wishlist/basket; double submission returns alreadySaved; invalid/expired/removed offer returns 409 without a new row.
  - User B: cannot read A's wishlist, basket or item; cannot add/alter/remove A's planning item by ID; cannot create a member invitation into A's personal collection.
  - User A: remove an item; save a named copy; opening /lists/[id] shows the complete copy, captured-price language and a safe internal recheck link. Simulate copy failure and confirm rollback. Normal collaborative list creation still works.
  - Email: 1, 18 and 19 items; test desktop Chrome and mobile Safari/Android link, copy-to-clipboard, accessibility/keyboard focus and long mailto truncation handling.
  - Saved/Watches: auth/no-auth read and remove, permission isolation and existing /deal links; PR #21 owns unresolved legacy routing changes.
- Use a properly licensed **fixture** or staging mock for eligible positive offer tests. No approved live Awin offer was available in the audit.

## Still open after release
Real two-account tests, real mobile mailto handling, authorized merchant offer availability and legacy Saved/Watch destination repair are still acceptance gates. No manufactured test customer or approved merchant should be represented as real.
