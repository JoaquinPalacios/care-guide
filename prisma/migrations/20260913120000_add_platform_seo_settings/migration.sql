-- Platform SEO identity and per-route marketing metadata.
-- Canonical URLs stay derived from origin + path; this stores editable content fields only.

CREATE TABLE "PlatformSeoSettings" (
    "id" TEXT NOT NULL DEFAULT 'platform',
    "siteName" TEXT NOT NULL,
    "defaultDescription" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "organizationDescription" TEXT NOT NULL,
    "publicContactEmail" TEXT,
    "defaultOgImagePath" TEXT,
    "sameAsUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSeoSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingPageSeo" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImagePath" TEXT,
    "index" BOOLEAN NOT NULL DEFAULT true,
    "follow" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingPageSeo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketingPageSeo_path_key" ON "MarketingPageSeo"("path");
