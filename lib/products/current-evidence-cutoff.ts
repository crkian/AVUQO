import "server-only";
/** Request-time evidence window, invoked only after connection and owner auth. */
export async function currentEvidenceCutoff():Promise<string>{return new Date(Date.now()-48*3600_000).toISOString();}
