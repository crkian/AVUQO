import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.gifts;
export const metadata:Metadata = {title:"Gifts | Find what's worth it",description:config.intro,alternates:{canonical:"/gifts"}};
export default function GiftsPage(){return <LifestyleLanding config={config}/>;}
