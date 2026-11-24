import {connection} from "next/server";
import {notFound} from "next/navigation";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import OrdinaryProductDetails from "../../../../components/products/OrdinaryProductDetails";
import {readShoppingReleases} from "../../../../lib/products/shopping-release-reader";
// Keep exact offer URLs and decide eligibility before rendering.
export const instant = false;
export const metadata={title:"Verified retail offer | AVUQO",robots:{index:false,follow:true}};
export default async function OfferDetail({params}:{params:Promise<{offerId:string}>}){
 await connection();
 const {offerId}=await params;
 const [offer]=await readShoppingReleases([offerId]);
 if(!offer)notFound();
 return <main><Header/><OrdinaryProductDetails item={offer}/><Footer/></main>;
}
