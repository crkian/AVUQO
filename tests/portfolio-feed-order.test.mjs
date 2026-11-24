import test from "node:test";
import assert from "node:assert/strict";
import {selectPortfolioFeed} from "../lib/awin/portfolio-feed-order.ts";
const feeds=[{advertiser:"1",feed:"a"},{advertiser:"2",feed:"b"},{advertiser:"1",feed:"c"}];
test("unattempted feed precedes attempted feeds",()=>assert.equal(selectPortfolioFeed(feeds,[{advertiser_id:"1",feed_id:"a",started_at:"2026-11-24T20:00:00Z"}]).feed,"b"));
test("least recently attempted across distinct feeds",()=>assert.equal(selectPortfolioFeed(feeds,[{advertiser_id:"1",feed_id:"a",started_at:"2026-11-24T20:00:00Z"},{advertiser_id:"2",feed_id:"b",started_at:"2026-11-24T19:00:00Z"},{advertiser_id:"1",feed_id:"c",started_at:"2026-11-24T19:30:00Z"}]).feed,"b"));
test("bounded owner offset and empty inventory",()=>{assert.equal(selectPortfolioFeed(feeds,[],4).feed,"b");assert.equal(selectPortfolioFeed([],[]),undefined);});
