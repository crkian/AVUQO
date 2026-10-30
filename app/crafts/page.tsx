import type {Metadata} from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import {feedDepartmentPages} from "../../lib/lifestyle/feed-department-data";
const config=feedDepartmentPages.crafts;
export const metadata:Metadata={title:"Crafts & Hobbies | AVUQO",description:"Explore Crystal Art, craft kits, flower making, papercraft and tools. Thoughtful guides, with no unverified merchant prices.",alternates:{canonical:"/crafts"}};
export default function CraftsPage(){return <LifestyleLanding config={config}/>;}
