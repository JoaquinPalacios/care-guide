-- Phase 2A: platform operator, optional custom guides, structured timeline
-- ranges, and clinic-owned draft/published practice revisions.
-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('NONE', 'OPERATOR');

-- CreateEnum
CREATE TYPE "PracticeSectionProvenance" AS ENUM ('CANONICAL', 'PRACTICE_OVERRIDE', 'PRACTICE_ADDITION', 'PRACTICE_CUSTOM');

-- AlterTable
ALTER TABLE "GuideTemplateSection" ADD COLUMN     "endDay" INTEGER,
ADD COLUMN     "startDay" INTEGER;

UPDATE "GuideTemplateSection"
SET "startDay" = 0, "endDay" = 0
WHERE "periodLabel" = 'First few hours';

UPDATE "GuideTemplateSection"
SET "startDay" = 1, "endDay" = 1
WHERE "periodLabel" IN ('Today / first 24 hours', 'Today');

UPDATE "GuideTemplateSection"
SET "startDay" = 2, "endDay" = 3
WHERE "periodLabel" IN ('Days 2–3', 'Days 2-3');

UPDATE "GuideTemplateSection"
SET "startDay" = 4, "endDay" = 7
WHERE "periodLabel" IN ('Days 4–7', 'Days 4-7');

-- AlterTable
ALTER TABLE "PracticeGuide" ADD COLUMN "title" TEXT,
ALTER COLUMN "guideTemplateId" DROP NOT NULL,
ALTER COLUMN "pinnedRevisionId" DROP NOT NULL;

UPDATE "PracticeGuide" AS guide
SET "title" = template."title"
FROM "GuideTemplate" AS template
WHERE guide."guideTemplateId" = template."id"
  AND (guide."title" IS NULL OR guide."title" = '');

UPDATE "PracticeGuide"
SET "title" = 'Untitled guide'
WHERE "title" IS NULL OR "title" = '';

ALTER TABLE "PracticeGuide" ALTER COLUMN "title" SET NOT NULL;

ALTER TABLE "PracticeGuide"
ADD CONSTRAINT "PracticeGuide_template_pin_pair_check"
CHECK (
  ("guideTemplateId" IS NULL AND "pinnedRevisionId" IS NULL)
  OR
  ("guideTemplateId" IS NOT NULL AND "pinnedRevisionId" IS NOT NULL)
);

-- AlterTable
ALTER TABLE "PracticeGuideAddition" ADD COLUMN     "endDay" INTEGER,
ADD COLUMN     "startDay" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "platformRole" "PlatformRole" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "PracticeGuideRevision" (
    "id" TEXT NOT NULL,
    "practiceGuideId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "GuideRevisionStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "introduction" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeGuideRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeGuideRevisionSection" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" "GuideSectionKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "periodLabel" TEXT,
    "startDay" INTEGER,
    "endDay" INTEGER,
    "sortOrder" INTEGER NOT NULL,
    "provenance" "PracticeSectionProvenance" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeGuideRevisionSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeGuideRevision_practiceGuideId_status_idx" ON "PracticeGuideRevision"("practiceGuideId", "status");

-- CreateIndex
CREATE INDEX "PracticeGuideRevision_createdByUserId_idx" ON "PracticeGuideRevision"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeGuideRevision_practiceGuideId_version_key" ON "PracticeGuideRevision"("practiceGuideId", "version");

-- CreateIndex
CREATE INDEX "PracticeGuideRevisionSection_revisionId_idx" ON "PracticeGuideRevisionSection"("revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeGuideRevisionSection_revisionId_key_key" ON "PracticeGuideRevisionSection"("revisionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeGuideRevisionSection_revisionId_sortOrder_key" ON "PracticeGuideRevisionSection"("revisionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "PracticeGuideRevision" ADD CONSTRAINT "PracticeGuideRevision_practiceGuideId_fkey" FOREIGN KEY ("practiceGuideId") REFERENCES "PracticeGuide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGuideRevision" ADD CONSTRAINT "PracticeGuideRevision_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeGuideRevisionSection" ADD CONSTRAINT "PracticeGuideRevisionSection_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "PracticeGuideRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuideTemplateSection"
ADD CONSTRAINT "GuideTemplateSection_day_range_check"
CHECK (
  ("startDay" IS NULL AND "endDay" IS NULL)
  OR (
    "startDay" IS NOT NULL
    AND "endDay" IS NOT NULL
    AND "startDay" >= 0
    AND "endDay" >= "startDay"
  )
);

ALTER TABLE "PracticeGuideAddition"
ADD CONSTRAINT "PracticeGuideAddition_day_range_check"
CHECK (
  ("startDay" IS NULL AND "endDay" IS NULL)
  OR (
    "startDay" IS NOT NULL
    AND "endDay" IS NOT NULL
    AND "startDay" >= 0
    AND "endDay" >= "startDay"
  )
);

ALTER TABLE "PracticeGuideRevisionSection"
ADD CONSTRAINT "PracticeGuideRevisionSection_day_range_check"
CHECK (
  ("startDay" IS NULL AND "endDay" IS NULL)
  OR (
    "startDay" IS NOT NULL
    AND "endDay" IS NOT NULL
    AND "startDay" >= 0
    AND "endDay" >= "startDay"
  )
);
