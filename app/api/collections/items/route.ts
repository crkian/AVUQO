import { NextResponse } from "next/server";
import { verifiedProduct } from "../../../../lib/products/public-catalog";
import { parseCollectionRequest, isSameOriginWrite } from "../../../../lib/collections/requests";
import { safeProductUrl } from "../../../../lib/collections/planning";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";


/** An account-scoped server save. Direct client inserts into planning lists are blocked by RLS. */
export async function POST(request: Request) {
  if (!isSameOriginWrite(request)) return NextResponse.json({error:"Invalid request origin or content type."},{status:403});
  if (Number(request.headers.get("content-length") ?? 0)>2048) return NextResponse.json({error:"Request too large."},{status:413});

  const db = await createClient();
  const {data:auth,error:authError}=await db.auth.getUser();
  if (authError || !auth.user) return NextResponse.json({error:"Sign in to save this offer."},{status:401});

  const body=parseCollectionRequest(await request.json().catch(()=>null));
  if (!body) return NextResponse.json({error:"Invalid product selection."},{status:400});

  // The browser supplies identifiers only. A current licensed public offer is required
  // for both collections. This deliberately refuses removed, stale or unapproved offers.
  const verified=await verifiedProduct(body.productSlug);
  if (!verified || verified.product.id!==body.productId) {
    return NextResponse.json({error:"This product is not currently verified for saving."},{status:409});
  }
  const selected=verified.offers.find(x=>x.offer.id===body.offerId && x.offer.product_id===body.productId);
  if (!selected) return NextResponse.json({error:"This retailer offer is unavailable or expired. Recheck the product."},{status:409});

  const price=Number(selected.offer.total_price??selected.offer.price);
  if (!Number.isFinite(price) || price<=0) return NextResponse.json({error:"No verified offer price is available."},{status:409});
  const merchant=selected.published.merchant;
  if (!merchant || typeof merchant!=="string") return NextResponse.json({error:"Merchant unavailable."},{status:409});

  const admin=createAdminClient();
  const userId=auth.user.id;
  let {data:list,error:listError}=await admin.from("shared_lists")
    .select("id").eq("owner_id",userId).eq("list_type",body.kind).eq("visibility","private")
    .order("created_at",{ascending:true}).limit(1).maybeSingle();
  if (listError) return NextResponse.json({error:"Could not open your private collection."},{status:500});

  if (!list) {
    const {data:newList,error:createError}=await admin.from("shared_lists")
      .insert({owner_id:userId,list_type:body.kind,name:body.kind==="basket"?"My comparison basket":"My wishlist",visibility:"private"})
      .select("id").single();
    if (createError?.code==="23505") {
      const retry=await admin.from("shared_lists").select("id").eq("owner_id",userId)
        .eq("list_type",body.kind).eq("visibility","private").maybeSingle();
      list=retry.data; listError=retry.error;
    } else {
      list=newList;listError=createError;
    }
    if (listError || !list) return NextResponse.json({error:"Could not create your private collection."},{status:500});
  }

  const itemKey=body.kind==="wishlist" ? `product:${body.productId}` : `offer:${body.offerId}`;
  const {count,error:countError}=await admin.from("shared_list_items")
    .select("id",{head:true,count:"exact"}).eq("list_id",list.id);
  if (countError) return NextResponse.json({error:"Could not check your collection."},{status:500});
  // Existing items remain idempotently saveable even when the collection is full.
  if ((count??0)>=200) {
    const existing=await admin.from("shared_list_items").select("id").eq("list_id",list.id).eq("item_key",itemKey).limit(1).maybeSingle();
    if(existing.error)return NextResponse.json({error:"Could not check this item."},{status:500});
    if(existing.data)return NextResponse.json({ok:true,alreadySaved:true});
    return NextResponse.json({error:"This collection has reached its 200-item limit."},{status:409});
  }
  const {error:insertError}=await admin.from("shared_list_items").insert({
    list_id:list.id,added_by:userId,product_id:body.productId,item_key:itemKey,
    title_override:verified.product.canonical_title.slice(0,180),
    url:safeProductUrl(verified.product.slug),
    snapshot:{
      kind:body.kind,product_slug:verified.product.slug,offer_id:selected.offer.id,
      merchant:merchant.slice(0,120),price_gbp:price,
      captured_at:new Date().toISOString(),
      offer_checked_at:selected.offer.last_seen_at,
      provenance:"verified_offer_at_save",
    },
  });
  if (insertError?.code==="23505") return NextResponse.json({ok:true,alreadySaved:true});
  if (insertError) return NextResponse.json({error:"Could not save this item."},{status:500});
  return NextResponse.json({ok:true,alreadySaved:false},{status:201});
}
