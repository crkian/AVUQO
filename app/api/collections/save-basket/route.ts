import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { isSameOriginWrite, parseBasketName } from "../../../../lib/collections/requests";
import { isSafeSnapshot, safeProductUrl } from "../../../../lib/collections/planning";

export const runtime="nodejs";

export async function POST(request: Request) {
  if (!isSameOriginWrite(request)) return NextResponse.json({error:"Invalid request origin or content type."},{status:403});
  if (Number(request.headers.get("content-length")??0)>1024) return NextResponse.json({error:"Request too large."},{status:413});
  const db=await createClient();
  const {data:auth,error:authError}=await db.auth.getUser();
  if (authError||!auth.user)return NextResponse.json({error:"Sign in to save a basket."},{status:401});
  const name=parseBasketName(await request.json().catch(()=>null));
  if(!name)return NextResponse.json({error:"Name must contain 3 to 80 characters."},{status:400});

  const admin=createAdminClient(),owner=auth.user.id;
  const {data:basket,error:basketError}=await admin.from("shared_lists")
    .select("id").eq("owner_id",owner).eq("list_type","basket").eq("visibility","private").maybeSingle();
  if(basketError||!basket)return NextResponse.json({error:"Your basket was not found."},{status:404});
  const {data:items,error:itemsError}=await admin.from("shared_list_items")
    .select("product_id,item_key,title_override,snapshot").eq("list_id",basket.id)
    .order("created_at",{ascending:true}).limit(201);
  if(itemsError||!items?.length)return NextResponse.json({error:"Your basket has no items."},{status:409});
  if(items.length>200)return NextResponse.json({error:"Only 200 items can be copied at once."},{status:409});

  // Refuse malformed historical snapshots. Never trust client-provided prices or URLs.
  const copies=items.map(item=>{
    const shot=isSafeSnapshot(item.snapshot)?item.snapshot:null;
    if(!shot||shot.kind!=="basket"||!item.item_key?.startsWith("offer:"))return null;
    return {added_by:owner,product_id:item.product_id,
      item_key:item.item_key,title_override:item.title_override?.slice(0,180)??"Saved item",
      url:safeProductUrl(shot.product_slug),snapshot:shot};
  });
  if(copies.some(item=>!item))return NextResponse.json({error:"The basket contains an invalid old item. Recheck or remove it first."},{status:409});

  const {data:named,error:createError}=await admin.from("shared_lists")
    .insert({owner_id:owner,list_type:"standard",visibility:"private",name,
      description:"Private saved basket copy. Captured offer prices are historical snapshots."})
    .select("id").single();
  if(createError||!named)return NextResponse.json({error:"Could not save this group."},{status:500});

  const {error:copyError}=await admin.from("shared_list_items")
    .insert(copies.map(item=>({...item!,list_id:named.id})));
  if(copyError){
    // Referential cascade cleans up any partial insert. Never report success before all items exist.
    await admin.from("shared_lists").delete().eq("id",named.id).eq("owner_id",owner);
    return NextResponse.json({error:"Could not copy the complete basket."},{status:500});
  }
  return NextResponse.json({ok:true,listId:named.id},{status:201});
}
