import type {createAdminClient} from "../supabase/admin";

export const TOOLED_UP_OBSERVATION_MAX_AGE_MS=15*60_000;
export const TOOLED_UP_CLOCK_SKEW_MS=120_000;

/** A freshly-downloaded identical gzip is still a fresh Awin observation.
 * This ledger is written ONLY after an authenticated Awin download and an
 * independent signed Storage read-back with the exact same SHA-256 digest.
 * It is not an immutable file's created_at, nor a validation timestamp.
 */
export async function latestTooledUpObservedDigest(
 db:ReturnType<typeof createAdminClient>,maxAgeMs=TOOLED_UP_OBSERVATION_MAX_AGE_MS,
 now=Date.now()
){
 const {data,error}=await db.from("awin_tooled_up_snapshot_observations")
  .select("snapshot_sha256,compressed_bytes,observed_at,evidence_kind")
  .eq("advertiser_id","496").eq("feed_id","89987")
  .order("observed_at",{ascending:false}).limit(1).maybeSingle();
 if(error||!data||data.evidence_kind!=="authenticated_awin_download_and_storage_readback")
  return null;
 const observed=Date.parse(data.observed_at??"");
 if(!Number.isFinite(observed)||observed>now+TOOLED_UP_CLOCK_SKEW_MS||
    now-observed>maxAgeMs||!/^[a-f0-9]{64}$/.test(data.snapshot_sha256??"")||
    !Number.isSafeInteger(Number(data.compressed_bytes))||Number(data.compressed_bytes)<=0)
  return null;
 return {snapshot_sha256:data.snapshot_sha256,observed_at:data.observed_at,
  compressed_bytes:Number(data.compressed_bytes)};
}
