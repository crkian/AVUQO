import type { Metadata } from "next";
import PlanningCollectionPage from "../../components/collections/PlanningCollectionPage";
export const metadata: Metadata = { title:"My comparison basket | AVUQO", robots:{index:false,follow:false} };
export default function BasketPage(){return <PlanningCollectionPage kind="basket"/>;}
