"use server";

import {redirect} from "next/navigation";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {joinedInSource} from "../../../lib/awin/joined-catalogue";
import {probeAwinEnhancedFeed} from "../../../lib/connectors/awin";

/**
 * Owner-initiated, read-only Awin feed connectivity test.
 * No data import, automatic sync, Awin release, private preview rows
 * or source mutation. Do not log or return credential/provider bodies.
 */
export async function probeJoinedAwinMerchant(form:FormData){
 const {role}=await requireControlCentreAccess();
 if(role!=="owner")throw new Error("Only the AVUQO owner can probe Awin advertiser feeds");
 const id=String(form.get("advertiser_id")??"").trim();
 if(!/^\d{2,12}$/.test(id))throw new Error("Invalid advertiser");
 const admin=createAdminClient();
 const {data,error}=await admin.from("sources")
  .select("metadata").eq("connector_key","awin").maybeSingle();
 if(error||!data||!joinedInSource(data.metadata,id))
  throw new Error("Awin advertiser not in the owner's joined-programme registry");
 const result=await probeAwinEnhancedFeed(id);
 redirect("/control-centre/awin-programmes?probe="+encodeURIComponent(id)+
  "&result="+result);
}
