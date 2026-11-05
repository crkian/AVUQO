/**
 * AVUQO visual QA, limited to local CI preview, never production.
 * Captures responsive screenshots and checks that key public journeys render.
 * Results are artifacts for owner visual acceptance against docs/design/mockups.
 */
import {chromium} from "playwright";
import {mkdir,readdir,writeFile} from "node:fs/promises";
import path from "node:path";
import {BROWSE_DEPARTMENTS,departmentHref} from "../lib/categories/browse-tree.ts";

const origin=process.env.VISUAL_BASE_URL??"http://127.0.0.1:3000";
const out=process.env.VISUAL_OUTPUT_DIR??"artifacts/visual-review";
const viewports=[
 {label:"desktop",width:1440,height:900},
 {label:"landscape",width:1024,height:768},
 {label:"tablet",width:768,height:1024},
 {label:"mobile-large",width:430,height:932},
 {label:"mobile",width:390,height:844},
 {label:"mobile-small",width:375,height:812},
 {label:"narrow",width:320,height:740},
];
const pages=[
 {slug:"homepage",url:"/"},
 {slug:"christmas",url:"/christmas"},
 {slug:"easter",url:"/easter"},
 {slug:"valentines",url:"/valentines"},
 {slug:"black-friday",url:"/black-friday"},
 {slug:"sales",url:"/sales"},
 {slug:"live-deals",url:"/live"},
 {slug:"compare",url:"/compare"},
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

const publicPages=(await readdir("app",{recursive:true}))
  .filter(file=>file.endsWith("/page.tsx")&&!file.includes("[")&&!/^(control-centre|preview)\//.test(file))
  .map(file=>"/"+file.slice(0,-"/page.tsx".length)).sort();
for (const url of [...publicPages,...BROWSE_DEPARTMENTS.map(departmentHref)]) {
  if (!pages.some(page=>page.url.split("?")[0]===url)) pages.push({slug:url.slice(1).replaceAll("/","-"),url});
}

/* External source images may fail independently; record but don't present
   them as product evidence or mark product data as trusted by this smoke test. */
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.VISUAL_CHROMIUM_PATH});
const report=[];
let failures=0;
try{
 for(const viewport of viewports){
  const context=await browser.newContext({
    viewport:{width:viewport.width,height:viewport.height},
    colorScheme:"light",reducedMotion:"reduce",locale:"en-GB",
    deviceScaleFactor:1,hasTouch:viewport.width<=768,
  });
  for(const pageInfo of pages){
    const page=await context.newPage();
    const entry={route:pageInfo.url,viewport:viewport.label,width:viewport.width,
      status:0,h1:"",overflow:0,links:0,errors:[]};
    const consoleErrors=[];
    const failedImages=new Set();
    page.on("requestfailed",request=>{if(request.resourceType()==="image")failedImages.add(request.url())});
    page.on("response",response=>{if(response.status()>=400&&response.request().resourceType()==="image")failedImages.add(response.url())});
    page.on("pageerror",error=>consoleErrors.push(error.message.slice(0,250)));
    try{
      const response=await page.goto(origin+pageInfo.url,{
        waitUntil:"domcontentloaded",timeout:40000,
      });
      entry.status=response?.status()??0;
      // Keep consent functional on the real website. Dismiss optional cookies
      // in this isolated screenshot context so the page layout remains visible.
      const rejectConsent=page.getByRole("button",{name:"Reject optional"});
      if(await rejectConsent.count()){
        await rejectConsent.click({timeout:3000}).catch(()=>{});
      }
      await page.locator("main h1").first().waitFor({state:"visible",timeout:12000});
      await page.evaluate(async () => {
        for(let y=0;y<document.documentElement.scrollHeight;y+=Math.max(300,innerHeight-100)){
          window.scrollTo(0,y);
          await new Promise(resolve=>requestAnimationFrame(resolve));
        }
        await Promise.allSettled([...document.images].map(image=>image.decode()));
        window.scrollTo(0,0);
      });
      entry.h1=(await page.locator("h1").first().textContent({timeout:6500}).catch(()=>""))?.trim()??"";
      const metrics=await page.evaluate(()=>({
        documentWidth:document.documentElement.scrollWidth,
        viewportWidth:window.innerWidth,
        links:document.querySelectorAll("a[href]").length,
      }));
      entry.overflow=Math.max(0,metrics.documentWidth-metrics.viewportWidth);
      entry.links=metrics.links;
      entry.errors=consoleErrors.slice(0,5);
      // Structural guardrails catch visual regressions that HTTP 200 alone misses.
      // They are not a claim of pixel-exact similarity to the concept artwork.
      const layout=await page.evaluate(()=>{
        const header=document.querySelector("header.header");
        const main=document.querySelector("main");
        const title=main?.querySelector("h1");
        const hero=title?.closest("section")??main?.querySelector("section");
        const rect=hero?.getBoundingClientRect();
        return {
          headerHeight:Math.round(header?.getBoundingClientRect().height??0),
          heroHeight:Math.round(rect?.height??0),
          headingVisible:!!title&&title.getBoundingClientRect().height>0,
          hasHeader:!!header,
          hasMain:!!main,
          imageCount:document.images.length,
          missingImages:[...document.images].filter(img=>img.complete&&img.naturalWidth===0)
            .map(img=>img.currentSrc||img.src).slice(0,5),
          categoryLinks:[...document.querySelectorAll("a[href]")]
            .filter(link=>["/tech","/home","/beauty","/groceries"].includes(link.getAttribute("href"))).length,
        };
      });
      entry.layout=layout;
      entry.warnings=[];
      if(layout.missingImages.length)entry.warnings.push(`Unloaded image resources: ${layout.missingImages.length}`);
      if(!layout.hasMain||(!layout.hasHeader&&pageInfo.url!=="/unauthorized")||!layout.headingVisible)
        entry.errors.push("Page landmarks missing or heading hidden");
      if(viewport.label==="desktop" && layout.headerHeight>170)
        entry.errors.push(`Desktop header too tall: ${layout.headerHeight}px`);
      if(viewport.label==="desktop"&&["/","/christmas","/tech","/home","/beauty"].includes(pageInfo.url)
         &&(layout.heroHeight<210||layout.heroHeight>760))
        entry.errors.push(`Hero outside editorial reference envelope: ${layout.heroHeight}px`);
      if(pageInfo.url==="/"&&layout.categoryLinks<3)
        entry.errors.push("Homepage department journeys are missing");
      await page.screenshot({path:path.join(out,`${pageInfo.slug}-${viewport.label}.jpg`),
        fullPage:true,animations:"disabled",type:"jpeg",quality:78,timeout:20000});
      entry.failedImages=[...failedImages];
      entry.errors.push(...consoleErrors.filter(error=>!entry.errors.includes(error)));
      if(viewport.width<=1000&&pageInfo.url==="/"){
        try {
          const trigger=page.getByRole("button",{name:"Open navigation"});
          if(viewport.width<=768)await trigger.tap();
          else await trigger.click();
          const dialog=page.getByRole("dialog");
          await dialog.waitFor({state:"visible"});
          const categories=dialog.getByRole("button",{name:"Categories"});
          await categories.focus();
          await categories.press("Enter");
          await dialog.getByRole("button",{name:"Technology & Electronics"}).click();
          await dialog.getByRole("link",{name:"Audio & Hi-Fi"}).waitFor({state:"visible"});
          await page.screenshot({path:path.join(out,`menu-categories-${viewport.label}.jpg`),type:"jpeg",quality:82});
          await dialog.getByRole("button",{name:"Back to categories"}).click();
          await dialog.getByRole("button",{name:"Back to main menu"}).click();
          if(!await dialog.getByRole("link",{name:"Watches"}).isVisible())throw new Error("Watches missing");
          if(await page.evaluate(()=>document.activeElement?.id)!=="avuqo-mobile-title")throw new Error("Focus not in menu");
          await page.keyboard.press("Escape");
          await dialog.waitFor({state:"hidden"});
          if(!await trigger.evaluate(element=>element===document.activeElement))throw new Error("Focus did not return to trigger");
          if(await trigger.getAttribute("aria-expanded")!=="false")throw new Error("Trigger remained expanded");
          if(viewport.width<=760){
            const dock=page.getByRole("navigation",{name:"Mobile quick navigation"});
            const labels=await dock.getByRole("link").allTextContents();
            if(labels.join(",")!=="Home,Saved,Lists,Account")throw new Error("Unexpected mobile dock links");
            if(await dock.getByRole("link",{name:"Home"}).getAttribute("aria-current")!=="page")throw new Error("Home not marked current");
            await dock.getByRole("link",{name:"Saved"}).click();
            await page.waitForURL(url=>url.pathname==="/saved");
            await page.goBack();
            await page.waitForURL(url=>url.pathname==="/");
          }
          entry.mobileMenu="Menu drill-down, Back, Escape, focus return and available dock verified";
        } catch(error) {
          entry.errors.push("Mobile navigation: "+(error instanceof Error?error.message.slice(0,210):String(error)));
        }
      }
      if(pageInfo.url==="/"){
        try{
          const search=page.locator("form.header-search input[name=q]").first();
          if(!await search.isVisible())throw new Error("Header search input not visible");
          await search.fill("laptops");
          await search.press("Enter");
          await page.waitForURL(url=>url.pathname==="/search"&&url.searchParams.get("q")==="laptops",{timeout:12000});
          const resultTitle=await page.locator("main h1").first().textContent({timeout:12000});
          if(!resultTitle?.toLowerCase().includes("laptops"))
            entry.errors.push("Search did not show the requested term");
          else entry.searchNavigation="Header form submit passed";
        }catch(error){
          entry.errors.push("Search journey failed: "+(error instanceof Error?error.message.slice(0,150):String(error)));
        }
      }
      if(entry.status>=400 || entry.status===0 || !entry.h1 || entry.overflow>4 || entry.errors.length>0){
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
      <figure><figcaption>Rendered desktop (1440px)</figcaption><div class="image-area"><img loading="lazy" src="${slug}-desktop.jpg" alt="Rendered desktop for ${slug}"></div></figure>
    </div>
    ${viewports.slice(1).map(({label,width})=>`<details><summary>View ${label} screenshot (${width}px)</summary><img class="mobile" loading="lazy" src="${slug}-${label}.jpg" alt="Rendered ${label} for ${slug}"></details>`).join("")}
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
