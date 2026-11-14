import {isBrandSlug} from "./policy.ts";
import {nextEditorialRun} from "./editorial-automation-policy.ts";

/** Validates a stored rule before any claim or draft write.
 * No side effects and no permission to publish. */
export function editorialRulePreflight(rule:{
 brand_slug:string;platform:string;cadence_days:number;
 next_run_at:string;created_by:string|null
}, now:Date):string {
 if(!isBrandSlug(rule.brand_slug))throw Error("Unknown editorial brand");
 if(!["facebook","instagram"].includes(rule.platform))throw Error("Unsupported editorial draft channel");
 if(!rule.created_by)throw Error("Editorial owner identity missing");
 const due=Date.parse(rule.next_run_at);
 if(!Number.isFinite(due)||due>now.getTime())throw Error("Editorial rule is not currently due");
 return nextEditorialRun(now,rule.cadence_days);
}
