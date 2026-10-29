import type { Metadata } from "next";
import EditorialCategoryPage from "../../components/category/EditorialCategoryPage";
import { categoryPages } from "../../lib/editorial-category-pages";

const category=categoryPages["home"];
export const metadata: Metadata = {
  title: `${category.label} | Explore worthwhile ideas`,
  description: category.intro,
  alternates: { canonical: "/home" },
};
export default function HomePage() { return <EditorialCategoryPage slug="home"/>; }
