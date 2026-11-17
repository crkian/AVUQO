/** Fresh Tyres UK feed normalization. Never infer fitting or tyre approval. */
import {collectAwinImages,selectAwinPrimaryImage} from "./collect-images.mjs";
import {normalizeAwinAvailability} from "./stock-availability.mjs";
const TRACKING_PUBLISHER="3135746";
export function verifiedTyresUkRow(headers,values){
 if(!Array.isArray(headers)||!Array.isArray(values)||values.length!==headers.length)return null;
 const row=Object.fromEntries(headers.map((name,i)=>[name,String(values[i]??"").trim()]));
 if(row.merchant_id!=="12715"||!row.merchant_product_id||row.merchant_product_id.length>250||
  !row.product_name||row.product_name.length>500||row.currency!=="GBP"||
  !/^(?:[0-9]{1,6})(?:\.[0-9]{1,2})?$/.test(row.search_price))return null;
 const price=Number(row.search_price);if(!(price>0&&price<=100000))return null;
 const availability=normalizeAwinAvailability(row,"awin-csv").value
   .toLowerCase().replace(/[\s-]+/g,"_");
 if(!["in_stock","available","low_stock"].includes(availability))return null;
 const link=row.aw_deep_link??"";
 try{
  const u=new URL(link);
  if(u.protocol!=="https:"||!["awin1.com","www.awin1.com"].includes(u.hostname)||
    u.username||u.password||u.port||link.length>2400||
    !((u.pathname==="/pclick.php"&&u.searchParams.get("m")==="12715"&&
      u.searchParams.get("a")===TRACKING_PUBLISHER&&!!u.searchParams.get("p"))||
      (u.pathname==="/cread.php"&&u.searchParams.get("awinmid")==="12715"&&
      u.searchParams.get("awinaffid")===TRACKING_PUBLISHER)))return null;
 }catch{return null;}
 const images=collectAwinImages(row,"93988");
 const primary=selectAwinPrimaryImage(images)?.url;
 if(!primary||!/^(https:\/\/)(static[.]tyres[.]net|images2[.]productserve[.]com)\//.test(primary))return null;
 return {sku:row.merchant_product_id,title:row.product_name,price,
   link,image:primary,stock:availability,images};
}
