import { JsonLd } from "@/app/(marketing)/components/json-ld";
import { MarketingLegalDocument } from "@/app/(marketing)/components/marketing-legal-document";
import { MarketingShell } from "@/app/(marketing)/components/marketing-shell";
import { TERMS_DOCUMENT } from "@/lib/legal/terms";
import { marketingPublicLinks } from "@/lib/marketing/public-links";
import {
  generateMarketingMetadata,
  loadMarketingJsonLd,
} from "@/lib/seo/marketing-page";

export const generateMetadata = () => generateMarketingMetadata("/terms");

export default async function MarketingTermsPage() {
  const [{ staffHref }, jsonLd] = await Promise.all([
    marketingPublicLinks(),
    loadMarketingJsonLd("/terms"),
  ]);

  return (
    <MarketingShell currentPath="/terms" staffHref={staffHref}>
      <JsonLd data={jsonLd} />
      <main>
        <MarketingLegalDocument document={TERMS_DOCUMENT} />
      </main>
    </MarketingShell>
  );
}
