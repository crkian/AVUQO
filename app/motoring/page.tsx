import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.motoring;
export const metadata:Metadata = {title:"Motoring | Find what's worth it",description:config.intro,alternates:{canonical:"/motoring"}};
export default function MotoringPage(){return <LifestyleLanding config={config}/>;}
