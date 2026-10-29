import type { Metadata } from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import { lifestylePages } from "../../lib/lifestyle/landing-data";
const config = lifestylePages.experiences;
export const metadata:Metadata = {title:"Experiences | Find what's worth it",description:config.intro,alternates:{canonical:"/experiences"}};
export default function ExperiencesPage(){return <LifestyleLanding config={config}/>;}
