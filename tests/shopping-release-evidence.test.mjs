import test from "node:test";
import assert from "node:assert/strict";
import {shoppingReleaseFailures} from "../lib/products/shopping-release-evidence.ts";
const now=Date.parse("2026-11-24T19:00:00Z"),seen=new Date(now-60000).toISOString(),digest="a".repeat(64);
function fixture(){
 return {
 offer:{id:"offer",source_id:"source",merchant_id:"merchant",product_id:"product",source_offer_id:"12345:sku",price:12.5,currency:"GBP",stock_status:"in_stock",status:"active",last_seen_at:seen,affiliate_url:"https://www.awin1.com/pclick.php?m=12345&a=3135746&p=sku",match_confidence:0.98,raw_data:{merchant_product_id:"sku",live_feed_digest:digest,live_feed_verified_at:seen,source_currency_explicit:true}},
 review:{offer_id:"offer",source_id:"source",advertiser_id:"12345",source_offer_id:"12345:sku",reviewed_price:12.5,reviewed_currency:"GBP",reviewed_feed_digest:digest,reviewed_offer_at:seen,status:"approved",approved_by:"owner",approved_at:seen},
 source:{id:"source",connector_key:"awin",source_type:"affiliate",status:"active",sync_enabled:true,credential_status:"ready",metadata:{publication_permission:"verified",price_evidence_status:"verified",usage_rights_confirmed:true,rights_evidence_ref:"rights-ref",feed_permission_confirmed:true,feed_evidence_ref:"feed-ref",allowed_territories:["GB"],rights_valid_until:"2027-01-01",awin_advertisers:[{advertiser_id:"12345",feed_permission_confirmed:true,approval_evidence_ref:"approval-ref",allowed_territory:"GB",valid_until:"2027-01-01"}]}},
 merchant:{id:"merchant",status:"active",metadata:{external_id:"12345"}},
 programme:{provider:"awin",region:"GB",external_account_id:"12345",metadata:{publication_approved:true,owner_joined_accepted_attestation:{membership_status:"accepted"}}},
 product:{id:"product",status:"active"},
 controls:[{control_key:"global_emergency_stop",enabled:false},{control_key:"source_ingestion",enabled:true},{control_key:"shopping_publishing",enabled:true},{control_key:"deal_publishing",enabled:false}],
 connectorConfigured:true};
}
test("shopping is independent of deal switch and score",()=>assert.deepEqual(shoppingReleaseFailures(fixture(),now),[]));
for(const [label,mutate] of [
 ["withdrawal",x=>x.review.status="withdrawn"],
 ["changed price",x=>x.offer.price=13],
 ["changed digest",x=>x.offer.raw_data.live_feed_digest="b".repeat(64)],
 ["wrong source",x=>x.review.source_id="different"],
 ["wrong product",x=>x.product.id="different"],
 ["revoked membership",x=>x.programme.metadata.publication_approved=false],
 ["paused source",x=>x.source.sync_enabled=false],
 ["expired validity",x=>x.offer.valid_until=seen],
 ["missing controls",x=>x.controls=[]],
 ["emergency stop",x=>x.controls[0].enabled=true],
 ["shopping disabled",x=>x.controls[2].enabled=false],
 ["missing credentials",x=>x.connectorConfigured=false],
 ["stale evidence",x=>x.offer.raw_data.live_feed_verified_at="2026-11-20T00:00:00Z"],
 ["inactive product",x=>x.product.status="inactive"]
]){
 test(label+" fails closed",()=>{const x=fixture();mutate(x);assert.ok(shoppingReleaseFailures(x,now).length>0);});
}
