import type {Metadata} from "next";
import LifestyleLanding from "../../components/lifestyle/LifestyleLanding";
import {feedDepartmentPages} from "../../lib/lifestyle/feed-department-data";
const config=feedDepartmentPages["chocolate-gifts"];
export const metadata:Metadata={title:"Chocolate & Gifts | AVUQO",description:"Explore chocolate, gift boxes, hampers and occasion treats. Check sizes, allergens, delivery and source evidence.",alternates:{canonical:"/chocolate-gifts"}};
export default function ChocolateGiftsPage(){return <LifestyleLanding config={config}/>;}
