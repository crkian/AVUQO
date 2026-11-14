import {chooseProductTemplate} from "../lib/products/templates.ts";
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {BROWSE_DEPARTMENTS} from "../lib/categories/browse-tree.ts";
import {DEPARTMENT_BLUEPRINTS,departmentBlueprint,eligibleDepartmentProduct,identifiedDepartment}
 from "../lib/products/department-showrooms.ts";
import {assessMarketingReadiness,MARKETING_CHANNEL_ROADMAP}
 from "../lib/marketing/launch-readiness.ts";
import {verifiedTyreSpec,eligibleTyreProducts,parseTyreSize,matchTyreSize,
 comparableTyreOffers,productUnitSubtotal,validTyreQuantity,tyreSpecLabel}
 from "../lib/tyres/verified-comparison.ts";
const file=p=>readFileSync(p,"utf8");
const eligible={product:{id:"product-a",slug:"approved-test-tyre",canonical_title:"Exact example tyre",
 brand:"Example",model:"X",product_type:"tyres",description:null,primary_image_url:null,status:"active",
 specifications:{tyre_specs_verified:true,tyre_width_mm:205,tyre_profile:55,tyre_rim_inches:16,
 load_index:91,speed_rating:"V",season:"summer",run_flat:false,xl:false}},
 offers:[{published:{category:"Tyres",image_url:null},offer:{price:123.45,total_price:null,id:"offer-a"}}]};
