/**
 * AVUQO visual QA, limited to local CI preview, never production.
 * Captures responsive screenshots and checks that key public journeys render.
 * Results are artifacts for owner visual acceptance against docs/design/mockups.
 */
import {chromium} from "playwright";
import {mkdir,writeFile} from "node:fs/promises";
import path from "node:path";

const origin=process.env.VISUAL_BASE_URL??"http://127.0.0.1:3000";
const out=process.env.VISUAL_OUTPUT_DIR??"artifacts/visual-review";
const viewports=[
 {label:"desktop",width:1440,height:900},
 {label:"mobile",width:390,height:844},
];
const pages=[
 {slug:"homepage",url:"/"},
 {slug:"christmas",url:"/christmas"},
 {slug:"easter",url:"/easter"},
 {slug:"valentines",url:"/valentines"},
 {slug:"black-friday",url:"/black-friday"},
 {slug:"sales",url:"/sales"},
 {slug:"technology",url:"/tech"},
 {slug:"home-living",url:"/home"},
 {slug:"beauty",url:"/beauty"},
 {slug:"fashion",url:"/fashion"},
 {slug:"travel",url:"/travel"},
 {slug:"shopping",url:"/shopping"},
 {slug:"categories",url:"/categories"},
 {slug:"products",url:"/products"},
 {slug:"search",url:"/search?q=laptops"},
 {slug:"discover",url:"/discover"},
 {slug:"groceries",url:"/groceries"},
 {slug:"account",url:"/account"},
 {slug:"saved",url:"/saved"},
 {slug:"watches",url:"/watches"},
 {slug:"lists",url:"/lists"},
 {slug:"wishlist",url:"/wishlist"},
 {slug:"basket",url:"/basket"},
];

/* External source images may fail independently; record but don't present
   them as product evidence or mark product data as trusted by this smoke test. */
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const report=[];
let failures=0;
try{
 for(const viewport of viewports){
  const context=await browser.newContext({
    viewport:{width:viewport.width,height:viewport.height},
    colorScheme:"light",reducedMotion:"reduce",locale:"en-GB",
    deviceScaleFactor:1,
  });
  for(const pageInfo of pages){
    const page=await context.newPage();
    const entry={route:pageInfo.url,viewport:viewport.label,width:viewport.width,
      status:0,h1:"",overflow:0,links:0,errors:[]};
    const consoleErrors=[];
    page.on("pageerror",error=>consoleErrors.push(error.message.slice(0,250)));
    try{
      const response=await page.goto(origin+pageInfo.url,{
        waitUntil:"domcontentloaded",timeout:40000,
      });
      entry.status=response?.status()??0;
      await page.waitForTimeout(650);
      entry.h1=(await page.locator("h1").first().textContent({timeout:6500}).catch(()=>""))?.trim()??"";
      const metrics=await page.evaluate(()=>({
        documentWidth:document.documentElement.scrollWidth,
        viewportWidth:window.innerWidth,
        links:document.querySelectorAll("a[href]").length,
      }));
      entry.overflow=Math.max(0,metrics.documentWidth-metrics.viewportWidth);
      entry.links=metrics.links;
      entry.errors=consoleErrors.slice(0,5);
      if(viewport.label==="mobile"&&pageInfo.url==="/"){
        const button=page.locator("button.mobile-menu-toggle"); // Stable element: accessible label changes on toggle.
        if(await button.count()){
          await button.click();
          const expanded=await button.getAttribute("aria-expanded");
          if(expanded!=="true"){
            entry.errors.push("Mobile menu did not open on click");
          }
          await button.click();
          if(await button.getAttribute("aria-expanded")!=="false"){
            entry.errors.push("Mobile menu did not close on click");
          }
        }else{
          entry.errors.push("Mobile menu button missing");
        }
      }
      await page.screenshot({path:path.join(out,`${pageInfo.slug}-${viewport.label}.png`),
        fullPage:true,animations:"disabled"});
      if(entry.status>=400 || !entry.h1 || entry.overflow>4 || entry.errors.some(error=>error.startsWith("Mobile menu"))){
        failures++;
        console.error("FAIL",JSON.stringify(entry));
      }else{
        console.log("PASS",JSON.stringify({route:entry.route,viewport:entry.viewport,h1:entry.h1,overflow:entry.overflow}));
      }
    }catch(error){
      failures++;
      entry.errors.push(error instanceof Error?error.message:String(error));
      console.error("FAIL",JSON.stringify(entry));
    }finally{
      report.push(entry);
      await page.close();
    }
  }
  await context.close();
 }
}finally{await browser.close();}
await writeFile(path.join(out,"report.json"),JSON.stringify({origin,failures,total:report.length,pages:report},null,2));

