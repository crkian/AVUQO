import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.home;
export const metadata:Metadata = {title:"Home & Living | Find what's worth it",description:config.intro,alternates:{canonical:"/home"}};
export default function HomePage(){return <LifestyleLanding config={config}/>;}
