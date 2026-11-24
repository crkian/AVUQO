import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {cleanAwinDescription,privateAwinDescription,publicAwinDescription}
 from "../lib/awin/product-description-evidence.ts";
import {normalizePilotAwinFeed} from "../lib/awin/pilot-feed-normalizer.ts";
import {prepareGeneralBatch} from "../lib/feed-imports/general-awin-large.ts";
import {supplierKind,supplierNextAction,supplierSummary}
 from "../lib/awin/supplier-readiness.ts";
import {toFreshVerifiedAwinRaw} from "../lib/awin/private-live-canonical-stage.ts";

const digest="a".repeat(64);
const tracking="https://www.awin1.com/pclick.php?m=101445&a=3135746&p=sku1";
const prose="<p>Creative construction pieces for young builders, with illustrated instructions and a sturdy reusable box.</p>";
test("source description becomes clean factual private prose only",()=>{
 const clean=cleanAwinDescription("<script>alert('x')</script>"+prose);
 assert.match(clean,/Creative construction pieces/);
 assert.doesNotMatch(clean,/<|alert/);
 assert.equal(privateAwinDescription({description:prose}),cleanAwinDescription(prose));
 assert.equal(privateAwinDescription({description:"n/a"}),null);
 assert.equal(cleanAwinDescription("Short"),null);
 assert.equal(cleanAwinDescription("a".repeat(10001)),null);
});
test("Google retail projection preserves description before private import",()=>{
 const header=["advertiser_id","id","title","price","availability","aw_deep_link","brand",
  "description","structured_description","image_link"];
 const row=header.map(name=>({
  advertiser_id:"101445",id:"SKU-1",title:"Builder play set",price:"22.50 GBP",
  availability:"in_stock",aw_deep_link:tracking,brand:"PlayPress",description:prose,
  image_link:"https://example.com/product.jpg"
 })[name]??"");
 const result=normalizePilotAwinFeed("101445","F5142",header,[row]);
 assert.ok(result.header.includes("description"));
 const prepared=prepareGeneralBatch("101445","F5142",result.header,result.rows)[0];
 assert.equal(prepared.metadata.source_description,cleanAwinDescription(prose));
 assert.equal(prepared.metadata.source_description_rights_confirmed,false);
 assert.equal(prepared.metadata.source_description_verified_digest,null);
 assert.equal(prepared.status,"review");
});
test("public descriptions require explicit text rights and matching fresh source digest",()=>{
 const meta={source_description:prose,source_description_rights_confirmed:true,
  source_description_verified_digest:digest};
 assert.equal(publicAwinDescription({...meta,source_description_rights_confirmed:false},digest),null);
 assert.equal(publicAwinDescription(meta,"b".repeat(64)),null);
 assert.equal(publicAwinDescription(meta,"invalid"),null);
 assert.equal(publicAwinDescription(meta,digest),cleanAwinDescription(prose));
 const row={
  id:"row",import_id:"import",merchant_product_id:"SKU-1",title:"Builder play set",
  price:22.5,currency:"GBP",brand:"PlayPress",category:"Toys",image_url:null,
  status:"review",metadata:{
   ...meta,feed_id:"F5142",live_feed_digest:digest,
   live_feed_verified_at:new Date().toISOString(),
   live_feed_verification:"exact_authenticated_feed_digest_rechecked",
   tracking_link_verified:true,verified_awin_deep_link:tracking,
   availability:"in_stock",listing_kind:"physical_product"
  }
 };
 const denied=toFreshVerifiedAwinRaw({...row,metadata:{...row.metadata,
  source_description_rights_confirmed:false}},"101445","F5142",digest);
 assert.ok(denied);
 assert.equal(denied.description,null);
 const accepted=toFreshVerifiedAwinRaw(row,"101445","F5142",digest);
 assert.equal(accepted?.description,cleanAwinDescription(prose));
});
test("readiness distinguishes shop feeders from service and referral adapters",()=>{
 const stub={programme:"Sample",advertiser_id:"496",registry_status:"pending",
  observed_feeds:3,feeds_with_description_column:0,supplier_reported_items:100,
  refresh_flags:3,last_observation:null,private_rows:100,private_sample_rows:100,
  private_sample_descriptions:0,private_sample_rights_marked:0,last_private_import:null,
  active_products:30,active_described_products:0,published_candidates:15,
  held_candidates:15,product_description_rights_verified:false};
 assert.equal(supplierKind(stub),"Retail products");
 assert.match(supplierNextAction(stub),/description/);
 assert.equal(supplierKind({...stub,advertiser_id:"3496"}),"Travel booking");
 assert.match(supplierNextAction({...stub,advertiser_id:"3496"}),/adapter/);
 assert.match(supplierNextAction({...stub,observed_feeds:0,private_rows:0}),/Request authorised/);
 assert.deepEqual(supplierSummary([stub]),{accepted:1,withFeeds:1,imported:1,
  publishing:1,described:0,feedsWithDescriptionColumns:0});
});
test("read-only supplier dashboard is owner/admin gated and the SQL RPC stays service-role only",()=>{
 const page=readFileSync("app/control-centre/supplier-readiness/page.tsx","utf8");
 const sql=readFileSync("supabase/migrations/20261120201000_owner_avuqo_supplier_readiness.sql","utf8");
 const worker=readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
 const stage=readFileSync("lib/awin/private-live-canonical-stage.ts","utf8");
 assert.ok(page.indexOf("await requireControlCentreAccess()")<
  page.indexOf("createAdminClient()"));
 assert.match(page,/owner_avuqo_supplier_readiness_v1/);
 assert.match(sql,/security invoker/i);
 assert.match(sql,/revoke all on function public\.owner_avuqo_supplier_readiness_v1\(\) from public, anon, authenticated/i);
 assert.match(sql,/grant execute on function public\.owner_avuqo_supplier_readiness_v1\(\) to service_role/i);
 assert.doesNotMatch(sql,/\binsert into\b|\bupdate public\.|\bdelete from\b/i);
 assert.match(worker,/pmeta\.product_description_rights_verified===true/);
 assert.match(worker,/source_description_verified_digest:next\.metadata\.source_description\?digest:null/);
 assert.match(stage,/publicAwinDescription\(m,digest\)/);
 const links=readFileSync("lib/control-centre/workspaces.ts","utf8");
 assert.match(links,/\/control-centre\/supplier-readiness/);
});

