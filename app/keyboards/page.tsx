import type {Metadata} from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import {feedDepartmentPages} from "../../lib/lifestyle/feed-department-data";
const config=feedDepartmentPages.keyboards;
export const metadata:Metadata={title:"Mechanical Keyboards & Accessories | AVUQO",description:"Explore mechanical keyboards, switches, keycaps and layouts with practical buying guidance and verified-source boundaries.",alternates:{canonical:"/keyboards"}};
export default function KeyboardsPage(){return <LifestyleLanding config={config}/>;}
