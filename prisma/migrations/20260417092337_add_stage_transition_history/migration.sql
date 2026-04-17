-- CreateEnum
CREATE TYPE "ProcedureSessionStageTransitionDirection" AS ENUM ('NEXT', 'PREVIOUS');

-- CreateTable
CREATE TABLE "ProcedureSessionStageTransition" (
    "id" TEXT NOT NULL,
    "procedureSessionId" TEXT NOT NULL,
    "direction" "ProcedureSessionStageTransitionDirection" NOT NULL,
    "fromStageTemplateId" TEXT,
    "toStageTemplateId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcedureSessionStageTransition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcedureSessionStageTransition_procedureSessionId_occurred_idx" ON "ProcedureSessionStageTransition"("procedureSessionId", "occurredAt");

-- AddForeignKey
ALTER TABLE "ProcedureSessionStageTransition" ADD CONSTRAINT "ProcedureSessionStageTransition_procedureSessionId_fkey" FOREIGN KEY ("procedureSessionId") REFERENCES "ProcedureSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
