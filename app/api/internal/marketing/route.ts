import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { runMarketingWorker, reconcileMarketingWorker } from "../../../../lib/marketing/worker";

/** For a future explicitly approved trusted scheduler. No cron registration in this change. */

export async function GET(request:NextRequest) {
  await connection();
  const secret=process.env.CRON_SECRET;
  if(!secret || request.headers.get("authorization")!=="Bearer "+secret) {
    return new NextResponse("Not found",{status:404});
  }
  if(process.env.MARKETING_WORKER_ENABLED!=="YES" ||
     process.env.MARKETING_LIVE_PUBLISH!=="YES") {
    return NextResponse.json({enabled:false});
  }
  try {
    const [dispatch,reconcile]=await Promise.all([runMarketingWorker(),reconcileMarketingWorker()]);
    return NextResponse.json({dispatch,reconcile});
  } catch {
    return NextResponse.json({error:"Marketing worker encountered a controlled error"},{status:503});
  }
}
