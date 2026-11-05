/**
 * Planning only: no files are downloaded and no database records are written.
 * Existing private Awin RPCs accept a maximum of 250 rows per chunk.
 */
export const PRIVATE_CHUNK_SIZE=250;
export const MAX_MANUAL_IMPORT_ROWS=500_000;
export const MAX_UNATTENDED_ROWS=5_000;
export function planPrivateAwinChunks(listedRows:number){
 if(!Number.isSafeInteger(listedRows)||listedRows<1||listedRows>MAX_MANUAL_IMPORT_ROWS)
  throw Error("Invalid advertised product count");
 const chunkCount=Math.ceil(listedRows/PRIVATE_CHUNK_SIZE);
 return {
  listed_rows:listedRows,
  chunk_size:PRIVATE_CHUNK_SIZE,
  estimated_chunks:chunkCount,
  last_chunk_rows:listedRows%PRIVATE_CHUNK_SIZE||PRIVATE_CHUNK_SIZE,
  current_worker_row_limit:MAX_UNATTENDED_ROWS,
  within_current_worker_row_limit:listedRows<=MAX_UNATTENDED_ROWS,
  runnable_unattended:false,
  blockers:[
   "No durable server-side feed snapshot and continuation job",
   "No approved large-feed-specific schema and rights validation",
   "No cross-feed identity deduplication or overlap policy",
   "No tested restart and failure recovery for unattended bulk feeds"
  ],
  private_only:true,
  no_product_downloads:true,
  no_database_writes:true,
  no_publication:true
 };
}
