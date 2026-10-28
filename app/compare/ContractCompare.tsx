"use client";

import { useMemo, useState } from "react";
import { calculateContractTotal } from "../../lib/comparison/contract-cost";

type Plan = { label: string; months: number; introMonths: number; intro: number; later: number; upfront: number; fees: number; credit: number };
const initial: Plan[] = [
  { label: "Option A", months: 24, introMonths: 6, intro: 20, later: 35, upfront: 25, fees: 10, credit: 30 },
  { label: "Option B", months: 24, introMonths: 0, intro: 29, later: 29, upfront: 0, fees: 0, credit: 0 },
];
const money = (pence: number) => new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(pence/100);
function calculate(plan: Plan) {
  return calculateContractTotal({
    minimumTermMonths: plan.months,
    periods: plan.introMonths > 0 && plan.introMonths < plan.months
      ? [{months:plan.introMonths,monthlyPence:Math.round(plan.intro*100)},{months:plan.months-plan.introMonths,monthlyPence:Math.round(plan.later*100)}]
      : [{months:plan.months,monthlyPence:Math.round(plan.later*100)}],
    upfrontPence:Math.round(plan.upfront*100),oneOffFeesPence:Math.round(plan.fees*100),oneOffCreditsPence:Math.round(plan.credit*100),
  });
}
export default function ContractCompare() {
  const [sector,setSector] = useState("Broadband");
  const [plans,setPlans] = useState(initial);
  const results = useMemo(()=> plans.map(p=>{try{return {value:calculate(p),error:null};}catch(e){return {value:null,error:e instanceof Error?e.message:"Invalid input"};}}),[plans]);
  const best = results.every(r=>r.value) ? results[0].value!.totalPence <= results[1].value!.totalPence ? 0 : 1 : -1;
  function set(index:number,key:keyof Plan,value:string) {
    setPlans(old=>old.map((p,i)=>i!==index?p:{...p,[key]:key==="label"?value:Number(value)}));
  }
  return <div className="cc-wrap">
    <div className="cc-intro"><span className="cc-kicker">Compare the true cost</span><h1>Contracts without the small-print fog.</h1><p>Compare two mobile, broadband or TV offers over their full minimum term, not just the headline monthly price. Edit every field using figures from actual provider terms.</p><div className="cc-types">{["Mobile & SIM","Broadband","TV & streaming"].map(s=><button type="button" className={sector===s?"selected":""} onClick={()=>setSector(s)} key={s}>{s}</button>)}</div></div>
    <div className="cc-grid">{plans.map((p,i)=><section className="cc-plan" key={i}><h2>{p.label}</h2><div className="cc-fields"><label>Option name<input value={p.label} onChange={e=>set(i,"label",e.target.value)} /></label>{([
      ["months","Contract months"],["introMonths","Introductory months"],["intro","Intro monthly £"],["later","Standard monthly £"],["upfront","Upfront £"],["fees","Additional fees £"],["credit","Credits £"],
    ] as [keyof Plan,string][]).map(([k,label])=><label key={k}>{label}<input type="number" min="0" step={k==="months"||k==="introMonths"?"1":"0.01"} value={p[k]} onChange={e=>set(i,k,e.target.value)}/></label>)}</div><div className="cc-result">{results[i].value?<><span>Total minimum-term cost</span><strong>{money(results[i].value.totalPence)}</strong><p>Effective cost: {money(results[i].value.effectiveMonthlyPence)}/month</p><p>Recurring: {money(results[i].value.undiscountedRecurringPence)} · Charges: {money(results[i].value.feePence)} · Credits: {money(results[i].value.creditPence)}</p>{best===i&&<span className="cc-cheaper">Lower total among these two inputs</span>}</>:<p role="alert">{results[i].error}</p>}</div></section>)}</div>
    {best!==-1&&<div className="cc-difference"><strong>{plans[best].label} is {money(Math.abs(results[0].value!.totalPence-results[1].value!.totalPence))} cheaper over the entered minimum term.</strong><p>This comparison reflects only the figures entered above, not a recommendation or a verified provider quote.</p></div>}
    <section className="cc-notes"><h2>What AVUQO still needs to verify</h2><p>Availability by address or postcode, service speed and data limits, annual price increases, installation costs, equipment return fees, roaming, eligibility and provider terms. Do not assume a future increase is zero: if the provider has not disclosed enough information to build the full schedule, the calculated total may understate the eventual bill.</p><p><b>Sample inputs are fictional demonstrations, not live provider offers.</b> AVUQO does not currently have authorised telecom, broadband or TV price feeds connected.</p></section>
  </div>;
}
