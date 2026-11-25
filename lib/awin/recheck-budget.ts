/** Bounded opt-in throughput tuning; no new cron or publication permission. */
export function awinRecheckLimit(value:unknown):number {
 if(typeof value!=="string"||!/^\d{1,2}$/.test(value))return 20;
 const n=Number(value);return n>=1&&n<=50?n:20;
}
export function awinCanonicalLimit(value:number|undefined):number {
 return typeof value==="number"&&Number.isInteger(value)&&value>=1?Math.min(value,50):20;
}
