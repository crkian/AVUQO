import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";

export const runtime="nodejs";

/**
 * eBay production account-deletion webhook, phase 1 (challenge only).
 *
 * IMPORTANT: Do not register this endpoint with eBay yet. Signed POST processing,
 * idempotent deletion and audit are not implemented. POST deliberately fails closed.
 * No eBay user data is accepted or persisted in this phase.
 */
const EXACT_ENDPOINT="https://www.avuqo.com/api/ebay/account-deletion";
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};

export async function GET(request:NextRequest){
 const url=new URL(request.url);
 const code=url.searchParams.get("challenge_code");
 const token=process.env.EBAY_DELETION_VERIFICATION_TOKEN;
 const configured=process.env.EBAY_DELETION_ENDPOINT_URL;

 if(configured!==EXACT_ENDPOINT||!token||
   !/^[A-Za-z0-9_-]{32,80}$/.test(token))
   return NextResponse.json({error:"Endpoint unavailable"},{status:503,headers});

 if(url.searchParams.size!==1||!code||
   !/^[A-Za-z0-9_-]{1,256}$/.test(code))
   return NextResponse.json({error:"Invalid challenge"},{status:400,headers});

 const challengeResponse=createHash("sha256")
  .update(code+token+EXACT_ENDPOINT,"utf8").digest("hex");
 return NextResponse.json({challengeResponse},{status:200,headers});
}

/**
 * Never acknowledge a deletion request until source signature verification and
 * real idempotent erasure workflows are installed. eBay must retry/fail rather
 * than accept a misleading 200.
 */
export async function POST(){
 return NextResponse.json(
  {error:"Deletion receiver not enabled"},
  {status:503,headers:{"Cache-Control":"no-store","Retry-After":"3600"}}
 );
}
