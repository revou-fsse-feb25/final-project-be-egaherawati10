import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PolicyGuard } from './common/guards/policy.guard';
import { PaymentsModule } from './payments/payments.module';
import { MedicinesModule } from './medicines/medicines.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { ServiceItemsModule } from './service-items/service-items.module';
import { ServicesModule } from './services/services.module';
import { PatientsModule } from './patients/patients.module';
import { MedicalRecordsItemsModule } from './medical-records/medical-records.items.module';
import { MedicalRecordsCollectionModule } from './medical-records/medical-records.collection.module';
import { RecordsItemsModule } from './records/records.items.module';
import { AuthModule } from './auth/auth.module';
import { PatientHubModule } from './patient-hub/patient-hub.module';
import { ConfigModule } from '@nestjs/config';
import { RecordsCollectionModule } from './records/records.collection.module';
import { RecordsModule } from './records/records.module';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 6000,
          limit: 10,
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    MedicalRecordsItemsModule,
    MedicalRecordsCollectionModule,
    RecordsCollectionModule,
    RecordsModule,
    MedicalRecordsItemsModule,
    MedicalRecordsCollectionModule,
    RecordsItemsModule,
    ServicesModule,
    ServiceItemsModule,
    MedicinesModule,
    PrescriptionsModule,
    PaymentsModule,
    PatientHubModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, 
      useClass: JwtAuthGuard 
    },
    { provide: APP_GUARD, 
      useClass: PolicyGuard 
    },
  ],
})
export class AppModule {}