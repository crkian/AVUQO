import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 advertiserIdValid,nameValid,evidenceRef,validFuture,
 advertisersFromMetadata,releaseIssues
} from "../lib/awin/advertiser-onboarding.ts";

const now=Date.parse("2026-11-04T11:05:00Z");
const source={id:"11111111-1111-4111-8111-111111111111",status:"active",sync_enabled:true,
 credential_status:"ready",source_type:"affiliate_network",connector_key:"awin",
 metadata:{usage_rights_confirmed:true,rights_evidence_ref:"signed-network-contract-2026",
  feed_permission_confirmed:true,feed_evidence_ref:"approved-feed-rights-2026",
  allowed_territories:["GB"],rights_valid_until:"2027-12-31",
  publication_permission:"verified",price_evidence_status:"verified",
  awin_advertisers:[{advertiser_id:"12345",advertiser_name:"Approved test merchant",
   feed_permission_confirmed:true,approval_evidence_ref:"merchant-approval-12345",
   allowed_territory:"GB",valid_until:"2027-12-31"}]}};
const sample={source,advertiserId:"12345",envConfigured:true,
 controls:{emergencyStop:false,ingestion:true,publishing:true},
 offer:{source_id:source.id,product_id:"22222222-2222-4222-8222-222222222222",
  status:"active",price:49.99,currency:"GBP",
  affiliate_url:"https://merchant.example/awin/approved",source_url:"https://merchant.example/product",
  stock_status:"in_stock",last_seen_at:"2026-11-04T10:30:00Z",match_confidence:94,
  merchantExternalId:"12345"},
 product:{id:"22222222-2222-4222-8222-222222222222",slug:"approved-product-123",status:"active"},
 score:{score:77,confidence:83,calculated_at:"2026-11-04T10:31:00Z"},now};
const text=path=>readFileSync(path,"utf8");
test("Awin advertiser is numeric programme ID, not a publisher secret or retailer name",()=>{
 for(const x of ["1","-100","publisher_123","12345?token=abc",""])assert.equal(advertiserIdValid(x),false);
 assert.equal(advertiserIdValid("12345"),true);
 assert.equal(nameValid("Approved UK retailer"),true);
 assert.equal(nameValid("x"),false);
});
test("owner evidence requires real references and current expiry",()=>{
 for(const x of ["", "short", "https://user:pass@merchant.example/contract",
  "http://merchant.example/contract","https://merchant.example/contract?token=abc",
  "Bearer sensitive-token-value","api_key=secret-value"])assert.equal(evidenceRef(x),false);
 assert.equal(evidenceRef("https://merchant.example/terms"),true);
 assert.equal(evidenceRef("internal-programme-acceptance-2026"),true);
 assert.equal(validFuture("2027-12-31",now),true);
 assert.equal(validFuture("2025-01-01",now),false);
 assert.equal(advertisersFromMetadata(source.metadata)[0].advertiser_id,"12345");
});
test("manual release accepts only a current matching approved offer",()=>{
 assert.deepEqual(releaseIssues(sample),[]);
 assert.ok(releaseIssues({...sample,advertiserId:"98765"}).length);
 assert.ok(releaseIssues({...sample,offer:{...sample.offer,merchantExternalId:"55555"}}).length);
 assert.ok(releaseIssues({...sample,offer:{...sample.offer,affiliate_url:null}}).length);
 assert.ok(releaseIssues({...sample,offer:{...sample.offer,last_seen_at:"2026-10-01T10:00:00Z"}}).length);
 assert.ok(releaseIssues({...sample,offer:{...sample.offer,stock_status:"unknown"}}).length);
 assert.ok(releaseIssues({...sample,score:{...sample.score,score:30}}).length);
 assert.ok(releaseIssues({...sample,controls:{...sample.controls,emergencyStop:true}}).length);
 assert.ok(releaseIssues({...sample,source:{...source,status:"paused"}}).length);
 assert.ok(releaseIssues({...sample,source:{...source,metadata:{...source.metadata,price_evidence_status:"pending"}}}).length);
});
test("pipeline only stages Awin and rejects cross-merchant records",()=>{
 const code=text("lib/pipeline/run.ts");
 assert.match(code,/source\.connector_key !== "awin" && \/\/ Every Awin offer requires separate owner release/);
 assert.match(code,/raw\.merchantExternalId !== process\.env\.AWIN_ADVERTISER_ID/);
});
test("public catalogue requires owner approval, unchanged price, score and time",()=>{
 const code=text("lib/products/public-catalog.ts");
 for(const pattern of [/awin_offer_release_reviews/,/approval\.status!=="approved"/,/approval\.advertiser_id!==process\.env\.AWIN_ADVERTISER_ID/,/reviewed_offer_at/,/reviewed_score_at/,/reviewed_price/,/!isHttps\(offer\.affiliate_url\)/])assert.match(code,pattern);
});
test("Awin permissions and release actions require authenticated owner, not public clients",()=>{
 const a=text("app/control-centre/awin-advertisers/actions.ts");
 assert.match(a,/if\(actor\.role!=="owner"\)/);
 assert.doesNotMatch(a,/await db\.auth\.getUser\(\)/); // Central trusted role guard.
 assert.match(a,/requireControlCentreAccess\(\)/);
 assert.match(a,/await awinConnector\.fetchOffers\(\{limit:3\}\)/);
 assert.match(a,/record_awin_owner_release/);
 assert.match(a,/status:"paused",sync_enabled:false/);
});
test("database release function is transactional and inaccessible to anon/auth REST",()=>{
 const sql=text("supabase/migrations/20261104112500_awin_offer_owner_release.sql");
 assert.match(sql,/security invoker/i);
 assert.match(sql,/revoke all on public\.awin_offer_release_reviews, public\.awin_release_audit/i);
 assert.match(sql,/grant execute on function public\.record_awin_owner_release[\s\S]+to service_role/i);
 assert.match(sql,/reviewed_offer_at=p_reviewed_offer_at/);
 assert.match(sql,/on conflict\(offer_id\)/);
 assert.match(sql,/insert into public\.awin_release_audit/);
 assert.doesNotMatch(sql,/truncate|delete from public\.offers/i);
});
