import {createHash} from "node:crypto";

export const AWIN_PRIVATE_SNAPSHOT_BUCKET="awin-bulk-private-snapshots";
export const MAX_PRIVATE_SNAPSHOT_BYTES=250*1024*1024;
export type SnapshotFormat="csv"|"tsv"|"csv.gz"|"tsv.gz";
const DIGEST=/^[a-f0-9]{64}$/;
const ID=/^[0-9]{1,9}$/;
const FEED=/^[0-9]{1,30}$/;

/**
 * Addressed by content hash, not a remote/signed Awin URL.
 * Never use upload upsert: true for these keys.
 */
export function privateAwinSnapshotKey(advertiserId:string,feedId:string,digest:string,format:SnapshotFormat){
 if(!ID.test(advertiserId)||!FEED.test(feedId)||!DIGEST.test(digest)||
   !["csv","tsv","csv.gz","tsv.gz"].includes(format))
  throw Error("Invalid private snapshot identity");
 return `awin/${advertiserId}/${feedId}/${digest}.${format}`;
}

export function validatePrivateAwinSnapshotKey(
 key:string,advertiserId:string,feedId:string,digest:string
){
 return (["csv","tsv","csv.gz","tsv.gz"] as const).some(format=>
  key===privateAwinSnapshotKey(advertiserId,feedId,digest,format));
}

/**
 * Hash bounded bytes without holding an entire 84k-row file in memory.
 * Caller must independently enforce read timeouts, Awin source membership,
 * decompression limits, and CSV/record validation before staging.
 */
export async function digestBoundedAwinSnapshot(
 source:AsyncIterable<Uint8Array>,maxBytes=MAX_PRIVATE_SNAPSHOT_BYTES
){
 if(!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>MAX_PRIVATE_SNAPSHOT_BYTES)
  throw Error("Invalid snapshot size limit");
 let size=0;
 const hash=createHash("sha256");
 for await(const chunk of source){
  if(!(chunk instanceof Uint8Array)||chunk.length===0)continue;
  size+=chunk.byteLength;
  if(size>maxBytes)throw Error("Snapshot exceeds permitted size");
  hash.update(chunk);
 }
 if(!size)throw Error("Empty snapshot");
 return {sha256:hash.digest("hex"),bytes:size};
}
