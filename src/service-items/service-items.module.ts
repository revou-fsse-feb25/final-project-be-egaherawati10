import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceItemsRepository } from './service-items.repository';
import { ServiceItemsService } from './service-items.service';
import { ServiceItemsController } from './service-items.controller';
import { SERVICE_ITEMS_SERVICE } from './service-items.service.interface';

@Module({
  controllers: [ServiceItemsController],
  providers: [
    PrismaService,
    ServiceItemsRepository,
    ServiceItemsService,
    { provide: 'IServiceItemsRepository', useExisting: ServiceItemsRepository },
    { provide: SERVICE_ITEMS_SERVICE, useExisting: ServiceItemsService },
  ],
  exports: [SERVICE_ITEMS_SERVICE],
})
export class ServiceItemsModule {}