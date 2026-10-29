import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.toys;
export const metadata:Metadata = {title:"Toys & Play | Find what's worth it",description:config.intro,alternates:{canonical:"/toys"}};
export default function ToysPage(){return <LifestyleLanding config={config}/>;}
