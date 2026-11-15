import {createAdminClient} from "../supabase/admin";
import {joinedInSource} from "./joined-catalogue";
import {evaluateSourceControls} from "../pipeline/source-readiness";

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
  db.from("sources").select("metadata,status,sync_enabled")
   .eq("connector_key","awin").maybeSingle(),
  db.from("system_controls").select("control_key,enabled")
   .in("control_key",["global_emergency_stop","source_ingestion"])
 ]);
 if(source.error||!source.data||controls.error||!controls.data)return false;
 const gates=evaluateSourceControls(controls.data);
 return gates.ingestion&&!gates.emergencyStop&&
  source.data.status==="paused"&&source.data.sync_enabled===false&&
  joinedInSource(source.data.metadata,"496");
}
