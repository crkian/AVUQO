import type { Metadata } from "next";
import {Suspense} from "react";
import PartnerPromoShelf from "../../components/partners/PartnerPromoShelf";
import PartnerLinkShelf from "../../components/partners/PartnerLinkShelf";
import RetailerSales from "../../components/promotions/RetailerSales";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import ShoppingDepartmentShelf from "../../components/shopping/ShoppingDepartmentShelf";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.shopping;
export const metadata:Metadata = {title:"Shopping | Find what's worth it",description:config.intro,alternates:{canonical:"/shopping"}};
export default function ShoppingPage(){return <LifestyleLanding config={config} afterTrust={<><Suspense fallback={null}><RetailerSales placement="category"/></Suspense><Suspense fallback={null}><PartnerPromoShelf placement="shopping"/></Suspense><PartnerLinkShelf kind="shopping"/><ShoppingDepartmentShelf/></>}/>;}
