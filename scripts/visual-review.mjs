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
        const button=page.getByRole("button",{name:"Open navigation"});
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
console.log(`Visual checks: ${report.length-failures}/${report.length} passed`);
if(failures)process.exitCode=1;
