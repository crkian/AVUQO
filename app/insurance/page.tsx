import type {Metadata} from "next";
import SectionLanding from "../../components/editorial/SectionLanding";
import {sections} from "../../lib/editorial/sections";
const data=sections.insurance;
export const metadata:Metadata={title:"Insurance | Find what's worth it",description:data.intro,alternates:{canonical:"/insurance"}};
export default function Page(){return <SectionLanding data={data}/>;}