const noMarketing={
 system:{publishing_enabled:false,emergency_stop:true,ai_enabled:false},
 env:{live:false,worker:false,draftWorker:false,aiConfigured:false},
 brands:[],facts:[],posts:[],channels:[],rules:[],jobs:[],assets:[],placements:[]
};
test("Every curated department has a distinct product blueprint and prepared showroom route",()=>{
 assert.equal(BROWSE_DEPARTMENTS.length,25);
 assert.equal(DEPARTMENT_BLUEPRINTS.length,25);
 assert.equal(new Set(DEPARTMENT_BLUEPRINTS.map(x=>x.slug)).size,25);
 for(const d of BROWSE_DEPARTMENTS){
  const blueprint=departmentBlueprint(d.slug);
  assert.ok(blueprint,d.slug);
  assert.equal(blueprint.name,d.name);
  assert.equal(blueprint.checklist.length,3);
  if(blueprint.visual.startsWith("/editorial/")){
   assert.match(blueprint.visual,/^\/editorial\/[a-z-]+\.webp$/);
   assert.equal(readFileSync("public"+blueprint.visual).toString("ascii",8,12),"WEBP");
  }else assert.ok(blueprint.visual.startsWith("https://images.unsplash.com/"));
 }
 assert.equal(departmentBlueprint("fake"),undefined);
 assert.match(file("app/categories/[department]/products/page.tsx"),/verifiedProductIndex\(120\)/);
 assert.match(file("app/categories/[department]/products/page.tsx"),/robots:\{index:false,follow:true\}/);
 assert.match(file("lib/marketplace/journeys.ts"),/shop:"\/categories\/"\+department.slug\+"\/products"/);
});
test("No product is assigned to a department merely because its name mentions the category",()=>{
 const tech=departmentBlueprint("tech");
 assert.ok(eligibleDepartmentProduct(tech,{product:{product_type:"tech"},offers:[{published:{category:"Electronics"}}]}));
 assert.ok(!eligibleDepartmentProduct(tech,{product:{product_type:"general"},offers:[{published:{category:"Unverified other"}}]}));
 assert.equal(identifiedDepartment({product:{product_type:"general"},offers:[{published:{category:"unknown"}}]}),undefined);
 const best=identifiedDepartment({product:{product_type:"fashion"},offers:[{published:{category:"fashion"}}]});
 assert.equal(best?.slug,"fashion");
});
test("Tyre exact-spec admission requires independently verified load, speed and dimensions",()=>{
 assert.equal(tyreSpecLabel(verifiedTyreSpec(eligible.product)),"205/55 R16 91V");
 assert.equal(verifiedTyreSpec({...eligible.product,specifications:{...eligible.product.specifications,tyre_specs_verified:false}}),null);
 for(const key of ["load_index","speed_rating","tyre_profile"]){
  const specs={...eligible.product.specifications};delete specs[key];
  assert.equal(verifiedTyreSpec({...eligible.product,specifications:specs}),null,key);
 }
 const spec=verifiedTyreSpec(eligible.product);
 assert.equal(matchTyreSize(spec,parseTyreSize({width:"205",profile:"55",rim:"16"})),true);
 assert.equal(matchTyreSize(spec,parseTyreSize({width:"225",profile:"55",rim:"16"})),false);
 assert.equal(parseTyreSize({width:"205",profile:"55"}),null);
 assert.equal(parseTyreSize({width:"205.5",profile:"55",rim:"16"}),null);
 assert.equal(eligibleTyreProducts([eligible]).length,1);
 assert.equal(eligibleTyreProducts([{...eligible,product:{...eligible.product,specifications:{tyre_specs_verified:false}}}]).length,0);
});
test("Tyre cost is strictly product subtotal; no fitted or delivery amount is created",()=>{
 assert.equal(productUnitSubtotal(123.45,4),493.80);
 assert.equal(productUnitSubtotal(-1,4),null);
 assert.equal(validTyreQuantity("999"),4);
 assert.equal(validTyreQuantity("1"),1);
 const priced=comparableTyreOffers([eligible.offers[0],{
  published:{category:"Tyres"},offer:{price:90,total_price:150,id:"offer-b"}}]);
 assert.equal(priced[0].offer.id,"offer-b");
 const detail=file("app/tyres/products/[slug]/page.tsx");
 assert.match(detail,/Not the delivered or fitted total/);
 assert.match(detail,/verifiedTyreSpec/);
 assert.match(detail,/verifiedProduct/);
 assert.doesNotMatch(detail,/feed_import_records|estimated_fitted_cost|fake/);
});
test("Tyre buyer journeys are real and still empty until approved products arrive",()=>{
 for(const path of ["app/tyres/find/page.tsx","app/tyres/compare/page.tsx",
  "app/tyres/products/[slug]/page.tsx"]){
  assert.match(file(path),/verifiedProduct(Index)?|verifiedTyreSpec/);
  assert.match(file(path),/robots:\{index:false,follow:true\}/);
  assert.doesNotMatch(file(path),/£269|£99\.99|load_index_candidate/);
 }
 assert.match(file("app/tyres/page.tsx"),/href="\/tyres\/find"/);
 assert.match(file("app/tyres/brands/[slug]/page.tsx"),/tyres\/find\?brand/);
});
test("Marketing preflight remains stopped with real absent channels and global emergency stop",()=>{
 const health=assessMarketingReadiness(noMarketing);
 assert.equal(health.state,"stopped");
 assert.equal(health.brands.length,4);
 assert.ok(health.brands.every(x=>!x.deliveryReady));
 assert.equal(health.manualPinterestSupported,false);
 assert.equal(MARKETING_CHANNEL_ROADMAP.find(x=>x.name==="Pinterest")?.state,"creative brief only");
 assert.ok(health.globalReasons.some(x=>x.includes("emergency stop")));
});
test("Marketing preflight needs verified channel + current fact + post + independent switches",()=>{
 const x={
 ...noMarketing,system:{publishing_enabled:true,emergency_stop:false,ai_enabled:false},
 env:{live:true,worker:true,draftWorker:false,aiConfigured:false},
 brands:[{slug:"avuqo",name:"AVUQO",publishing_enabled:true,ai_enabled:false}],
 facts:[{brand_slug:"avuqo",status:"approved",expires_at:null}],
 posts:[{brand_slug:"avuqo",status:"approved",kind:"social",platform:"instagram",source_fact_id:"fact-a"}],
 channels:[{brand_slug:"avuqo",platform:"instagram",connection_state:"verified",publishing_enabled:true,buffer_channel_id:"channel-a"}],
 assets:[],
 };
 const notReady=assessMarketingReadiness(x);
 assert.equal(notReady.brands[0].deliveryReady,false);
 const ready=assessMarketingReadiness({...x,assets:[{brand_slug:"avuqo",status:"approved",rights_note:"Photographer permission confirmed"}]});
 assert.equal(ready.brands[0].deliveryReady,true);
 const stopped=assessMarketingReadiness({...x,system:{...x.system,emergency_stop:true}});
 assert.equal(stopped.brands[0].deliveryReady,false);
 const stranded=assessMarketingReadiness({...x,
  posts:[{...x.posts[0],platform:"facebook"}]});
 assert.equal(stranded.brands[0].deliveryReady,false);
});
test("Marketing and tyre owner dashboards are role-protected, read-only and use existing system",()=>{
 for(const path of ["app/control-centre/marketing/readiness/page.tsx","app/control-centre/tyres/page.tsx"]){
  const s=file(path);
  assert.match(s,/requireControlCentreAccess\(\)/);
  assert.match(s,/robots:\{index:false,follow:false\}/);
  assert.doesNotMatch(s,/\.insert\(|\.update\(|\.delete\(|\.upsert\(/);
 }
 const nav=file("lib/control-centre/workspaces.ts");
 assert.match(nav,/\/control-centre\/tyres/);
 assert.match(nav,/\/control-centre\/marketing\/readiness/);
 const marketing=file("app/control-centre/marketing/readiness/page.tsx");
 assert.match(marketing,/MARKETING_CHANNEL_ROADMAP/);
 assert.match(marketing,/site-advertising/);
});

test("all 25 departments have distinct editorial visuals and matching item guidance",()=>{
 const visuals=DEPARTMENT_BLUEPRINTS.map(d=>d.visual.split("?")[0]);
 assert.equal(new Set(visuals).size,25);
 const headings=DEPARTMENT_BLUEPRINTS.map(d=>{
  const item={product:{product_type:d.slug,canonical_title:"Fixture"},offers:[]};
  const presentation=chooseProductTemplate(item.product,item.offers);
  assert.equal(presentation.department?.slug,d.slug);
  assert.equal(DEPARTMENT_BLUEPRINTS.filter(category=>eligibleDepartmentProduct(category,item)).length,1);
  return presentation.groupHeading;
 });
 assert.equal(new Set(headings).size,25);
});

test("structured labels keep ambiguous and misclassified items off the wrong shelf",()=>{
 const fixture=(type,...categories)=>({
  product:{product_type:type,canonical_title:"Generic item"},
  offers:categories.map(category=>({published:{category}})),
 });
 const cases=[
  [fixture("cat food","Pets > Cat food"),"pets","pets"],
  [fixture("smartwatch","Electronics > Wearables"),"tech","tech"],
  [fixture("phone accessories"),"tech","tech"],
  [fixture("product","Toys & Games › Board games"),"toys-games","general"],
  [fixture("product","Motoring > Tyres"),"motoring","tyres"],
  [fixture("product","Sports & Fitness > Bicycle tyres"),"sports-fitness","general"],
  [fixture("cat food","Groceries"),undefined,"general"],
  [fixture("product","Home","Tech"),undefined,"general"],
  [fixture("unspecified"),undefined,"general"],
 ];
 for(const [item,slug,template] of cases){
  assert.equal(identifiedDepartment(item)?.slug,slug);
  assert.deepEqual(DEPARTMENT_BLUEPRINTS.filter(category=>eligibleDepartmentProduct(category,item)).map(d=>d.slug),slug?[slug]:[]);
  assert.equal(chooseProductTemplate(item.product,item.offers).template,template);
 }
 const context=fixture("product","Tech > Headphones");
 assert.equal(chooseProductTemplate(context.product,context.offers).specPriority[0],"noise_cancellation");
 const laundry=fixture("washing machine","Home");
 assert.equal(chooseProductTemplate(laundry.product,laundry.offers).specPriority[0],"installation_type");
 const wrongLeaf=fixture("tech","Tech > Washing machine");
 assert.equal(chooseProductTemplate(wrongLeaf.product,wrongLeaf.offers).specPriority[0],"model");
 const nameOnly=fixture("product");
 nameOnly.product.canonical_title="Headphones";
 assert.equal(chooseProductTemplate(nameOnly.product,nameOnly.offers).template,"general");
});
