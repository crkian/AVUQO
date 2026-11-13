import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const source=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/homepage-warm.module.css",import.meta.url),"utf8");

test("the streamed homepage never shows the old generic hero before the UK seasonal hero",()=>{
 assert.match(source,/const season=editorialSpotlight\(new Date\(\)\)/);
 assert.match(source,/await connection\(\)/);
 assert.match(source,/fallback=\{<SeasonalLoading\/>\}/);
 assert.doesNotMatch(source,/HeroPlaceholder|function SearchForm\(/);
 assert.doesNotMatch(source,/Welcome to AVUQO|What would you like to explore\?/);
 assert.match(source,/season\?\.image/);
 assert.match(source,/season\?\.href/);
});
test("neutral streaming placeholder is accessible and responsive without misleading deals",()=>{
 assert.match(source,/aria-label="Loading the current seasonal homepage"/);
 assert.match(source,/aria-busy="true"/);
 assert.match(css,/\.seasonalLoading\{/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.doesNotMatch(source,/fallback=\{.*Black Friday|fallback=\{.*Christmas/);
});
