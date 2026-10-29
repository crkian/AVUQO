export function nextEditorialRun(base:Date,days:number) {
 if(!Number.isInteger(days)||days<2||days>14)throw Error("Invalid cadence");
 return new Date(base.getTime()+days*86400000).toISOString();
}
