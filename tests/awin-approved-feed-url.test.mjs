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
