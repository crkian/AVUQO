import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {verifyEbaySignature} from "../../../../lib/ebay/deletion-signature";
import {journalVerifiedEbayDeletion} from "../../../../lib/ebay/deletion-journal";

/**
 * eBay production account-deletion webhook, phase 2 (challenge and signature verification, deletion processing pending).
 *
 * IMPORTANT: Do not register this endpoint with eBay yet. Signed POST processing,
 * idempotent deletion is not implemented. POST deliberately fails closed.
 * Only keyed digests of identifiers may be journaled after verified signature.
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
 * Phase 2: authenticate the received eBay payload, but do not acknowledge
 * a request while durable idempotent deletion/suppression is unfinished.
 * This explicit 503 forces retries instead of misrepresenting compliance.
 */
export async function POST(request:NextRequest){
 if(!process.env.EBAY_CLIENT_ID||!process.env.EBAY_CLIENT_SECRET)
  return NextResponse.json({error:"Receiver unavailable"},{status:503,headers});
 if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
  return NextResponse.json({error:"JSON required"},{status:415,headers});
 if(Number(request.headers.get("content-length")??0)>16_384)
  return NextResponse.json({error:"Payload too large"},{status:413,headers});
 let payload:unknown;
 try{
  const body=await request.text();
  if(body.length>16_384)return NextResponse.json({error:"Payload too large"},{status:413,headers});
  payload=JSON.parse(body);
 }catch{return NextResponse.json({error:"Invalid JSON"},{status:400,headers});}
 if(!await verifyEbaySignature(payload,request.headers.get("x-ebay-signature")))
  return NextResponse.json({error:"Signature invalid"},{status:412,headers});
 const value=payload&&typeof payload==="object"&&!Array.isArray(payload)
  ?payload as Record<string,unknown>:null;
 const metadata=value?.metadata && typeof value.metadata==="object"&&!Array.isArray(value.metadata)
  ?value.metadata as Record<string,unknown>:null;
 const notice=value?.notification && typeof value.notification==="object"&&!Array.isArray(value.notification)
  ?value.notification as Record<string,unknown>:null;
 if(metadata?.topic!=="MARKETPLACE_ACCOUNT_DELETION"||
    typeof notice?.notificationId!=="string"||
    notice.notificationId.length>128||
    !notice.data||typeof notice.data!=="object")
  return NextResponse.json({error:"Unsupported notification"},{status:422,headers});
 const receipt=await journalVerifiedEbayDeletion(notice.notificationId,notice.data as Record<string,unknown>);
 // Persisting a receipt is NOT erasure, so never acknowledge success yet.
 return NextResponse.json({error:receipt==="unavailable"?"Deletion journal unavailable":"Deletion processing not enabled"},
  {status:503,headers:{...headers,"Retry-After":"3600"}});
}
