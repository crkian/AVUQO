import { connection } from "next/server";
import Link from "next/link";
import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../lib/supabase/server";
import UploadForm from "./UploadForm";
import ReviewDashboard from "./ReviewDashboard";

/** Private feed review. Never implies network approval or public publication. */
export default async function FeedImportsPage({
  searchParams
}: {searchParams:Promise<{import?:string}>}) {
  await connection();
  await requireControlCentreAccess();
  const supabase=await createClient();
  const {data:runs,error}=await supabase.from("feed_import_runs")
    .select("id,created_at,filename,merchant_name,total_count,review_count,excluded_count,permission_status")
    .order("created_at",{ascending:false}).limit(20);

  const query=await searchParams;
  const selected=(runs??[]).find(r=>r.id===query.import)??runs?.[0]??null;
  const pages=selected ? await Promise.all([
    supabase.from("feed_import_records")
      .select("id,title,price,currency,status,reasons,merchant_product_id,brand,category,review_decision,review_notes,image_url")
      .eq("import_id",selected.id).order("created_at",{ascending:true}).range(0,999),
    supabase.from("feed_import_records")
      .select("id,title,price,currency,status,reasons,merchant_product_id,brand,category,review_decision,review_notes,image_url")
      .eq("import_id",selected.id).order("created_at",{ascending:true}).range(1000,1999)
  ]) : [];
  const records=pages.flatMap(p=>p.data??[]);
  const recordsError=pages.find(p=>p.error)?.error;

  return <main style={{display:"grid",gap:24,maxWidth:1220,paddingBottom:40}}>
    <header>
      <p style={{color:"#6545d6",fontWeight:750,letterSpacing:1,fontSize:12}}>SOURCES / PRIVATE IMPORTS</p>
      <h1 style={{fontSize:30,margin:"8px 0"}}>Product feed review</h1>
      <p style={{color:"#62627a"}}>All imported merchant feeds can be reviewed privately. Category suggestions are editorial organisation only. Rights and prices remain unverified until explicitly cleared.</p>
    </header>
    <UploadForm/>
    {error && <p role="alert">Import history unavailable: {error.message}</p>}
    <section>
      <h2 style={{marginBottom:12}}>Select an imported merchant feed</h2>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
        {(runs??[]).map(run=><Link key={run.id} href={`/control-centre/feed-imports?import=${run.id}`}
          aria-current={run.id===selected?.id?"page":undefined}
          style={{padding:"9px 13px",borderRadius:12,border:"1px solid #d9d4e8",
            background:run.id===selected?.id?"#eae4fb":"white",color:"#34284f",fontSize:13,fontWeight:700}}>
          {run.merchant_name} · {new Date(run.created_at).toLocaleDateString("en-GB")}
        </Link>)}
      </div>
      <div style={{overflowX:"auto",border:"1px solid #e3e2eb",borderRadius:12,background:"white"}}>
        <table style={{borderCollapse:"collapse",width:"100%",minWidth:680,fontSize:14}}>
          <thead><tr>{["Date","Merchant","Received","Review","Excluded","Rights"].map(h=>
            <th key={h} style={{padding:14,borderBottom:"1px solid #eee",textAlign:"left",background:"#f7f6fb"}}>{h}</th>)}</tr></thead>
          <tbody>{(runs??[]).map(run=><tr key={run.id} style={{background:run.id===selected?.id?"#f7f4ff":"white"}}>
            <td style={{padding:12,borderBottom:"1px solid #eee"}}>{new Date(run.created_at).toLocaleString("en-GB")}</td>
            <td style={{padding:12,borderBottom:"1px solid #eee"}}><Link href={`/control-centre/feed-imports?import=${run.id}`}>{run.merchant_name}</Link></td>
            <td style={{padding:12,borderBottom:"1px solid #eee"}}>{run.total_count}</td>
            <td style={{padding:12,borderBottom:"1px solid #eee"}}>{run.review_count}</td>
            <td style={{padding:12,borderBottom:"1px solid #eee"}}>{run.excluded_count}</td>
            <td style={{padding:12,borderBottom:"1px solid #eee"}}>{run.permission_status}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
    {recordsError && <p role="alert">Review records unavailable. Check permissions or database service.</p>}
    {selected&&!recordsError&&<ReviewDashboard
      key={selected.id} runName={selected.merchant_name}
      initialRecords={records} totalCount={selected.total_count}/>}
    <p style={{color:"#6c6880",fontSize:13}}>Private review decisions never publish products, establish rights, or activate affiliate links. Import counts can include repeated uploads; only merchant-authorised, deduplicated records may enter the live pipeline later.</p>
    <Link href="/control-centre/sources">← Back to sources</Link>
  </main>;
}
