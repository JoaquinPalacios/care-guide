-- CreateEnum
CREATE TYPE "Specialty" AS ENUM ('DENTAL');

-- CreateEnum
CREATE TYPE "GuideRevisionStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PracticeGuideStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "GuideSectionKind" AS ENUM (
  'INTRODUCTION',
  'IMMEDIATE_CARE',
  'FIRST_24_HOURS',
  'RECOVERY_TIMELINE',
  'WHAT_IS_NORMAL',
  'PAIN',
  'RESTRICTIONS',
  'MEDICATIONS',
  'SITE_CARE',
  'WHAT_TO_AVOID',
  'WARNING_SIGNS',
  'CONTACT_PRACTICE',
  'EMERGENCY',
  'CUSTOM'
);

-- Expand: add Clinic.slug as nullable so existing rows are preserved.
ALTER TABLE "Clinic" ADD COLUMN "slug" TEXT;

-- Backfill existing clinics with unique, format-valid slugs.
-- The known demo clinic receives the Phase 1 tenant slug. Any other
-- existing row gets a deterministic slug derived from its id so this
-- migration does not assume a single Clinic row.
UPDATE "Clinic"
SET "slug" = CASE
  WHEN "id" = 'clinic_demo_rivers' THEN 'demodental'
  ELSE 'clinic-' || SUBSTRING(md5("id"), 1, 12)
END
WHERE "slug" IS NULL;

ALTER TABLE "Clinic" ALTER COLUMN "slug" SET NOT NULL;

ALTER TABLE "Clinic"
ADD CONSTRAINT "Clinic_slug_format_check"
CHECK (
  char_length("slug") BETWEEN 3 AND 32
  AND "slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
);

-- CreateTable
CREATE TABLE "ClinicProfile" (
    "clinicId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "accentColor" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "region" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "bookingUrl" TEXT,
    "contactUrl" TEXT,
    "contactEmail" TEXT,
    "emergencyInstructions" TEXT,
    "showCareGuideAttribution" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicProfile_pkey" PRIMARY KEY ("clinicId")
);

-- CreateTable
CREATE TABLE "GuideTemplate" (
    "id" TEXT NOT NULL,
    "specialty" "Specialty" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideTemplateRevision" (
    "id" TEXT NOT NULL,
    "guideTemplateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "GuideRevisionStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideTemplateRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideTemplateSection" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" "GuideSectionKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideTemplateSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeGuide" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "guideTemplateId" TEXT NOT NULL,
    "pinnedRevisionId" TEXT NOT NULL,
    "publicSlug" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "PracticeGuideStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeGuideOverride" (
    "id" TEXT NOT NULL,
    "practiceGuideId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeGuideOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeGuideAddition" (
    "id" TEXT NOT NULL,
    "practiceGuideId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" "GuideSectionKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "insertAfterSectionKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeGuideAddition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuideTemplate_slug_key" ON "GuideTemplate"("slug");

-- CreateIndex
CREATE INDEX "GuideTemplate_specialty_isActive_idx" ON "GuideTemplate"("specialty", "isActive");

-- CreateIndex
CREATE INDEX "GuideTemplateRevision_guideTemplateId_status_idx" ON "GuideTemplateRevision"("guideTemplateId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GuideTemplateRevision_guideTemplateId_version_key" ON "GuideTemplateRevision"("guideTemplateId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "GuideTemplateRevision_id_guideTemplateId_key" ON "GuideTemplateRevision"("id", "guideTemplateId");

-- CreateIndex
CREATE INDEX "GuideTemplateSection_revisionId_idx" ON "GuideTemplateSection"("revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideTemplateSection_revisionId_key_key" ON "GuideTemplateSection"("revisionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "GuideTemplateSection_revisionId_sortOrder_key" ON "GuideTemplateSection"("revisionId", "sortOrder");

-- CreateIndex
CREATE INDEX "PracticeGuide_clinicId_status_isEnabled_idx" ON "PracticeGuide"("clinicId", "status", "isEnabled");

-- CreateIndex
CREATE INDEX "PracticeGuide_guideTemplateId_idx" ON "PracticeGuide"("guideTemplateId");

-- CreateIndex
CREATE INDEX "PracticeGuide_pinnedRevisionId_idx" ON "PracticeGuide"("pinnedRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeGuide_clinicId_guideTemplateId_key" ON "PracticeGuide"("clinicId", "guideTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeGuide_clinicId_publicSlug_key" ON "PracticeGuide"("clinicId", "publicSlug");

-- CreateIndex
CREATE INDEX "PracticeGuideOverride_practiceGuideId_idx" ON "PracticeGuideOverride"("practiceGuideId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeGuideOverride_practiceGuideId_sectionKey_key" ON "PracticeGuideOverride"("practiceGuideId", "sectionKey");

-- CreateIndex
CREATE INDEX "PracticeGuideAddition_practiceGuideId_idx" ON "PracticeGuideAddition"("practiceGuideId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeGuideAddition_practiceGuideId_key_key" ON "PracticeGuideAddition"("practiceGuideId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_slug_key" ON "Clinic"("slug");

-- AddForeignKey
ALTER TABLE "ClinicProfile" ADD CONSTRAINT "ClinicProfile_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideTemplateRevision" ADD CONSTRAINT "GuideTemplateRevision_guideTemplateId_fkey" FOREIGN KEY ("guideTemplateId") REFERENCES "GuideTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideTemplateSection" ADD CONSTRAINT "GuideTemplateSection_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "GuideTemplateRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGuide" ADD CONSTRAINT "PracticeGuide_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGuide" ADD CONSTRAINT "PracticeGuide_guideTemplateId_fkey" FOREIGN KEY ("guideTemplateId") REFERENCES "GuideTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Composite FK: PracticeGuide.guideTemplateId must equal
-- PracticeGuide.pinnedRevision.guideTemplateId.
-- AddForeignKey
ALTER TABLE "PracticeGuide" ADD CONSTRAINT "PracticeGuide_pinnedRevisionId_guideTemplateId_fkey" FOREIGN KEY ("pinnedRevisionId", "guideTemplateId") REFERENCES "GuideTemplateRevision"("id", "guideTemplateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGuideOverride" ADD CONSTRAINT "PracticeGuideOverride_practiceGuideId_fkey" FOREIGN KEY ("practiceGuideId") REFERENCES "PracticeGuide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGuideAddition" ADD CONSTRAINT "PracticeGuideAddition_practiceGuideId_fkey" FOREIGN KEY ("practiceGuideId") REFERENCES "PracticeGuide"("id") ON DELETE CASCADE ON UPDATE CASCADE;
