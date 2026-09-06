-- CreateEnum
CREATE TYPE "ClinicInstructionTerminology" AS ENUM ('AFTERCARE', 'POST_TREATMENT', 'POST_PROCEDURE', 'POST_OPERATIVE', 'RECOVERY');

-- CreateEnum
CREATE TYPE "ClinicThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- AlterTable
ALTER TABLE "ClinicProfile"
ADD COLUMN "instructionTerminology" "ClinicInstructionTerminology" NOT NULL DEFAULT 'AFTERCARE',
ADD COLUMN "themeMode" "ClinicThemeMode" NOT NULL DEFAULT 'SYSTEM',
ADD COLUMN "allowPatientThemeToggle" BOOLEAN NOT NULL DEFAULT false;
