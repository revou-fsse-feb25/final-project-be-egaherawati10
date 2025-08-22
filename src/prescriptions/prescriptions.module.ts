import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { PrescriptionsRepository } from './prescriptions.repository';
import { PrescriptionItemsRepository } from './prescription-items.repository';
import { PrescriptionsService } from './prescriptions.service';
import { PRESCRIPTIONS_SERVICE } from './prescriptions.service.interface';

import { PrescriptionsCollectionController } from './prescriptions.collection.controller';
import { PrescriptionsItemsController } from './prescriptions.items.controller';
import { PrescriptionItemsCollectionController } from './prescription-items.collection.controller';
import { PrescriptionItemsItemsController } from './prescription-items.items.controller';

@Module({
  controllers: [
    PrescriptionsCollectionController,
    PrescriptionsItemsController,
    PrescriptionItemsCollectionController,
    PrescriptionItemsItemsController,
  ],
  providers: [
    PrismaService,
    PrescriptionsRepository,
    PrescriptionItemsRepository,
    PrescriptionsService,
    { provide: 'IPrescriptionsRepository', useExisting: PrescriptionsRepository },
    { provide: 'IPrescriptionItemsRepository', useExisting: PrescriptionItemsRepository },
    { provide: PRESCRIPTIONS_SERVICE, useExisting: PrescriptionsService },
  ],
  exports: [PRESCRIPTIONS_SERVICE],
})
export class PrescriptionsModule {}