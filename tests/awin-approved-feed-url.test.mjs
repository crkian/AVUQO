import test from "node:test";
import assert from "node:assert/strict";
import {approvedAwinDownloadUrl} from "../lib/awin/approved-feed-url.ts";

const key="a".repeat(32);
const path=`https://productdata.awin.com/datafeed/download/apikey/${key}/fid/103580/format/csv/language/en/delimiter/%2C/compression/gzip/columns/merchant_id%2Cproduct_name`;

test("accepts exact signed Awin CSV feed binding",()=>{
 assert.equal(approvedAwinDownloadUrl(path,key,"103580"),path);
});
test("rejects a substituted feed ID",()=>{
 assert.throws(()=>approvedAwinDownloadUrl(path,key,"74135"),/feed_binding_mismatch/);
});
test("rejects mismatched API key",()=>{
 assert.throws(()=>approvedAwinDownloadUrl(path,"b".repeat(32),"103580"),/feed_binding_mismatch/);
});
test("rejects host and scheme substitutes",()=>{
 for(const candidate of [
  path.replace("productdata.awin.com","productdata.awin.com.evil.test"),
  path.replace("https:","http:"),
  path.replace("productdata.awin.com","ui.awin.com"),
  path.replace("https://","https://user:pass@"),
  path+"?redirect=https://example.test"
 ])assert.throws(()=>approvedAwinDownloadUrl(candidate,key,"103580"),/unsafe_feed_url/);
});
test("rejects non-CSV or wrong download route",()=>{
 for(const candidate of [
  path.replace("/format/csv/","/format/xml/"),
  path.replace("/datafeed/download/","/datafeed/list/")
 ])assert.throws(()=>approvedAwinDownloadUrl(candidate,key,"103580"),/feed_binding_mismatch/);
});

test("allow exactly Craft Buddy alphanumeric signed Awin feed ID",()=>{
 const google=path.replace("/fid/103580/","/fid/F1356/");
 assert.equal(approvedAwinDownloadUrl(google,key,"F1356"),google);
 for(const feed of ["F1357","XYZ","F1356evil"])
  assert.throws(()=>approvedAwinDownloadUrl(google,key,feed));
});

test("Google product feeds use exact publisher-hosted Awin URL, never arbitrary hosts or mismatched identities",()=>{
 const google=`https://ui.awin.com/productdata-darwin-download/publisher/3135746/${key}/1/feed/F5142.csv.gz`;
 assert.equal(approvedAwinDownloadUrl(google,key,"F5142","3135746"),google);
 for(const bad of [
  google.replace("F5142","F1356"),
  google.replace("/3135746/","/3135747/"),
  google.replace(`/${key}/`,`/${"b".repeat(32)}/`),
  google.replace("ui.awin.com","ui.awin.com.example.test"),
  google+"?other=1",
  google+"/redirect",
  google.replace("https:","http:"),
  google.replace("/1/feed/","/1/feedList/")
 ])assert.throws(()=>approvedAwinDownloadUrl(bad,key,"F5142","3135746"));
});
