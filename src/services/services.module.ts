// src/services/services.module.ts  (or services.collection.module.ts if that’s where the controller is)
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ServicesCollectionController } from './services.collection.controller';
import { ServicesService } from './services.service';
import { ServicesRepository } from './services.repository';
import { ServiceLinesRepository } from './service-lines.repository';
import { SERVICES_SERVICE } from './services.service.interface';

@Module({
  imports: [PrismaModule],
  controllers: [ServicesCollectionController],
  providers: [
    // concrete classes
    ServicesRepository,
    ServiceLinesRepository,
    ServicesService,
    // interface tokens
    { provide: 'IServicesRepository', useExisting: ServicesRepository },
    { provide: 'IServiceLinesRepository', useExisting: ServiceLinesRepository },
    { provide: SERVICES_SERVICE, useExisting: ServicesService },
  ],
  exports: [SERVICES_SERVICE],
})
export class ServicesModule {}