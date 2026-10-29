/** One navigation registry for the existing AVUQO Control Centre. */
export type AdminLink={href:string;label:string;description:string};
export type AdminSection={id:string;label:string;description:string;links:AdminLink[]};
export const CONTROL_CENTRE_SECTIONS:AdminSection[]=[
 {id:"home",label:"Start here",description:"Know what needs attention",links:[
  {href:"/control-centre",label:"Command overview",description:"Workspaces, health and exceptions"},
  {href:"/control-centre/release-readiness",label:"Release readiness",description:"Operational gaps and launch gates"}]},
 {id:"website",label:"Website & Experience",description:"Content, journeys and publishing",links:[
  {href:"/control-centre/content",label:"Website content",description:"Footer and public copy"},
  {href:"/control-centre/content/navigation",label:"Menu & submenus",description:"Draft, preview, publish and restore"},
  {href:"/control-centre/content/pages",label:"Page editor & SEO",description:"Selected editorial and search metadata"},
  {href:"/control-centre/content/legal",label:"Legal & privacy",description:"Versioned notices and approvals"},
  {href:"/control-centre/seasonal",label:"Seasonal pages",description:"Review seasonal publication"},
  {href:"/control-centre/groceries",label:"Grocery catalogue",description:"Products and supermarket directory"},
  {href:"/control-centre/groceries/price-evidence",label:"Grocery price evidence",description:"Review source records and freshness"}]},
 {id:"data",label:"Sources & Value",description:"Merchants, prices and data quality",links:[
  {href:"/control-centre/live-data",label:"Live-data status",description:"Readiness of verified feeds"},
  {href:"/control-centre/coverage",label:"Coverage",description:"Supported sector coverage"},
  {href:"/control-centre/sources",label:"Connectors & sources",description:"Source permissions and data feeds"},
  {href:"/control-centre/source-readiness",label:"Source approvals",description:"Eligibility and usage rights"},
  {href:"/control-centre/product-readiness",label:"Product matching",description:"Product identity and verification"},
  {href:"/control-centre/pipeline",label:"Deal pipeline",description:"Ingestion and review"}]},
 {id:"commercial",label:"Advertising & Growth",description:"Separate advertising, marketing and affiliate systems",links:[
  {href:"/control-centre/site-advertising",label:"Site advertising",description:"Third-party advertisers and on-site campaigns"},
  {href:"/control-centre/marketing",label:"Brand social marketing",description:"Our four brands on social platforms"},
  {href:"/control-centre/promotions",label:"Affiliate promotion",description:"Eligible merchant promotion engine"},
  {href:"/control-centre/revenue",label:"Revenue & conversions",description:"Verified affiliate reporting"}]},
 {id:"operations",label:"Operations & Trust",description:"Automation, exceptions and safeguards",links:[
  {href:"/control-centre/automation",label:"Autopilot & controls",description:"System switches and worker queues"},
  {href:"/control-centre/exceptions",label:"Exception queue",description:"Failures requiring attention"},
  {href:"/control-centre/trust",label:"Trust & feedback",description:"Quality signals and independence"}]}
];
export const allAdminLinks=()=>CONTROL_CENTRE_SECTIONS.flatMap(s=>s.links);
export function adminSectionForPath(pathname:string){
 const exact=CONTROL_CENTRE_SECTIONS.find(s=>s.links.some(l=>l.href===pathname));
 if(exact)return exact.id;
 const candidate=allAdminLinks().filter(l=>pathname.startsWith(l.href+"/")).sort((a,b)=>b.href.length-a.href.length)[0];
 return candidate?CONTROL_CENTRE_SECTIONS.find(s=>s.links.includes(candidate))?.id??"home":"home";
}
