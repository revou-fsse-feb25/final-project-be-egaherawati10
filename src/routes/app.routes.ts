import { Routes } from '@nestjs/core';

// Patients
import { PatientsModule } from 'src/patients/patients.module';
import { PatientHubModule } from 'src/patient-hub/patient-hub.module';

// Medical Records split: collection (nested under patient) vs canonical items
import { MedicalRecordsCollectionModule } from 'src/medical-records/medical-records.collection.module';
import { MedicalRecordsItemsModule } from 'src/medical-records/medical-records.items.module';

// Clinical workflows mounted both nested (under MR) and canonical
import { ServicesModule } from 'src/services/services.module';
import { PrescriptionsModule } from 'src/prescriptions/prescriptions.module';
import { PaymentsModule } from 'src/payments/payments.module';

// Catalogs / master data
import { ServiceItemsModule } from 'src/service-items/service-items.module';
import { MedicinesModule } from 'src/medicines/medicines.module';

// Users (admin)
import { UsersModule } from 'src/users/users.module';

export const appRoutes: Routes = [
  // /patients and nested
  {
    path: 'patients',
    children: [
      // canonical patient CRUD: /patients
      { path: '', module: PatientsModule },

      // nested under a specific patient
      {
        path: ':patientId',
        children: [
          // patient hub (read-focused): /patients/:patientId/services, /patients/:patientId/payments
          { path: '', module: PatientHubModule },

          // patient's medical records collection: /patients/:patientId/medical-records
          { path: 'medical-records', module: MedicalRecordsCollectionModule },
        ],
      },
    ],
  },

  // canonical medical-record items: /medical-records/:id
  { path: 'medical-records', module: MedicalRecordsItemsModule },

  // nested clinical routes under a medical record:
  // /medical-records/:medicalRecordId/services
  { path: 'medical-records/:medicalRecordId/services', module: ServicesModule },

  // /medical-records/:medicalRecordId/prescriptions
  { path: 'medical-records/:medicalRecordId/prescriptions', module: PrescriptionsModule },

  // /medical-records/:medicalRecordId/payments
  { path: 'medical-records/:medicalRecordId/payments', module: PaymentsModule },

  // canonical clinical routes
  { path: 'services', module: ServicesModule },
  { path: 'prescriptions', module: PrescriptionsModule },
  { path: 'payments', module: PaymentsModule },

  // catalogs
  { path: 'service-items', module: ServiceItemsModule },
  { path: 'medicines', module: MedicinesModule },

  // admin/users
  { path: 'users', module: UsersModule },
];