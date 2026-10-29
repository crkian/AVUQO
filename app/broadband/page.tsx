import type {Metadata} from "next";
import SectionLanding from "../../components/editorial/SectionLanding";
import {sections} from "../../lib/editorial/sections";
const data=sections.broadband;
export const metadata:Metadata={title:"Broadband | Find what's worth it",description:data.intro,alternates:{canonical:"/broadband"}};
export default function Page(){return <SectionLanding data={data}/>;}
