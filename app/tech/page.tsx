import type { Metadata } from "next";
import EditorialCategoryPage from "../../components/category/EditorialCategoryPage";
import { categoryPages } from "../../lib/editorial-category-pages";

const category=categoryPages["tech"];
export const metadata: Metadata = {
  title: `${category.label} | Explore worthwhile ideas`,
  description: category.intro,
  alternates: { canonical: "/tech" },
};
export default function TechPage() { return <EditorialCategoryPage slug="tech"/>; }
