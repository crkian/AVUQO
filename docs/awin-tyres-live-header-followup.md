# Tyre live-schema follow-up: 2026-11-05

Owner invoked authenticated tyre header checks:
- **Tyres UK** advertiser 12715 feed 93988: original route returned generic HTTP 422, stage unknown. Do not infer upstream cause without diagnostics.
- **Tyres Pneus Online UK** advertiser 15236 feed 26513: 32 columns, comma-delimited gzip. Fields include `merchant_product_id`, `product_name`, `search_price`, `delivery_cost`, `in_stock`, `last_updated` and nine custom-column slots (`custom_1` through `custom_5`, `custom_7` through `custom_9`). No dedicated currency column, tyre dimension fields, load/speed, wet grip/fuel/noise or fitted price. Currency, rights, price semantics and tyre specs **not verified**. No product rows downloaded or stored from this check.

## Safe diagnostics

This update improves the existing internal endpoint:
- `POST /api/internal/awin-tyre-header?advertiser_id=12715&feed_id=93988` returns `failure_kind` and `diagnostic_stage` if it fails, while keeping Awin URLs private.
- `POST /api/internal/awin-tyre-header?advertiser_id=15236&feed_id=26513&mode=sample` inspects at most 25 product rows and returns **only aggregate counts** for title-derived tyre-size candidates, custom columns containing data, numeric price formatting, merchant and product ID consistency, and explicit currency presence. Title-derived sizes are unverified candidates only.
- The same `mode=sample` is allowed for 12715:93988 if its header can be safely parsed.

Bearer `CRON_SECRET` required. No import, public products, price offers, snapshot writes, scheduled job or publication. Try the failed 12715 header request again first and examine safe `diagnostic_stage` / `failure_kind`; then run 15236 sample.

The sample does not reveal the meaning of a custom column, proof of GBP, installed price, ownership or permissions. Before staging, build a source-specific adapter after a reviewed data dictionary or private values inspection; never infer fitted or delivered price from a title.
