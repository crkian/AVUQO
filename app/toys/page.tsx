import type { Metadata } from "next";
import EditorialCategoryPage from "../../components/category/EditorialCategoryPage";
import { categoryPages } from "../../lib/editorial-category-pages";

const category=categoryPages["toys"];
export const metadata: Metadata = {
  title: `${category.label} | Explore worthwhile ideas`,
  description: category.intro,
  alternates: { canonical: "/toys" },
};
export default function ToysPage() { return <EditorialCategoryPage slug="toys"/>; }
