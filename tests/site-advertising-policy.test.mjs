import test from "node:test";
import assert from "node:assert/strict";
import {validAdvertiserSite,validCampaignWindow,readyForEditorialApproval,AD_ZONES} from "../lib/site-advertising/policy.ts";
test("ad destinations require safe HTTPS and reject private endpoints",()=>{
 for(const site of ["http://brand.example","https://localhost/p","https://127.0.0.1/","https://10.0.0.2/",
   "https://user:pass@brand.example","https://brand.example:8080","javascript:alert(1)"])
    assert.equal(validAdvertiserSite(site),false,site);
 assert.equal(validAdvertiserSite("https://www.example.com/offer"),true);
});
test("campaign window must end in future",()=>{
 assert.equal(validCampaignWindow("2030-01-02","2030-01-03",new Date("2026-10-29")),true);
 assert.equal(validCampaignWindow("2030-01-03","2030-01-02",new Date("2026-10-29")),false);
});
test("editorial approval requires verified advertiser, licence and disclosure",()=>{
 const result=readyForEditorialApproval({advertiserVerified:false,rightsNote:"",disclosure:"",destination:"http://bad",end:"2020-01-01"},new Date("2026-10-29"));
 assert.equal(result.ok,false);assert.ok(result.reasons.length>=4);
});
test("ad zones are separate from brand social channels",()=>{
 assert.equal(AD_ZONES.length,3);
 assert.equal(AD_ZONES.some(z=>z.id.includes("facebook")||z.id.includes("instagram")),false);
});
