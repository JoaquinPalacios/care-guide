-- CreateEnum
CREATE TYPE "ProcedureSessionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PatientDisplayMode" AS ENUM ('CALM', 'STANDARD', 'DETAILED');

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureSession" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "procedureTemplateId" TEXT NOT NULL,
    "selectedAreaOptionId" TEXT,
    "status" "ProcedureSessionStatus" NOT NULL DEFAULT 'DRAFT',
    "displayToken" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionStageState" (
    "id" TEXT NOT NULL,
    "procedureSessionId" TEXT NOT NULL,
    "currentStageTemplateId" TEXT,
    "currentStageStartedAt" TIMESTAMP(3),
    "initializedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionStageState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDisplayPreferences" (
    "id" TEXT NOT NULL,
    "procedureSessionId" TEXT NOT NULL,
    "mode" "PatientDisplayMode" NOT NULL DEFAULT 'STANDARD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientDisplayPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureSessionStageOverride" (
    "id" TEXT NOT NULL,
    "procedureSessionId" TEXT NOT NULL,
    "procedureStageTemplateId" TEXT NOT NULL,
    "title" TEXT,
    "calmCopy" TEXT,
    "patientCopy" TEXT,
    "detailedCopy" TEXT,
    "durationHint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureSessionStageOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Room_clinicId_isActive_idx" ON "Room"("clinicId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Room_clinicId_slug_key" ON "Room"("clinicId", "slug");

-- CreateIndex
CREATE INDEX "Doctor_clinicId_isActive_idx" ON "Doctor"("clinicId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_clinicId_slug_key" ON "Doctor"("clinicId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureSession_displayToken_key" ON "ProcedureSession"("displayToken");

-- CreateIndex
CREATE INDEX "ProcedureSession_clinicId_status_idx" ON "ProcedureSession"("clinicId", "status");

-- CreateIndex
CREATE INDEX "ProcedureSession_roomId_status_idx" ON "ProcedureSession"("roomId", "status");

-- CreateIndex
CREATE INDEX "ProcedureSession_doctorId_idx" ON "ProcedureSession"("doctorId");

-- CreateIndex
CREATE INDEX "ProcedureSession_procedureTemplateId_idx" ON "ProcedureSession"("procedureTemplateId");

-- CreateIndex
CREATE INDEX "ProcedureSession_selectedAreaOptionId_idx" ON "ProcedureSession"("selectedAreaOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionStageState_procedureSessionId_key" ON "SessionStageState"("procedureSessionId");

-- CreateIndex
CREATE INDEX "SessionStageState_currentStageTemplateId_idx" ON "SessionStageState"("currentStageTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDisplayPreferences_procedureSessionId_key" ON "PatientDisplayPreferences"("procedureSessionId");

-- CreateIndex
CREATE INDEX "ProcedureSessionStageOverride_procedureStageTemplateId_idx" ON "ProcedureSessionStageOverride"("procedureStageTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureSessionStageOverride_procedureSessionId_procedureS_key" ON "ProcedureSessionStageOverride"("procedureSessionId", "procedureStageTemplateId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSession" ADD CONSTRAINT "ProcedureSession_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSession" ADD CONSTRAINT "ProcedureSession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSession" ADD CONSTRAINT "ProcedureSession_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSession" ADD CONSTRAINT "ProcedureSession_procedureTemplateId_fkey" FOREIGN KEY ("procedureTemplateId") REFERENCES "ProcedureTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSession" ADD CONSTRAINT "ProcedureSession_selectedAreaOptionId_fkey" FOREIGN KEY ("selectedAreaOptionId") REFERENCES "ProcedureTemplateSelectedAreaOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionStageState" ADD CONSTRAINT "SessionStageState_procedureSessionId_fkey" FOREIGN KEY ("procedureSessionId") REFERENCES "ProcedureSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionStageState" ADD CONSTRAINT "SessionStageState_currentStageTemplateId_fkey" FOREIGN KEY ("currentStageTemplateId") REFERENCES "ProcedureStageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDisplayPreferences" ADD CONSTRAINT "PatientDisplayPreferences_procedureSessionId_fkey" FOREIGN KEY ("procedureSessionId") REFERENCES "ProcedureSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSessionStageOverride" ADD CONSTRAINT "ProcedureSessionStageOverride_procedureSessionId_fkey" FOREIGN KEY ("procedureSessionId") REFERENCES "ProcedureSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureSessionStageOverride" ADD CONSTRAINT "ProcedureSessionStageOverride_procedureStageTemplateId_fkey" FOREIGN KEY ("procedureStageTemplateId") REFERENCES "ProcedureStageTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
