import type {Metadata} from "next";
import SectionLanding from "../../components/editorial/SectionLanding";
import {sections} from "../../lib/editorial/sections";
const data=sections.services;
export const metadata:Metadata={title:"Services | Find what's worth it",description:data.intro,alternates:{canonical:"/services"}};
export default function Page(){return <SectionLanding data={data}/>;}
