import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const path=new URL("../app/control-centre/retailers/page.tsx",import.meta.url);
const source=readFileSync(path,"utf8");

test("owner-only Awin retailer board has image coverage without image publication",()=>{
 assert.match(source,/requireControlCentreAccess\(\)/);
 assert.match(source,/joinedAwinAdvertisers/);
 assert.match(source,/feed_import_records/);
 assert.match(source,/\.not\("image_url","is",null\)/);
 assert.match(source,/Private image references/);
 assert.match(source,/URLs only/);
 assert.match(source,/Public product imagery stays disabled/);
 assert.doesNotMatch(source,/<img\s|<Image\s/);
});
