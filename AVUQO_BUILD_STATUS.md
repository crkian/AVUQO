# AVUQO Build Status - v0.6

## Working product surface

Consumer:
- homepage
- Discover
- Search
- Categories
- fixture deal intelligence pages
- Watches
- Saved
- Shared Lists
- Account / preferences
- Reality Check intake
- AVUQO Score explainer
- feedback / Found Better
- Live pipeline deals
- live deal detail
- outbound merchant click tracking

Private Control Centre:
- authenticated owner/admin gate
- Overview
- Sources
- Deal Intelligence Pipeline
- Promotion Intelligence
- Exceptions
- Autopilot controls
- Revenue
- Trust

Backend foundations:
- hosted Supabase
- RLS / user roles
- source registry
- source sync runs
- raw ingestion evidence
- product matching
- offer catalogue
- price history
- availability history
- deterministic AVUQO Score components
- public publication layer
- click attribution
- promotion candidate generation
- automation endpoint
- system health / exceptions

## First live connector

Awin Enhanced Feed adapter is implemented but remains inactive until the owner supplies valid server-only Awin credentials and enables the Awin source.

## Still intentionally not live

- unattended social publishing
- Pinterest credentials / publishing
- eBay/CJ/impact live connectors
- travel live connectors
- automatic user notifications
- remote Reality Check fetch worker
- production cron scheduling
- affiliate conversion reconciliation imports
- full personal-intelligence learning

These remain staged because credentials, provider permissions, policies or production worker infrastructure are still required.

## Trust rule

AVUQO Score is determined from value evidence. Affiliate commission does not enter the score or organic ranking calculation.
