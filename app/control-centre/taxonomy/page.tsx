import {connection} from "next/server";
import {createAdminClient} from "../../../lib/supabase/admin";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import Explorer from "./TaxonomyExplorer";
import styles from "../control-centre.module.css";

export const instant=false;
export default async function TaxonomyPage(){
 await connection();
 await requireControlCentreAccess();
 // Use server-only credentials AFTER permission check. Public SELECT RLS intentionally
 // hides inactive categories from ordinary clients; never expose the admin key.
 const db=createAdminClient();
 const [first,second]=await Promise.all([
  db.from("categories").select("id,slug,name,parent_id,is_active").order("slug").range(0,999),
  db.from("categories").select("id,slug,name,parent_id,is_active").order("slug").range(1000,1999)
 ]);
 if(first.error||second.error)return <div className={styles.panel} role="alert">
  Taxonomy unavailable. Private category records could not be loaded.
 </div>;
 const categories=[...(first.data??[]),...(second.data??[])];
 return <div>
  <div className={styles.pageHead}>
   <div><p className={styles.eyebrow}>Product Data / Internal taxonomy</p>
   <h1>Category catalogue</h1>
   <p className={styles.sub}>All existing and staged departments, searchable without activating them.
    A category is not a product listing, an authorised merchant feed or a live price.</p></div>
  </div>
  <Explorer categories={categories}/>
  <p className={styles.callout}>Private read-only review. Activation and product mapping
   need separate rights checks, owner approval and a reviewed deployment. This screen
   cannot publish imported products or affiliate links.</p>
 </div>;
}
