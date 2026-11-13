import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {annualSeasonalWindows,easterDate,editorialMomentForDate,ukCivilDate} from "../lib/editorial/seasonal-date.mjs";

const at = day => new Date(day+"T12:00:00Z");
test("UK date and DST midnight boundaries use Europe/London not server-local UTC",()=>{
 assert.deepEqual(ukCivilDate(new Date("2026-03-29T23:30:00Z")),{year:2026,month:3,day:30});
 assert.deepEqual(ukCivilDate(new Date("2026-10-25T23:30:00Z")),{year:2026,month:10,day:25});
 assert.deepEqual(ukCivilDate(new Date("2026-11-01T00:30:00Z")),{year:2026,month:11,day:1});
 assert.equal(ukCivilDate(new Date("invalid")),null);
});
test("major campaigns switch automatically and gracefully return to the normal season",()=>{
 const cases={
  "2026-01-01":"sales","2026-01-20":"sales","2026-01-21":"valentines",
  "2026-02-14":"valentines","2026-02-15":"spring",
  "2026-02-28":"spring","2026-03-01":"mothers-day",
  "2026-03-08":"mothers-day","2026-03-15":"mothers-day",
  "2026-03-16":"easter","2026-04-05":"easter","2026-04-06":"easter","2026-04-07":"spring",
  "2026-06-01":"summer","2026-06-14":"fathers-day","2026-06-21":"fathers-day","2026-06-22":"summer",
  "2026-08-14":"summer","2026-08-15":"back-to-school","2026-09-10":"back-to-school","2026-09-11":"autumn",
  "2026-10-14":"autumn","2026-10-15":"halloween","2026-10-31":"halloween",
  "2026-11-01":"black-friday","2026-11-13":"black-friday","2026-11-27":"black-friday","2026-11-30":"black-friday",
  "2026-12-01":"christmas","2026-12-25":"christmas","2026-12-26":"christmas","2026-12-27":"sales"
 };
 for(const [day,expected] of Object.entries(cases))assert.equal(editorialMomentForDate(at(day)),expected,day);
 assert.equal(editorialMomentForDate(new Date(NaN)),null);
});
test("Easter and shopping dates recalculate every year, including leap years",()=>{
 assert.deepEqual(easterDate(2026),{year:2026,month:4,day:5});
 assert.deepEqual(easterDate(2027),{year:2027,month:3,day:28});
 assert.deepEqual(easterDate(2028),{year:2028,month:4,day:16});
 assert.equal(editorialMomentForDate(at("2027-03-28")),"easter");
 assert.equal(editorialMomentForDate(at("2028-04-16")),"easter");
 for (const [year,bf] of [[2026,"2026-11-27"],[2027,"2027-11-26"],[2028,"2028-11-24"]]){
  const windows=annualSeasonalWindows(year);
  assert.ok(windows.some(x=>x.id==="black-friday"&&x.note.includes(bf)));
  assert.ok(windows.some(x=>x.id==="christmas"&&x.from===year+"-12-01"));
  assert.ok(windows.some(x=>x.id==="summer"));
  assert.ok(windows.some(x=>x.id==="mothers-day"));
  assert.ok(windows.some(x=>x.id==="fathers-day"));
 }
});
test("real homepage and Control Centre are wired to schedule without publishing fake offers",()=>{
 const file=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
 const home=file("app/page.tsx"),calendar=file("app/control-centre/seasonal-calendar/page.tsx");
 assert.match(home,/await connection\(\)/);
 assert.match(home,/const season=editorialSpotlight\(new Date\(\)\)/);
 assert.match(home,/season\?\.image/);
 assert.match(home,/season\?\.href/);
 assert.doesNotMatch(home,/<HomeSeasonalSpotlight/); // Main seasonal hero owns the single campaign lead.
 assert.match(calendar,/annualSeasonalWindows\(y\)/);
 assert.match(calendar,/UK editorial schedule/);
 assert.match(file("app/control-centre/layout.tsx"),/requireControlCentreAccess/);
 assert.match(file("app/control-centre/page.tsx"),/href="\/control-centre\/seasonal-calendar"/);
 assert.match(file("components/home/HomeSeasonalSpotlight.tsx"),/not an advertisement or evidence of discounted products/);
});
