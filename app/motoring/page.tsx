import type {Metadata} from "next";
import SectionLanding from "../../components/editorial/SectionLanding";
import {sections} from "../../lib/editorial/sections";
const data=sections.motoring;
export const metadata:Metadata={title:"Motoring | Find what's worth it",description:data.intro,alternates:{canonical:"/motoring"}};
export default function Page(){return <SectionLanding data={data}/>;}
