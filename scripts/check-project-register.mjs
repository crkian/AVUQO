import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";

const manifest=JSON.parse(readFileSync("package.json","utf8"));
const lock=JSON.parse(readFileSync("package-lock.json","utf8"));
const status=readFileSync("docs/PROJECT_STATUS.md","utf8");
const changelog=readFileSync("CHANGELOG.md","utf8");
const handover=readFileSync("docs/AVUQO_ACTIVE_HANDOVER.md","utf8");
const machine=JSON.parse(readFileSync("docs/AVUQO_ACTIVE_HANDOVER.json","utf8"));
if(manifest.version!==lock.version||manifest.version!==lock.packages[""].version)
 throw Error("Package/lockfile versions differ.");
if(!status.includes("`"+manifest.version+"`"))
 throw Error("Project status must include software version.");
if(!changelog.includes("## ["+manifest.version+"]"))
 throw Error("Changelog must include software version.");
if(!handover.includes("## 10. Required handover procedure")||
   !Array.isArray(machine.priorities)||machine.priorities.length<1||
   machine.handover?.current!=="docs/AVUQO_ACTIVE_HANDOVER.md")
 throw Error("Current Markdown/machine handover missing or incomplete.");
const base=process.env.PR_BASE_SHA,head=process.env.PR_HEAD_SHA;
if(base&&head){
 const files=execFileSync("git",["diff","--name-only",base,head],{encoding:"utf8"}).trim().split("\n").filter(Boolean);
 const implementation=files.some(p=>/^(app|components|lib|supabase|scripts)\//.test(p)||p==="vercel.json");
 const required=implementation?[
  "docs/PROJECT_STATUS.md","CHANGELOG.md",
  "docs/AVUQO_ACTIVE_HANDOVER.md","docs/AVUQO_ACTIVE_HANDOVER.json"
 ]:[];
 const missing=required.filter(p=>!files.includes(p));
 if(missing.length)throw Error("Implementation PR must update all four handover/register files: "+missing.join(", "));
}
console.log("AVUQO version and full Git handover verified: "+manifest.version);
