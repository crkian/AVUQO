import {NextRequest} from "next/server";
import {recoverPneusSnapshot,recoveryResponse} from "../../../../lib/awin/pneus-snapshot-recovery";
export const maxDuration=300;
/** Once-daily, fixed-scope, read-only audit. No raw archive contents in logs. */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!=="Bearer "+secret)
  return recoveryResponse({status:"unauthorized"},401);
 if(process.env.AWIN_AUTO_IMPORT_ENABLED!=="true")return recoveryResponse({status:"disabled"});
 const result=await recoverPneusSnapshot("latest");
 // The helper emits only stable categorical diagnostics and aggregate counts.
 const body=await result.clone().json();
 console.info("pneus_archive_recovery_audit",JSON.stringify(body));
 return result;
}
