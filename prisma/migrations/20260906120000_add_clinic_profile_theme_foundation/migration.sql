-- CreateEnum
CREATE TYPE "ClinicRadiusPreset" AS ENUM ('SHARP', 'MEDIUM', 'SOFT');

-- AlterTable
ALTER TABLE "ClinicProfile" ADD COLUMN "neutralColor" TEXT,
ADD COLUMN "radiusPreset" "ClinicRadiusPreset" NOT NULL DEFAULT 'MEDIUM';
