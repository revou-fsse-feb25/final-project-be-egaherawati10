import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { ServicesRepository } from './services.repository';
import { ServiceLinesRepository } from './service-lines.repository';
import { ServicesService } from './services.service';
import { SERVICES_SERVICE } from './services.service.interface';

import { ServicesCollectionController } from './services.collection.controller';
import { ServicesItemsController } from './services.items.controller';
import { ServiceLinesCollectionController } from './service-lines.collection.controller';
import { ServiceLinesItemsController } from './service-lines.items.controller';

@Module({
  controllers: [
    ServicesCollectionController,
    ServicesItemsController,
    ServiceLinesCollectionController,
    ServiceLinesItemsController,
  ],
  providers: [
    PrismaService,
    ServicesRepository,
    ServiceLinesRepository,
    ServicesService,
    { provide: 'IServicesRepository', useExisting: ServicesRepository },
    { provide: 'IServiceLinesRepository', useExisting: ServiceLinesRepository },
    { provide: SERVICES_SERVICE, useExisting: ServicesService },
  ],
  exports: [SERVICES_SERVICE],
})
export class ServicesModule {}