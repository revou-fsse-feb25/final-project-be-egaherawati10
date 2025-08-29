-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('admin', 'doctor', 'pharmacist', 'cashier', 'patient', 'registration_clerk');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('active', 'suspended');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'paid', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."PrescriptionStatus" AS ENUM ('draft', 'issued', 'dispensed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('cash', 'card', 'insurance', 'transfer');

-- CreateEnum
CREATE TYPE "public"."PaymentItemKind" AS ENUM ('prescription_item', 'service_item');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PatientProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "clerkId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicalRecord" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "clerkId" INTEGER NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Record" (
    "id" SERIAL NOT NULL,
    "medicalRecordId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "planning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Medicine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "manufacturer" TEXT,
    "stock" INTEGER NOT NULL,
    "reorderLevel" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "batchNo" TEXT,
    "expiryDate" TIMESTAMP(3),
    "price" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prescription" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "medicalRecordId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "pharmacistId" INTEGER,
    "patientId" INTEGER NOT NULL,
    "status" "public"."PrescriptionStatus" NOT NULL DEFAULT 'issued',
    "dateIssued" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDispensed" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrescriptionItem" (
    "id" SERIAL NOT NULL,
    "prescriptionId" INTEGER NOT NULL,
    "medicineId" INTEGER NOT NULL,
    "dosage" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "instructions" TEXT,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Service" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "medicalRecordId" INTEGER NOT NULL,
    "status" "public"."ServiceStatus" NOT NULL DEFAULT 'planned',
    "serviceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "ServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceOnServiceItem" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "serviceItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ServiceOnServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "medicalRecordId" INTEGER NOT NULL,
    "patientId" INTEGER NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'pending',
    "method" "public"."PaymentMethod" NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentItem" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "kind" "public"."PaymentItemKind" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "prescriptionItemId" INTEGER,
    "serviceOnServiceItemId" INTEGER,

    CONSTRAINT "PaymentItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "public"."User"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "public"."PatientProfile"("userId");

-- CreateIndex
CREATE INDEX "PatientProfile_gender_idx" ON "public"."PatientProfile"("gender");

-- CreateIndex
CREATE INDEX "PatientProfile_phone_idx" ON "public"."PatientProfile"("phone");

-- CreateIndex
CREATE INDEX "PatientProfile_clerkId_idx" ON "public"."PatientProfile"("clerkId");

-- CreateIndex
CREATE INDEX "PatientProfile_deletedAt_idx" ON "public"."PatientProfile"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_code_key" ON "public"."MedicalRecord"("code");

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_visitDate_idx" ON "public"."MedicalRecord"("patientId", "visitDate");

-- CreateIndex
CREATE INDEX "MedicalRecord_doctorId_visitDate_idx" ON "public"."MedicalRecord"("doctorId", "visitDate");

-- CreateIndex
CREATE INDEX "MedicalRecord_deletedAt_idx" ON "public"."MedicalRecord"("deletedAt");

-- CreateIndex
CREATE INDEX "Record_medicalRecordId_idx" ON "public"."Record"("medicalRecordId");

-- CreateIndex
CREATE INDEX "Record_patientId_idx" ON "public"."Record"("patientId");

-- CreateIndex
CREATE INDEX "Record_doctorId_idx" ON "public"."Record"("doctorId");

-- CreateIndex
CREATE INDEX "Record_deletedAt_idx" ON "public"."Record"("deletedAt");

-- CreateIndex
CREATE INDEX "Medicine_type_idx" ON "public"."Medicine"("type");

-- CreateIndex
CREATE INDEX "Medicine_expiryDate_idx" ON "public"."Medicine"("expiryDate");

-- CreateIndex
CREATE INDEX "Medicine_deletedAt_idx" ON "public"."Medicine"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_name_dosage_key" ON "public"."Medicine"("name", "dosage");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_code_key" ON "public"."Prescription"("code");

-- CreateIndex
CREATE INDEX "Prescription_patientId_dateIssued_idx" ON "public"."Prescription"("patientId", "dateIssued");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "public"."Prescription"("status");

-- CreateIndex
CREATE INDEX "Prescription_medicalRecordId_idx" ON "public"."Prescription"("medicalRecordId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_idx" ON "public"."Prescription"("doctorId");

-- CreateIndex
CREATE INDEX "Prescription_pharmacistId_idx" ON "public"."Prescription"("pharmacistId");

-- CreateIndex
CREATE INDEX "Prescription_status_dateDispensed_idx" ON "public"."Prescription"("status", "dateDispensed");

-- CreateIndex
CREATE INDEX "Prescription_deletedAt_idx" ON "public"."Prescription"("deletedAt");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "public"."PrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_medicineId_idx" ON "public"."PrescriptionItem"("medicineId");

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionItem_prescriptionId_medicineId_key" ON "public"."PrescriptionItem"("prescriptionId", "medicineId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_code_key" ON "public"."Service"("code");

-- CreateIndex
CREATE INDEX "Service_patientId_serviceDate_idx" ON "public"."Service"("patientId", "serviceDate");

-- CreateIndex
CREATE INDEX "Service_medicalRecordId_idx" ON "public"."Service"("medicalRecordId");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "public"."Service"("status");

-- CreateIndex
CREATE INDEX "Service_doctorId_status_idx" ON "public"."Service"("doctorId", "status");

-- CreateIndex
CREATE INDEX "Service_deletedAt_idx" ON "public"."Service"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceItem_name_key" ON "public"."ServiceItem"("name");

-- CreateIndex
CREATE INDEX "ServiceItem_price_idx" ON "public"."ServiceItem"("price");

-- CreateIndex
CREATE INDEX "ServiceItem_deletedAt_idx" ON "public"."ServiceItem"("deletedAt");

-- CreateIndex
CREATE INDEX "ServiceOnServiceItem_serviceId_idx" ON "public"."ServiceOnServiceItem"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceOnServiceItem_serviceItemId_idx" ON "public"."ServiceOnServiceItem"("serviceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOnServiceItem_serviceId_serviceItemId_key" ON "public"."ServiceOnServiceItem"("serviceId", "serviceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_code_key" ON "public"."Payment"("code");

-- CreateIndex
CREATE INDEX "Payment_patientId_issuedAt_idx" ON "public"."Payment"("patientId", "issuedAt");

-- CreateIndex
CREATE INDEX "Payment_status_method_idx" ON "public"."Payment"("status", "method");

-- CreateIndex
CREATE INDEX "Payment_medicalRecordId_idx" ON "public"."Payment"("medicalRecordId");

-- CreateIndex
CREATE INDEX "Payment_deletedAt_idx" ON "public"."Payment"("deletedAt");

-- CreateIndex
CREATE INDEX "PaymentItem_paymentId_idx" ON "public"."PaymentItem"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentItem_prescriptionItemId_idx" ON "public"."PaymentItem"("prescriptionItemId");

-- CreateIndex
CREATE INDEX "PaymentItem_serviceOnServiceItemId_idx" ON "public"."PaymentItem"("serviceOnServiceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentItem_paymentId_prescriptionItemId_key" ON "public"."PaymentItem"("paymentId", "prescriptionItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentItem_paymentId_serviceOnServiceItemId_key" ON "public"."PaymentItem"("paymentId", "serviceOnServiceItemId");

-- AddForeignKey
ALTER TABLE "public"."PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PatientProfile" ADD CONSTRAINT "PatientProfile_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Medicine" ADD CONSTRAINT "Medicine_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Medicine" ADD CONSTRAINT "Medicine_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "public"."Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "public"."Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceItem" ADD CONSTRAINT "ServiceItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceItem" ADD CONSTRAINT "ServiceItem_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceOnServiceItem" ADD CONSTRAINT "ServiceOnServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceOnServiceItem" ADD CONSTRAINT "ServiceOnServiceItem_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES "public"."ServiceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_prescriptionItemId_fkey" FOREIGN KEY ("prescriptionItemId") REFERENCES "public"."PrescriptionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_serviceOnServiceItemId_fkey" FOREIGN KEY ("serviceOnServiceItemId") REFERENCES "public"."ServiceOnServiceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
