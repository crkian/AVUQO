# Mozillion Awin feed classification

The owner supplied a screenshot of the Awin publisher feed selector on 2026-11-05, filtered to Mozillion (advertiser 31539), showing five independent feeds. Cross-checked against existing private Awin discovery rows.

| Feed ID | Awin feed | Screenshot count | Type | Existing product auto-import |
|---|---|---:|---|---|
| 74135 | Mozillion SIM Free Phones | 219 | physical handset | Allowed, private only |
| 97090 | Pay Monthly Contract Phones | 8,227 | contract phone service | Blocked |
| 97136 | SIM Only Plans Hosted Feed | 33 | SIM-only service | Blocked |
| 114910 | Mozillion Travel eSIM Feed | 972 | travel eSIM service | Blocked |
| 118311 | Pay Monthly Plus SIM Only Plans | 8 | recurring SIM service | Blocked |

Awin discovery captured **223** items for feed 74135 earlier on Nov 5, while the owner's screenshot displayed **219**. Counts are time-varying; never assert them as fixed expected values.

The existing auto-import worker now checks both the **exact 74135 feed ID** and its **SIM Free Phones feed name** immediately after confirming the live inventory source. If that name changes or any other Mozillion feed is selected, the physical-product auto-import fails closed.

The other feeds require product/plan-specific schemas covering contract length, upfront price, recurring costs, allowances, roaming territory, service activation/fulfilment, regulated disclosures and explicit programme permissions. Do not mix monthly commitments into ordinary one-time handset price comparisons. No general Mozillion Awin publication rights are established by a feed-selection screenshot.

No additional cron, imports, publication or source-status mutations are included.
