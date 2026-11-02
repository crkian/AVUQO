import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
const manifest=JSON.parse(readFileSync("package.json","utf8"));
const lock=JSON.parse(readFileSync("package-lock.json","utf8"));
const status=readFileSync("docs/PROJECT_STATUS.md","utf8");
const changelog=readFileSync("CHANGELOG.md","utf8");
if(manifest.version!==lock.version||manifest.version!==lock.packages[""].version)throw Error("Package/lockfile versions differ.");
if(!status.includes("`"+manifest.version+"`"))throw Error("Project status must include software version.");
if(!changelog.includes("## ["+manifest.version+"]"))throw Error("Changelog must include software version.");
const base=process.env.PR_BASE_SHA,head=process.env.PR_HEAD_SHA;
if(base&&head){
 const files=execFileSync("git",["diff","--name-only",base,head],{encoding:"utf8"}).trim().split("\n").filter(Boolean);
 const feature=files.some(p=>/^(app|components|lib|supabase)\//.test(p));
 if(feature&&(!files.includes("docs/PROJECT_STATUS.md")||!files.includes("CHANGELOG.md")))
  throw Error("Feature PRs must update docs/PROJECT_STATUS.md and CHANGELOG.md.");
}
console.log("AVUQO register and version checked: "+manifest.version);
