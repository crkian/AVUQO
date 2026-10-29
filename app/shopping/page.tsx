import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.shopping;
export const metadata:Metadata = {title:"Shopping | Find what's worth it",description:config.intro,alternates:{canonical:"/shopping"}};
export default function ShoppingPage(){return <LifestyleLanding config={config}/>;}
