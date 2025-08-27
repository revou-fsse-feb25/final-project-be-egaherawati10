/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `MedicalRecord` will be added. If there are existing duplicate values, this will fail.
  - The required column `code` was added to the `MedicalRecord` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."MedicalRecord" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Medicine" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."ServiceItem" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_code_key" ON "public"."MedicalRecord"("code");

-- CreateIndex
CREATE INDEX "MedicalRecord_deletedAt_idx" ON "public"."MedicalRecord"("deletedAt");

-- CreateIndex
CREATE INDEX "Medicine_deletedAt_idx" ON "public"."Medicine"("deletedAt");

-- CreateIndex
CREATE INDEX "PatientProfile_deletedAt_idx" ON "public"."PatientProfile"("deletedAt");

-- CreateIndex
CREATE INDEX "Payment_deletedAt_idx" ON "public"."Payment"("deletedAt");

-- CreateIndex
CREATE INDEX "Prescription_deletedAt_idx" ON "public"."Prescription"("deletedAt");

-- CreateIndex
CREATE INDEX "Record_deletedAt_idx" ON "public"."Record"("deletedAt");

-- CreateIndex
CREATE INDEX "Service_deletedAt_idx" ON "public"."Service"("deletedAt");

-- CreateIndex
CREATE INDEX "ServiceItem_deletedAt_idx" ON "public"."ServiceItem"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."Medicine" ADD CONSTRAINT "Medicine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Medicine" ADD CONSTRAINT "Medicine_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceItem" ADD CONSTRAINT "ServiceItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceItem" ADD CONSTRAINT "ServiceItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
