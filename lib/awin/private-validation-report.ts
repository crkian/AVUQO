import {privateAwinSnapshotKey,AWIN_PRIVATE_SNAPSHOT_BUCKET} from "./private-snapshot";
import {validateTooledUpGzipStream} from "./tooled-up-full-stream-validator";

export type TooledUpValidationReport=Awaited<ReturnType<typeof validateTooledUpGzipStream>>;

/**
 * Prepare a diagnostic-only, database-safe report after full byte validation.
 * An independently trusted storage reader must supply the stream and exact key.
 * This does NOT grant rights, currency approval, staging or publication.
 */
export function privateTooledUpValidationRow(report:TooledUpValidationReport,objectKey:string){
 if(report.status!=="validated_private_diagnostics"||
    report.advertiser_id!=="496"||report.feed_id!=="89987"||
    report.currency_verified!==false||report.rights_verified!==false||
    report.ready_to_stage!==false||report.private_only!==true||
    !Number.isSafeInteger(report.actual_rows)||report.actual_rows<1||
    !Number.isSafeInteger(report.compressed_bytes)||report.compressed_bytes<1||
    !Number.isSafeInteger(report.expanded_bytes)||report.expanded_bytes<1||
    report.source_columns!==29)
  throw Error("invalid_private_diagnostics");
 const expected=privateAwinSnapshotKey("496","89987",report.snapshot_sha256,"csv.gz");
 if(objectKey!==expected)throw Error("snapshot_digest_key_mismatch");
 const fields=[
  "wrong_merchant_rows","wrong_feed_rows","missing_product_ids",
  "duplicate_product_ids","invalid_price_rows",
  "unverified_affiliate_links","missing_titles","out_of_stock_rows"
 ] as const;
 for(const field of fields){
  if(!Number.isSafeInteger(report[field])||report[field]<0||
     report[field]>report.actual_rows)
   throw Error("invalid_validation_counter");
 }
 const critical=report.wrong_merchant_rows+report.wrong_feed_rows+
   report.missing_product_ids+report.duplicate_product_ids+
   report.invalid_price_rows+report.unverified_affiliate_links+
   report.missing_titles;
 if(critical!==report.critical_issues)throw Error("critical_count_mismatch");
 return {
  advertiser_id:"496",feed_id:"89987",
  bucket_id:AWIN_PRIVATE_SNAPSHOT_BUCKET,
  object_key:objectKey,snapshot_sha256:report.snapshot_sha256,
  actual_rows:report.actual_rows,compressed_bytes:report.compressed_bytes,
  expanded_bytes:report.expanded_bytes,source_columns:report.source_columns,
  wrong_merchant_rows:report.wrong_merchant_rows,wrong_feed_rows:report.wrong_feed_rows,
  missing_product_ids:report.missing_product_ids,duplicate_product_ids:report.duplicate_product_ids,
  invalid_price_rows:report.invalid_price_rows,
  unverified_affiliate_links:report.unverified_affiliate_links,
  missing_titles:report.missing_titles,out_of_stock_rows:report.out_of_stock_rows,
  critical_issues:critical,
  currency_verified:false,rights_verified:false,ready_to_stage:false
 };
}
