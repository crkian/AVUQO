import type { Metadata } from "next";
import EditorialCategoryPage from "../../components/category/EditorialCategoryPage";
import { categoryPages } from "../../lib/editorial-category-pages";

const category=categoryPages["travel"];
export const metadata: Metadata = {
  title: `${category.label} | Explore worthwhile ideas`,
  description: category.intro,
  alternates: { canonical: "/travel" },
};
export default function TravelPage() { return <EditorialCategoryPage slug="travel"/>; }
