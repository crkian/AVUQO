/**
 * Select only today's real, immutable Tooled Up master snapshot.
 * Storage filenames come from Supabase, not callers; never trust names or
 * timestamps as instructions/URLs. File timestamps must be recent because
 * a failed upload must not cause yesterday's file to be revalidated as fresh.
 */
export type PrivateSnapshotListing={
 name:string;
 id:string|null;
 created_at:string|null;
};
const FILE=/^([a-f0-9]{64})\.csv\.gz$/;
const MAX_AGE_MS=2*60*60*1000;
const CLOCK_SKEW_MS=2*60*1000;
export function newestRecentTooledUpSnapshot(
 entries:PrivateSnapshotListing[]|null|undefined,nowMs=Date.now()
){
 if(!Array.isArray(entries)||entries.length>100||
    !Number.isFinite(nowMs))return null;
 const eligible=entries.flatMap(entry=>{
  if(!entry||typeof entry.name!=="string"||
     typeof entry.id!=="string"||!entry.id||
     typeof entry.created_at!=="string")return [];
  const matched=FILE.exec(entry.name);
  const created=Date.parse(entry.created_at);
  if(!matched||!Number.isFinite(created)||
     created<nowMs-MAX_AGE_MS||created>nowMs+CLOCK_SKEW_MS)
   return [];
  return [{snapshot_sha256:matched[1],created_at:entry.created_at,createdMs:created}];
 });
 eligible.sort((a,b)=>b.createdMs-a.createdMs||
  a.snapshot_sha256.localeCompare(b.snapshot_sha256));
 const winner=eligible[0];
 return winner?{snapshot_sha256:winner.snapshot_sha256,created_at:winner.created_at}:null;
}
