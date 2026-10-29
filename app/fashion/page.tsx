import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.fashion;
export const metadata:Metadata = {title:"Fashion | Find what's worth it",description:config.intro,alternates:{canonical:"/fashion"}};
export default function FashionPage(){return <LifestyleLanding config={config}/>;}
