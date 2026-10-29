import type { Metadata } from "next";
import EditorialCategoryPage from "../../components/category/EditorialCategoryPage";
import { categoryPages } from "../../lib/editorial-category-pages";

const category=categoryPages["fashion"];
export const metadata: Metadata = {
  title: `${category.label} | Explore worthwhile ideas`,
  description: category.intro,
  alternates: { canonical: "/fashion" },
};
export default function FashionPage() { return <EditorialCategoryPage slug="fashion"/>; }