/* The design files are checked out separately by the visual-review workflow.
   This offline HTML comparison keeps reference imagery out of the public app.
   Concept screenshots include fictional products and are NOT live data. */
const referenceMap=[
 ["homepage","full-storefront-and-navigation-concept.png","Storefront, hero and shopping tools"],
 ["christmas","seasonal-christmas.png","Christmas is the only active annual homepage campaign"],
 ["technology","category-tech.png","Eight topics, buying guidance and public verified shelf"],
 ["home-living","category-home-and-living.png","Home editorial photography and grid"],
 ["beauty","category-beauty.png","Beauty category and verified shelf"],
 ["account","account-profile-screen-crop.png","Private account overview; never fake metrics"],
 ["saved","saved-items-screen-crop.png","Saved items; prices are historical snapshots"],
 ["watches","watches-screen-crop.png","Watches do not imply live alerts"],
 ["lists","shared-lists-screen-crop.png","Authenticated list records"],
 ["easter","seasonal-easter.png","Dormant seasonal route"],
 ["valentines","seasonal-valentines.png","Dormant seasonal route"],
 ["black-friday","seasonal-black-friday.png","Dormant homepage campaign"],
 ["sales","seasonal-sales.png","Standalone editorial season only"],
 ["products","product-profile-page-set.png","Composition guide; no synthetic product data"],
 ["groceries","homepage-groceries-travel-profile-reference.png","Composite guide for groceries"],
 ["travel","homepage-groceries-travel-profile-reference.png","Composite guide for travel"],
 ["discover","full-storefront-and-navigation-concept.png","General discovery composition"],
];

/** Paths below are fixed repository names, not user input. */
const compareCards=referenceMap.map(([slug,reference,notes])=>`
  <section class="comparison" id="${slug}">
    <h2>${slug.replaceAll("-"," ")} <small>${notes}</small></h2>
    <div class="panels">
      <figure><figcaption>Approved design reference</figcaption><div class="image-area"><img loading="lazy" src="reference/${reference}" alt="Reference design for ${slug}"></div></figure>
      <figure><figcaption>Rendered desktop (1440px)</figcaption><div class="image-area"><img loading="lazy" src="${slug}-desktop.png" alt="Rendered desktop for ${slug}"></div></figure>
    </div>
    <details><summary>View mobile screenshot (390px)</summary><img class="mobile" loading="lazy" src="${slug}-mobile.png" alt="Rendered mobile for ${slug}"></details>
  </section>`).join("\n");

const compareHtml=`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>AVUQO visual implementation review</title>
<style>
:root{font-family:system-ui,"Segoe UI",Arial,sans-serif;color:#21132f;background:#f8f2ed}
*{box-sizing:border-box}body{margin:0}.header{position:sticky;top:0;background:#fffdf9;padding:18px 24px;box-shadow:0 4px 22px #21132f1c;z-index:3}
h1{margin:0;font-size:24px}p{max-width:980px;color:#55455f;line-height:1.5;font-size:13px}
nav{display:flex;gap:7px;flex-wrap:wrap}nav a{padding:7px 11px;background:#f0e7f6;border-radius:999px;color:#613c9f;font-size:12px;text-decoration:none}
main{padding:22px;max-width:1600px;margin:auto}.comparison{scroll-margin-top:160px;background:#fffdf9;border:1px solid #e6dce6;border-radius:18px;padding:18px;margin-bottom:24px}
h2{margin:0 0 14px;text-transform:capitalize;font-size:20px}h2 small{font-weight:400;font-size:12px;color:#6f6073;display:block;margin-top:4px}
.panels{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0;min-width:0}figcaption{font-size:13px;font-weight:800;padding:10px}
.image-area{height:66vh;overflow:auto;border:1px solid #e4dbe5;background:#eee8ec;border-radius:10px}.image-area img{display:block;width:100%;height:auto}
summary{cursor:pointer;color:#6037a0;font-weight:700;padding:12px}.mobile{width:min(390px,100%);height:auto;display:block;border:1px solid #ded2e5;border-radius:8px}
@media(max-width:820px){.panels{grid-template-columns:1fr}.image-area{height:55vh}.header{position:static}}
</style></head><body><div class="header"><h1>AVUQO: original designs vs rendered pages</h1>
<p>Offline comparison of GitHub CI screenshots with the 5 Nov 2026 design pack. Mockup figures and logos are illustrative, not verified stock, prices or live AVUQO account data. Visual likeness still needs owner approval.</p>
<nav>${referenceMap.map(([slug])=>`<a href="#${slug}">${slug.replaceAll("-"," ")}</a>`).join("")}</nav></div><main>${compareCards}</main></body></html>`;
await writeFile(path.join(out,"compare.html"),compareHtml);

console.log(`Visual checks: ${report.length-failures}/${report.length} passed`);
if(failures)process.exitCode=1;
