import LegalPage from "./LegalPage";
import { getPublishedLegal, type LegalSlug } from "../../lib/content/legal";
export default async function ManagedLegalPage({ slug, fallback }: { slug: LegalSlug; fallback: React.ReactNode }) {
 const published = await getPublishedLegal(slug);
 if (!published) return <>{fallback}</>;
 const { content, version } = published;
 return <LegalPage kicker="Legal & transparency" title={content.title} intro={content.introduction}>
  <section><p style={{whiteSpace:"pre-wrap"}}>{content.body}</p></section>
  <p><small>Effective date: {content.effectiveDate} · Version {version}</small></p>
 </LegalPage>;
}
