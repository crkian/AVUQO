/** Public-free private campaign intake rules. These are not ad-delivery permissions. */
export const AD_ZONES=[
 {id:"homepage_feature",label:"Homepage feature",description:"Clearly labelled, separate from independent editorial rotation"},
 {id:"category_sponsor",label:"Category sponsorship",description:"Disclosure within the relevant shopping category"},
 {id:"article_sponsor",label:"Sponsored editorial",description:"Separate from AVUQO independent reviews"}
] as const;
export const ADVERTISER_STATUSES=["prospect","verified","declined"] as const;
export const CAMPAIGN_STATUSES=["draft","in_review","ready","paused","declined"] as const;
export function validAdvertiserSite(raw:string):boolean{
 try{
  const u=new URL(raw);
  if(u.protocol!=="https:"||u.username||u.password||u.port)return false;
  const host=u.hostname.toLowerCase();
  if(host==="localhost"||host.endsWith(".localhost")||host.endsWith(".local")
     ||host.endsWith(".internal")||host==="127.0.0.1"||host==="0.0.0.0"
     ||host==="[::1]"||!host.includes("."))return false;
  if(/^(?:10|127|192\.168|169\.254|172\.(?:1[6-9]|2\d|3[01]))\./.test(host))return false;
  return raw.length<=500&&!u.hash;
 }catch{return false}
}
export function matchesAdvertiserDomain(destination:string,verifiedWebsite:string):boolean{
 if(!validAdvertiserSite(destination)||!validAdvertiserSite(verifiedWebsite))return false;
 const dest=new URL(destination).hostname.toLowerCase();
 const verified=new URL(verifiedWebsite).hostname.toLowerCase();
 const bare=verified.startsWith("www.")?verified.slice(4):verified;
 return dest===bare||dest==="www."+bare||dest.endsWith("."+bare);
}
export function validCampaignWindow(start:string,end:string,now=new Date()):boolean{
 const s=Date.parse(start),e=Date.parse(end);
 return Number.isFinite(s)&&Number.isFinite(e)&&s<e&&e>now.getTime();
}
export function readyForEditorialApproval(input:{
 advertiserVerified:boolean;advertiserWebsite:string;rightsNote:string;disclosure:string;destination:string;end:string;
},now=new Date()):{ok:boolean;reasons:string[]}{
 const reasons:string[]=[];
 if(!input.advertiserVerified)reasons.push("Advertiser must be verified");
 if(input.rightsNote.trim().length<8)reasons.push("Record creative rights evidence");
 if(!["Advertisement","Sponsored"].includes(input.disclosure))reasons.push("Disclosure is required");
 if(!validAdvertiserSite(input.destination))reasons.push("Destination must be safe HTTPS");
 if(!matchesAdvertiserDomain(input.destination,input.advertiserWebsite))reasons.push("Landing page must belong to the verified advertiser domain");
 if(!Number.isFinite(Date.parse(input.end))||Date.parse(input.end)<=now.getTime())reasons.push("Campaign has expired");
 return {ok:reasons.length===0,reasons};
}
