import type { Metadata } from "next";
import PlanningCollectionPage from "../../components/collections/PlanningCollectionPage";
export const metadata: Metadata = { title:"My wishlist | AVUQO", robots:{index:false,follow:false} };
export default function WishlistPage(){return <PlanningCollectionPage kind="wishlist"/>;}
