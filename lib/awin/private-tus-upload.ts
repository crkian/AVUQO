const TUS_CHUNK_SIZE=6*1024*1024;
const MAX_TUS_FILE_BYTES=250*1024*1024;

export function privateStorageTusEndpoint(supabaseUrl:string){
 const base=new URL(supabaseUrl);
 if(base.protocol!=="https:"||base.username||base.password||base.port||
    !/^[a-z0-9-]+\.supabase\.co$/.test(base.hostname)||base.pathname!=="/")
  throw Error("invalid_storage_origin");
 return new URL("/storage/v1/upload/resumable",base);
}
function b64(value:string){
 return Buffer.from(value,"utf8").toString("base64");
}
/**
 * Supabase's server-side TUS protocol: 6 MiB chunks, no upsert.
 * The server must have already authenticated/authorised the selected feed,
 * read its bounded bytes and derived the immutable SHA-256 object key.
 * Never return upload locations or credentials to clients.
 */
export async function uploadPrivateAwinTus(
 bytes:Uint8Array,
 objectKey:string,
 supabaseUrl:string,
 storageKey:string,
 fetcher:typeof fetch=fetch
){
 if(!bytes.length||bytes.byteLength>MAX_TUS_FILE_BYTES||
    !/^awin\/496\/89987\/[a-f0-9]{64}\.csv\.gz$/.test(objectKey)||
    !storageKey||storageKey.length<16)
  throw Error("invalid_private_tus_upload");
 const endpoint=privateStorageTusEndpoint(supabaseUrl);
 const auth={"authorization":`Bearer ${storageKey}`,"apikey":storageKey,
  "Tus-Resumable":"1.0.0"};
 const metadata={
  bucketName:"awin-bulk-private-snapshots",
  objectName:objectKey,contentType:"application/gzip",cacheControl:"0"
 };
 const uploadMetadata=Object.entries(metadata)
  .map(([name,value])=>`${name} ${b64(value)}`).join(",");
 const initiated=await fetcher(endpoint,{method:"POST",redirect:"error",
  signal:AbortSignal.timeout(30000),
  headers:{...auth,"Upload-Length":String(bytes.byteLength),
   "Upload-Metadata":uploadMetadata}
 });
 if(initiated.status!==201)throw Error("private_tus_creation_failed");
 const location=initiated.headers.get("location");
 if(!location)throw Error("private_tus_missing_location");
 const uploadUrl=new URL(location,endpoint);
 if(uploadUrl.origin!==endpoint.origin||
    !uploadUrl.pathname.startsWith("/storage/v1/upload/resumable/")||
    uploadUrl.username||uploadUrl.password)
  throw Error("private_tus_unsafe_location");
 let offset=0;
 while(offset<bytes.byteLength){
  const end=Math.min(offset+TUS_CHUNK_SIZE,bytes.byteLength);
  const response=await fetcher(uploadUrl,{method:"PATCH",redirect:"error",
   signal:AbortSignal.timeout(60000),
   headers:{...auth,"Content-Type":"application/offset+octet-stream",
    "Upload-Offset":String(offset)},
   body:Buffer.from(bytes.buffer,bytes.byteOffset+offset,end-offset)
  });
  if(response.status!==204)throw Error("private_tus_chunk_failed");
  const next=Number(response.headers.get("upload-offset"));
  if(!Number.isSafeInteger(next)||next!==end)throw Error("private_tus_offset_mismatch");
  offset=next;
 }
 return {bytes_uploaded:offset,chunk_count:Math.ceil(offset/TUS_CHUNK_SIZE)};
}
