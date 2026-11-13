#!/usr/bin/env node
/**
 * AVUQO read-only production visual capture.
 * CI only. Captures public routes without logging in, interacting with commerce,
 * disclosing credentials or changing any backend records.
 */
import {mkdir,writeFile} from "node:fs/promises";
import {join} from "node:path";
import puppeteer from "puppeteer-core";

export const PUBLIC_ROUTES = [
 "/","/discover","/marketplace","/marketplace/compare","/shopping",
 "/categories","/tech","/home","/beauty","/fashion","/toys","/pets","/gifts",
 "/sales","/black-friday","/easter","/valentines","/christmas",
 "/products","/travel","/groceries",
 "/tyres","/tyres/find","/tyres/compare",
 "/saved","/watches","/lists","/account"
];
const BASE="https://www.avuqo.com";
const VIEWPORTS={
 desktop:{width:1440,height:900,deviceScaleFactor:1,isMobile:false,hasTouch:false},
 mobile:{width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true}
};
const output=process.env.VISUAL_AUDIT_DIR||"visual-audit-output";
const results=[];
const escapeMd=v=>String(v).replaceAll("|","\\|").replaceAll("\n"," ");
const safeName=p=>p==="/"
 ?"home"
 :p.replace(/^\//,"").replaceAll("/","-");
await mkdir(output,{recursive:true});
const browser=await puppeteer.launch({
 executablePath:process.env.CHROME_BIN||"/usr/bin/google-chrome",
 headless:true,
 args:["--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--hide-scrollbars"],
 defaultViewport:VIEWPORTS.desktop
});
try{
 for(const [device,viewport] of Object.entries(VIEWPORTS)){
  const page=await browser.newPage();
  await page.setViewport(viewport);
  await page.setDefaultNavigationTimeout(40000);
  await page.setExtraHTTPHeaders({"DNT":"1"});
  for(const path of PUBLIC_ROUTES){
   const expected=new URL(path,BASE);
   const file=join(output,device+"-"+safeName(path)+".png");
   const entry={path,device,status:null,title:"",h1:"",overflowPx:0,brokenImages:0,renderError:null,screenshot:file,deployment:null};
   const pageErrors=[];
   const onError=e=>{if(pageErrors.length<4)pageErrors.push(String(e.message||e).slice(0,180));};
   page.on("pageerror",onError);
   try{
    const response=await page.goto(expected.href,{waitUntil:"domcontentloaded",timeout:40000});
    entry.status=response?.status()??null;
    const finalUrl=new URL(page.url());
    if(finalUrl.hostname!==expected.hostname)throw new Error("Unexpected cross-domain redirect");
    // Wait briefly for imagery, without waiting indefinitely for third-party sources.
    await Promise.race([page.evaluate(()=>document.fonts.ready),new Promise(resolve=>setTimeout(resolve,2500))]);
    await new Promise(resolve=>setTimeout(resolve,750));
    const info=await page.evaluate(()=>{
     const html=document.documentElement;
     const h1=document.querySelector("h1");
     const images=[...document.querySelectorAll("img")];
     return {
      title:document.title,
      h1:h1?.textContent?.trim().slice(0,150)??"",
      overflowPx:Math.max(0,html.scrollWidth-html.clientWidth),
      brokenImages:images.filter(im=>im.complete&&im.naturalWidth===0&&!im.hidden).length,
      deployment:html.getAttribute("data-dpl-id"),
      bodyHeight:document.body.scrollHeight
     };
    });
    Object.assign(entry,info);
    if(info.bodyHeight>15000)entry.renderError="Very tall page, inspect screenshot and layout";
    await page.screenshot({path:file,fullPage:info.bodyHeight<=15000,animations:"disabled",timeout:20000});
    if(pageErrors.length)entry.renderError=(entry.renderError?entry.renderError+"; ":"")+"JS: "+pageErrors.join(" / ");
   }catch(e){entry.renderError=String(e.message??e).slice(0,350)}
   page.off("pageerror",onError);
   results.push(entry);
   process.stdout.write(device+" "+path+" HTTP "+entry.status+" overflow="+entry.overflowPx+" broken="+entry.brokenImages+(entry.renderError?" ISSUE":"")+"\n");
  }
  await page.close();
 }
}finally{await browser.close();}
const issues=results.filter(r=>r.status!==200||!r.h1||r.overflowPx>8||r.brokenImages>0||r.renderError);
const deploymentIds=[...new Set(results.map(r=>r.deployment).filter(Boolean))];
const report=[
 "# AVUQO production visual audit",
 "",
 "Date (UTC): "+new Date().toISOString(),
 "Base URL: "+BASE,
 "Viewports: desktop 1440×900, mobile 390×844",
 "Browser: headless Google Chrome. Screenshots are public **unauthenticated** views, including account sign-in prompts.",
 "Deployment IDs seen: "+(deploymentIds.join(", ")||"unavailable"),
 "Routes: "+PUBLIC_ROUTES.length+", captures: "+results.length+", flagged captures: "+issues.length,
 "",
 "This report measures HTTP/navigation, H1 presence, document overflow, broken `<img>` elements and browser JS errors. It **does not** prove the full original visual spec, CSS background-photo success, licensed product price freshness, signed-in journeys or a human pixel-by-pixel review.",
 "",
 "| Page | Device | HTTP | H1 | Overflow px | Broken images | Notes |",
 "|---|---|---:|---|---:|---:|---|",
 ...results.map(r=>`| ${r.path} | ${r.device} | ${r.status??"—"} | ${escapeMd(r.h1.slice(0,55))} | ${r.overflowPx} | ${r.brokenImages} | ${escapeMd(r.renderError??"OK")} |`),
 "",
 "## Review priorities",
 ...issues.map(r=>"- **"+r.device+" "+r.path+"**: "+(r.renderError||"HTTP/H1/overflow/broken-image check")),
 "",
 "Compare uploaded screenshots to the source index `docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md` and original design branch. No merchant products may be published to make a design screenshot look complete."
].join("\n");
await Promise.all([writeFile(join(output,"report.md"),report),writeFile(join(output,"report.json"),JSON.stringify({base:BASE,deployments:deploymentIds,routes:PUBLIC_ROUTES,results,issueCount:issues.length,generatedAt:new Date().toISOString()},null,2))]);
if(issues.length){process.stderr.write("Visual audit found "+issues.length+" flags; review artifact.\n");process.exitCode=1}
