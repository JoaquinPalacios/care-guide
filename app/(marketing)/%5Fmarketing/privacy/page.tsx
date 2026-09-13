import { JsonLd } from "@/app/(marketing)/components/json-ld";
import { MarketingLegalDocument } from "@/app/(marketing)/components/marketing-legal-document";
import { MarketingShell } from "@/app/(marketing)/components/marketing-shell";
import { PRIVACY_DOCUMENT } from "@/lib/legal/privacy";
import { marketingPublicLinks } from "@/lib/marketing/public-links";
import {
  generateMarketingMetadata,
  loadMarketingJsonLd,
} from "@/lib/seo/marketing-page";

export const generateMetadata = () => generateMarketingMetadata("/privacy");

export default async function MarketingPrivacyPage() {
  const [{ staffHref }, jsonLd] = await Promise.all([
    marketingPublicLinks(),
    loadMarketingJsonLd("/privacy"),
  ]);

  return (
    <MarketingShell currentPath="/privacy" staffHref={staffHref}>
      <JsonLd data={jsonLd} />
      <main>
        <MarketingLegalDocument document={PRIVACY_DOCUMENT} />
      </main>
    </MarketingShell>
  );
}
