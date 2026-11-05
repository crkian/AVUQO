# Tooled Up master-feed private adapter (496:89987)

## Verified actual source
2026-11-05 authenticated read-only Awin master-feed header inspection returned exactly 29 columns, comma-delimited and gzip-compressed, with product identity, Awin tracking URL, search_price, stock and brand/category fields. It did **not** include currency. Listed feed size is 84,245 rows (inventory estimate), approximately 337 private 250-row chunks.

## Implemented in this PR
`lib/awin/tooled-up-master-adapter.ts` accepts only the exact reviewed 29-field schema, advertiser 496 and master feed 89987. It verifies row advertiser identities and 1–250 row boundaries. It delegates actual pricing, link validation, product ID uniqueness within each chunk, availability and exclusion decisions to the existing `prepareGeneralBatch`. Every output record remains `unverified` for permissions with image rights `false`.

**Currency remains a blocker.** The adapter has no automatic currency default. It requires an explicitly supplied `TooledUpCurrencyEvidence` value scoped to this advertiser/feed, containing a reference to *independently verified* GBP pricing. No such approval/evidence is persisted or configured as part of this PR. The interface is an internal capability and not an approval system: a future workflow MUST validate evidence against trusted reviewed records server-side, rather than accepting an untrusted caller-provided object.

## Not implemented
No live Tooled Up import, no snapshot download/upload, no queue job creation, no new scheduled worker, no conversion to public offers, no 84k-row validation. Cross-chunk duplicate checking is a responsibility of the future snapshot validator and existing unique private import checks. Before large-scale imports, independently confirm the programme's currency terms and test an authenticated read-only bounded row sample or whole-file validation without database writes.

## Safety
The original pilot adapters for Petlibro and Mozillion are untouched. Existing `AWIN_AUTO_IMPORT_ENABLED` setting remains off. Public publication remains paused.
