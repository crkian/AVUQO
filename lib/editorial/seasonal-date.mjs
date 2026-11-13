/**
 * AVUQO UK editorial calendar. Stateless, no provider/product/advertising publication.
 * Uses Europe/London civil dates: changes at local midnight without a cron.
 */
const dayMs=86400000;
export function ukCivilDate(now){
 if(!(now instanceof Date)||!Number.isFinite(now.getTime()))return null;
 const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
 const field=k=>Number(parts.find(p=>p.type===k)?.value??0);
 return {year:field("year"),month:field("month"),day:field("day")};
}
const dayNumber=(y,m,d)=>Math.floor(Date.UTC(y,m-1,d)/dayMs);
const formatDay=n=>new Date(n*dayMs).toISOString().slice(0,10);
export function easterDate(year){
 if(!Number.isInteger(year)||year<1900||year>2199)throw new Error("Unsupported Gregorian Easter year");
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4;
 const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
 const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4;
 const l=(32+2*e+2*i-h-k+7)%7,m=Math.floor((a+11*h+22*l)/451);
 const month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;
 return {year,month,day};
}
function nthWeekday(y,m,weekday,n){
 const first=new Date(Date.UTC(y,m-1,1)).getUTCDay();
 return 1+((weekday-first+7)%7)+7*(n-1);
}
export function annualSeasonalWindows(year){
 const easter=easterDate(year);
 const easterDay=dayNumber(easter.year,easter.month,easter.day);
 const mother=easterDay-21; // UK Mothering Sunday: fourth Sunday of Lent
 const father=dayNumber(year,6,nthWeekday(year,6,0,3)); // third Sunday of June
 const bf=dayNumber(year,11,1)+((5-new Date(Date.UTC(year,10,1)).getUTCDay()+7)%7)+21; // fourth Friday November
 // Black Friday is the day after fourth Thursday; 4th Friday is equivalent.
 const ranges=[
  {id:"sales",name:"Winter sales",from:formatDay(dayNumber(year-1,12,27)),to:formatDay(dayNumber(year,1,20)),href:"/sales",note:"Editorial guidance; no automatic price reductions"},
  {id:"valentines",name:"Valentine's Day",from:`${year}-01-21`,to:`${year}-02-14`,href:"/valentines",note:"Gifts and experiences"},
  {id:"spring",name:"Spring inspiration",from:`${year}-02-15`,to:`${year}-05-31`,href:"/home",note:"Everyday fallback between special dates"},
  {id:"summer",name:"Summer, holidays and outdoor living",from:`${year}-06-01`,to:`${year}-08-31`,href:"/travel",note:"Evergreen inspiration outside priority holidays"},
  {id:"autumn",name:"Autumn, comfort and home",from:`${year}-09-11`,to:`${year}-10-31`,href:"/home",note:"Evergreen inspiration outside special dates"},
  {id:"mothers-day",name:"Mothering Sunday",from:formatDay(mother-14),to:formatDay(mother),href:"/gifts",note:"UK date, varies with Easter"},
  {id:"easter",name:"Easter",from:formatDay(easterDay-20),to:formatDay(easterDay+1),href:"/easter",note:"Easter Sunday and Bank Holiday Monday"},
  {id:"fathers-day",name:"Father's Day",from:formatDay(father-14),to:formatDay(father),href:"/gifts",note:"Third Sunday in June"},
  {id:"back-to-school",name:"Back to school",from:`${year}-08-15`,to:`${year}-09-10`,href:"/categories",note:"UK school dates vary by school and nation"},
  {id:"halloween",name:"Halloween",from:`${year}-10-15`,to:`${year}-10-31`,href:"/gifts",note:"Seasonal inspiration"},
  {id:"black-friday",name:"Black Friday",from:`${year}-11-01`,to:`${year}-11-30`,href:"/black-friday",note:`Black Friday ${formatDay(bf)}, with Cyber Monday planning`},
  {id:"christmas",name:"Christmas",from:`${year}-12-01`,to:`${year}-12-26`,href:"/christmas",note:"Gift planning, not a claim of active promotions"},
  {id:"sales",name:"Post-Christmas sales",from:`${year}-12-27`,to:`${year+1}-01-20`,href:"/sales",note:"Editorial guidance; no invented discount evidence"}
 ];
 return ranges;
}
export function editorialMomentForDate(now){
 const c=ukCivilDate(now);if(!c)return null;
 const {year,month,day}=c, today=dayNumber(year,month,day);
 // Editorial precedence prevents UK Mother's Day from being swallowed by Easter.
 const easter=easterDate(year),easterDay=dayNumber(year,easter.month,easter.day),mother=easterDay-21;
 const father=dayNumber(year,6,nthWeekday(year,6,0,3));
 if(month===12)return day<=26?"christmas":"sales";
 if(month===1)return day<=20?"sales":"valentines";
 if(month===2&&day<=14)return "valentines";
 if(today>=mother-14&&today<=mother)return "mothers-day";
 if(today>=easterDay-20&&today<=easterDay+1)return "easter";
 if(today>=father-14&&today<=father)return "fathers-day";
 if(month===11)return "black-friday";
 if(month===10&&day>=15)return "halloween";
 if(month===8&&day>=15 || month===9&&day<=10)return "back-to-school";
 if(month===6||month===7||month===8)return "summer";
 if(month===9||month===10)return "autumn";
 return "spring";
}