test("full bounded source descriptions and private catalogue fields survive import without declaring a sale",()=>{
 const full="Detailed supplier product specification. ".repeat(100);
 assert.equal(cleanAwinDescription(full),full.trim());
 const header=["advertiser_id","id","title","price","availability","aw_deep_link","description","sale_price","color","size","shipping","product_detail","additional_image_link"];
 const fields={advertiser_id:"101445",id:"SKU-normal",title:"Regular price play set",price:"22.50 GBP",availability:"in_stock",aw_deep_link:tracking,description:full,color:"Blue",size:"Large",shipping:"Supplier terms",product_detail:"Material: card",additional_image_link:"https://example.com/a.jpg,https://example.com/b.jpg"};
 const normalized=normalizePilotAwinFeed("101445","F5142",header,[header.map(key=>fields[key]??"")]);
 const row=prepareGeneralBatch("101445","F5142",normalized.header,normalized.rows)[0];
 assert.equal(row.status,"review");
 assert.equal(row.metadata.source_description,full.trim());
 assert.equal(row.metadata.source_catalogue_fields.color,"Blue");
 assert.equal(row.metadata.source_catalogue_fields.size,"Large");
 assert.equal(row.metadata.source_catalogue_fields.sale_price,undefined);
 assert.equal(row.metadata.supplied_image_gallery.length,2);
 assert.equal(row.metadata.source_description_rights_confirmed,false);
 assert.equal(row.metadata.source_image_rights_confirmed,false);
});
test("oldest eligible private rechecks forward exact verified SKU cohorts to the canonical worker",()=>{
 const worker=readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
 assert.ok(worker.includes('.order("metadata->>live_feed_verified_at",{ascending:true,nullsFirst:true})'));
 assert.ok(worker.includes('verifiedSkus.push(old.merchant_product_id)'));
 assert.equal(worker.split("merchantProductIds:verifiedSkus").length-1,3);
 assert.ok(worker.includes("source_catalogue_fields:next.metadata.source_catalogue_fields"));
});
