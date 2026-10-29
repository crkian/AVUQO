import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.travel;
export const metadata:Metadata = {title:"Travel | Find what's worth it",description:config.intro,alternates:{canonical:"/travel"}};
export default function TravelPage(){return <LifestyleLanding config={config}/>;}
