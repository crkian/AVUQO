import test from "node:test";
import assert from "node:assert/strict";
import {quoteJourney} from "../lib/partners/quote-journeys.ts";
test("specialist journeys keep quote requirements and complete costs distinct",()=>{for(const slug of ["holiday-extras","compare-parking-prices","mozillion","onestream","tyres-uk","tyres-pneus-online","autoaid-breakdown","your-coop-energy","epc-gas-electrical"]){const j=quoteJourney(slug);assert.ok(j.fields.length>=2);assert.ok(j.costs.length>=2);assert.ok(j.route.startsWith("/"));}});
test("ordinary retail and unknown slugs are not treated as service quotes",()=>{for(const slug of ["tooled-up","petlibro","unknown","__proto__"])assert.equal(quoteJourney(slug),null);});
