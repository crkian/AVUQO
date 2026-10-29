import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.beauty;
export const metadata:Metadata = {title:"Beauty & Wellbeing | Find what's worth it",description:config.intro,alternates:{canonical:"/beauty"}};
export default function BeautyPage(){return <LifestyleLanding config={config}/>;}
