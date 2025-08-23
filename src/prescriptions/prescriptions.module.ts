// src/prescriptions/prescriptions.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsRepository } from './prescriptions.repository';
import { PrescriptionItemsRepository } from './prescription-items.repository';
import { PrescriptionItemsCollectionController } from './prescription-items.collection.controller';
import { PrescriptionItemsItemsController } from './prescription-items.items.controller';
import { PRESCRIPTIONS_SERVICE } from './prescriptions.service.interface';
import { PrescriptionsCollectionController } from './prescriptions.collection.controller';
import { PrescriptionsItemsController } from './prescriptions.items.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    PrescriptionItemsCollectionController,
    PrescriptionItemsItemsController,
    PrescriptionsCollectionController,
    PrescriptionsItemsController,
  ],
  providers: [
    PrescriptionsRepository,
    PrescriptionItemsRepository,
    PrescriptionsService,
    { provide: 'IPrescriptionsRepository',     useExisting: PrescriptionsRepository },
    { provide: 'IPrescriptionItemsRepository', useExisting: PrescriptionItemsRepository },
    { provide: PRESCRIPTIONS_SERVICE,          useExisting: PrescriptionsService }, // own it here
  ],
  exports: [PRESCRIPTIONS_SERVICE],
})
export class PrescriptionsModule {}