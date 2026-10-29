"use server";
import {revalidatePath} from "next/cache";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../lib/supabase/server";
const types=["affiliate_network","direct_feed","grocery","travel","motoring","broadband","insurance","local_services","editorial"] as const;
export async function registerPendingSource(form:FormData){
 const {role,user}=await requireControlCentreAccess();
 if(role!=="owner")throw Error("Only the owner can register external sources");
 const name=String(form.get("name")??"").trim();
 const type=String(form.get("type")??"").trim();
 const website=String(form.get("website")??"").trim();
 const purpose=String(form.get("purpose")??"").trim();
 if(name.length<3||name.length>120||!types.includes(type as typeof types[number]))throw Error("Invalid source name or category");
 if(purpose.length<5||purpose.length>320)throw Error("Describe the proposed use without putting secret credentials here");
 let url:URL;
 try{url=new URL(website);}catch{throw Error("Enter the public HTTPS website address");}
 if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||website.length>700||url.hostname==="localhost"||url.hostname.endsWith(".local"))throw Error("Use a public HTTPS website address without credentials, query tokens or fragments");
 const db=await createClient();
 const {error}=await db.from("sources").insert({
  name,source_type:type,country_code:"GB",status:"paused",sync_enabled:false,
  connector_key:null,credential_status:"not_configured",health_status:"unknown",
  metadata:{website_url:url.origin+url.pathname,proposed_purpose:purpose,
   registration_state:"pending_rights_and_connector",usage_rights_confirmed:false,
   registered_by:user.id,registered_at:new Date().toISOString()}
 });
 if(error){if(error.code==="23505")throw Error("A source with this name is already registered");throw Error("Could not register source: "+error.message);}
 revalidatePath("/control-centre/source-readiness");
 revalidatePath("/control-centre/sources");
 revalidatePath("/control-centre");
}
