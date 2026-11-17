import {createAdminClient} from "../supabase/admin";
import {joinedInSource} from "./joined-catalogue";
import {evaluateSourceControls,sourceIngestionFailures} from "../pipeline/source-readiness";

/**
 * Authorize PRIVATE Tooled Up snapshot capture/diagnostics only.
 * Does not assess or grant public advertiser rights or active source state.
 * Fail closed if the emergency stop, ingestion control, source registry,
 * or joined-programme observation cannot be read.
 */
export async function tooledUpPrivateAutomationAllowed(
 db:ReturnType<typeof createAdminClient>
){
 const [source,controls]=await Promise.all([
  db.from("sources").select("metadata,status,sync_enabled,credential_status,connector_key,source_type")
   .eq("connector_key","awin").maybeSingle(),
  db.from("system_controls").select("control_key,enabled")
   .in("control_key",["global_emergency_stop","source_ingestion"])
 ]);
 if(source.error||!source.data||controls.error||!controls.data)return false;
 const gates=evaluateSourceControls(controls.data);
 // This route NEVER publishes products. It may capture/validate a Tooled Up
 // snapshot after the owner activates Awin, but only for the exact accepted
 // advertiser 496 and only with verified active-source evidence.
 const ownerJoined=joinedInSource(source.data.metadata,"496");
 const paused=source.data.status==="paused"&&source.data.sync_enabled===false;
 const active=source.data.status==="active"&&source.data.sync_enabled===true&&
  sourceIngestionFailures(source.data,{
   advertiserId:"496",
   connectorConfigured:Boolean(process.env.AWIN_DATAFEED_API_KEY&&
     process.env.AWIN_PUBLISHER_ID)
  }).length===0;
 if(!gates.ingestion||gates.emergencyStop||!ownerJoined||(!paused&&!active))
  return false;
 // Cross-check the canonical programme registry; historical source roster
 // alone is not sufficient after accepted/owner-approved publication rollout.
 const {data:programme,error:programmeError}=await db.from("affiliate_programs")
  .select("metadata").eq("provider","awin").eq("region","GB")
  .eq("external_account_id","496").maybeSingle();
 if(programmeError||!programme)return false;
 const metadata=programme.metadata&&typeof programme.metadata==="object"&&
  !Array.isArray(programme.metadata)?programme.metadata as Record<string,unknown>:{};
 const attestation=metadata.owner_joined_accepted_attestation;
 return Boolean(attestation&&typeof attestation==="object"&&
  !Array.isArray(attestation)&&
  (attestation as Record<string,unknown>).membership_status==="accepted"&&
  metadata.publication_approved===true);
}
