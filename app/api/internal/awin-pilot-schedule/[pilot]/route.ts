import {NextRequest,NextResponse} from "next/server";
import {POST as privateImport} from "../../awin-auto-import/route";
import {recordPrivateCronAttempt,PrivateCronJob} from "../../../../../lib/awin/private-cron-recorder";

const reply=(body:unknown,status=200)=>NextResponse.json(body,{
 status,headers:{"Cache-Control":"private, no-store"}
});
/**
 * Four fixed, independently scheduled physical-product private imports.
 * Exact feed IDs, server-to-server cron authentication and a separate
 * AWIN_AUTO_IMPORT_ENABLED opt-in. The existing worker performs the actual
 * Awin inventory, signed URL, schema, size, currency, join, source-pause,
 * global-stop, SHA, resumption and private persistence checks.
 *
 * No other merchant, service, tyre, contract feed or public offer can
 * be enabled by this route, and no caller can supply a download URL.
 */
const PILOTS:Record<string,readonly [string,string]>={
 petlibro:["77952","103580"],
 mozillion:["31539","74135"],
 cadbury:["736","48599"],
 craftbuddy:["45747","F1356"],
};
export async function GET(
 request:NextRequest,
 context:{params:Promise<{pilot:string}>}
){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||
    request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 const {pilot}=await context.params;
 if(!Object.prototype.hasOwnProperty.call(PILOTS,pilot))
  return reply({error:"Unknown private pilot"},404);
 const job=("pilot_"+pilot) as PrivateCronJob;
 return recordPrivateCronAttempt(job,async()=>{
 if(process.env.AWIN_AUTO_IMPORT_ENABLED!=="true")
  return reply({status:"disabled",private_only:true});
 const [advertiserId,feedId]=PILOTS[pilot];
 const url=new URL("/api/internal/awin-auto-import",request.url);
 url.searchParams.set("mode","stage");
 url.searchParams.set("advertiser_id",advertiserId);
 url.searchParams.set("feed_id",feedId);
 return privateImport(new NextRequest(url,{
  method:"POST",headers:{authorization:`Bearer ${secret}`}
 }));
 });
}
