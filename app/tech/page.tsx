import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.tech;
export const metadata:Metadata = {title:"Technology | Find what's worth it",description:config.intro,alternates:{canonical:"/tech"}};
export default function TechPage(){return <LifestyleLanding config={config}/>;}
