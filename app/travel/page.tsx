import type { Metadata } from "next";
import {Suspense} from "react";
import PartnerPromoShelf from "../../components/partners/PartnerPromoShelf";
import PartnerLinkShelf from "../../components/partners/PartnerLinkShelf";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.travel;
export const metadata:Metadata = {title:"Travel | Find what's worth it",description:config.intro,alternates:{canonical:"/travel"}};
export default function TravelPage(){return <LifestyleLanding config={config} afterTrust={<><Suspense fallback={null}><PartnerPromoShelf placement="travel"/></Suspense><PartnerLinkShelf kind="travel"/></>}/>;}
