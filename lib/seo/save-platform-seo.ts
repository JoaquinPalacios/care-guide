import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { PLATFORM_SEO_ID, type MarketingPageSeoInput } from "@/lib/seo/types";
import type { ValidatedPlatformSeoInput } from "@/lib/seo/validation";

export async function savePlatformSeoSettings(
  input: ValidatedPlatformSeoInput
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.platformSeoSettings.upsert({
      where: { id: PLATFORM_SEO_ID },
      create: {
        id: PLATFORM_SEO_ID,
        ...input.identity,
      },
      update: input.identity,
    });

    for (const page of input.pages) {
      await upsertMarketingPage(tx, page);
    }
  });
}

async function upsertMarketingPage(
  tx: Prisma.TransactionClient,
  page: MarketingPageSeoInput
): Promise<void> {
  await tx.marketingPageSeo.upsert({
    where: { path: page.path },
    create: {
      path: page.path,
      seoTitle: page.seoTitle,
      metaDescription: page.metaDescription,
      ogTitle: page.ogTitle,
      ogDescription: page.ogDescription,
      ogImagePath: page.ogImagePath,
      index: page.index,
      follow: page.follow,
    },
    update: {
      seoTitle: page.seoTitle,
      metaDescription: page.metaDescription,
      ogTitle: page.ogTitle,
      ogDescription: page.ogDescription,
      ogImagePath: page.ogImagePath,
      index: page.index,
      follow: page.follow,
    },
  });
}
