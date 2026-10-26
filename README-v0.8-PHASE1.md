# AVUQO v0.8 Phase 1 - Deal Intelligence audit and safety patch

Source: uploaded build.zip (v0.7 release pack).

## Verified existing capabilities
- Awin and demo source connectors
- Normalisation, price history and scoring
- Published-deal upsert, promotion-candidate generation
- Private pipeline endpoint with bearer secret
- Source controls and emergency stop

## Identified safety issue
The original code treats the demo source as affiliate eligible, can mark demo offers as published when scoring thresholds pass, and can create demo promotion candidates.

## Patch
In lib/pipeline/run.ts:
- Demo merchants no longer qualify for affiliate eligibility through the ingestion path.
- Demo deals are held instead of newly published.
- Demo offers are excluded from new promotion candidates.

## Deployment cautions
- This patch does not automatically remove previously published demo records or existing promotion candidates. Audit those database rows first.
- This patch does not verify production database migrations or deployed code version.
- Affiliate programme approval and feed rights must be confirmed before enabling Awin ingestion.
- After applying, deploy to staging and test demo ingestion, real-source ingestion and the published-deal listing; then deploy production.
- Full integration tests have not been run in this environment.

## Other follow-up findings
- Published deal guard currently checks score, confidence and stock, but does not explicitly require an approved affiliate merchant; this may be acceptable for editorial deals, but needs a product policy.
- The pipeline metadata still labels itself v0.6.
- Source rows for non-demo connectors must be provisioned prior to ingestion.
