/**
 * Feed inventory recognition is separate from product ingestion and release.
 * All accepted programme feeds are retained, including unknown schemas.
 * Labels below are a routing recommendation, NEVER commercial permissions.
 */
export type AwinRecognition="retail_physical"|"large_retail"|"specialist_tyres"|"contract_or_service"|"format_review";
const supported=new Set([
 "77952:103580","77952:109051","77952:109652","77952:119210",
 "31539:74135","736:48599","45747:F1356","101445:F5142","101445:96428"
]);
const services=new Set(["118401","128157","25022","37738","3496","23296","36276","115559"]);
export function recognizeAwinFeed(input:{
 advertiserId:string;feedId:string;feedFormat:string;feedName:string;listedProducts:number
}):{kind:AwinRecognition;next:string;schemaStatus:"known_adapter"|"needs_schema_probe"|"specialist_adapter"}{
 const {advertiserId:id,feedId,feedFormat,feedName}=input;
 const key=id+":"+feedId;
 if(id==="12715"||id==="15236")
  return {kind:"specialist_tyres",schemaStatus:"specialist_adapter",
   next:"Tyre size, load, speed, fitment and delivered/fitted quote verification"};
 if(id==="31539"&&feedId!=="74135"||
    services.has(id)||/\b(?:contract|sim only|e-?sim|parking|insurance|certificate|energy|epc)\b/i.test(feedName))
  return {kind:"contract_or_service",schemaStatus:"specialist_adapter",
   next:"Contract, terms, duration and service quote adapter"};
 if(id==="496")
  return {kind:"large_retail",schemaStatus:"specialist_adapter",
   next:"Tooled Up streamed/snapshot importer and duplicate-aware catalog matching"};
 if(supported.has(key))
  return {kind:"retail_physical",schemaStatus:"known_adapter",
   next:"Download and validate privately; quarantine unknown header variants"};
 if(["awin","standard","google"].includes(feedFormat.toLowerCase()))
  return {kind:"format_review",schemaStatus:"needs_schema_probe",
   next:"Recognised accepted feed; inspect actual header before selecting adapter"};
 return {kind:"format_review",schemaStatus:"needs_schema_probe",
  next:"Recognised accepted feed; identify format, then route to specialist adapter"};
}
