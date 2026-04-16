-- CreateTable
CREATE TABLE "ProcedureTemplate" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureStageTemplate" (
    "id" TEXT NOT NULL,
    "procedureTemplateId" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "calmCopy" TEXT NOT NULL,
    "patientCopy" TEXT NOT NULL,
    "detailedCopy" TEXT NOT NULL,
    "illustrationUrl" TEXT,
    "defaultDurationHint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureStageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureTemplateSelectedAreaOption" (
    "id" TEXT NOT NULL,
    "procedureTemplateId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureTemplateSelectedAreaOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcedureTemplate_clinicId_isActive_idx" ON "ProcedureTemplate"("clinicId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureTemplate_clinicId_slug_key" ON "ProcedureTemplate"("clinicId", "slug");

-- CreateIndex
CREATE INDEX "ProcedureStageTemplate_procedureTemplateId_idx" ON "ProcedureStageTemplate"("procedureTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureStageTemplate_procedureTemplateId_stageOrder_key" ON "ProcedureStageTemplate"("procedureTemplateId", "stageOrder");

-- CreateIndex
CREATE INDEX "ProcedureTemplateSelectedAreaOption_procedureTemplateId_isA_idx" ON "ProcedureTemplateSelectedAreaOption"("procedureTemplateId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureTemplateSelectedAreaOption_procedureTemplateId_key_key" ON "ProcedureTemplateSelectedAreaOption"("procedureTemplateId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureTemplateSelectedAreaOption_procedureTemplateId_sor_key" ON "ProcedureTemplateSelectedAreaOption"("procedureTemplateId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProcedureTemplate" ADD CONSTRAINT "ProcedureTemplate_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureStageTemplate" ADD CONSTRAINT "ProcedureStageTemplate_procedureTemplateId_fkey" FOREIGN KEY ("procedureTemplateId") REFERENCES "ProcedureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureTemplateSelectedAreaOption" ADD CONSTRAINT "ProcedureTemplateSelectedAreaOption_procedureTemplateId_fkey" FOREIGN KEY ("procedureTemplateId") REFERENCES "ProcedureTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
