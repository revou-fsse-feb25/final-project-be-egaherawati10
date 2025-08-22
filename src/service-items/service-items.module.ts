import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServiceItemsService } from './service-items.service';
import { ServiceItemsRepository } from './service-items.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    ServiceItemsRepository,
    ServiceItemsService,
    { provide: 'IServiceItemsRepository', useExisting: ServiceItemsRepository }, // ⬅️ bind token
    { provide: 'IServiceItemsService', useExisting: ServiceItemsService },       // optional export token
  ],
  exports: ['IServiceItemsService'], // if other modules/controllers need the service
  controllers: [/* your controllers that use @Inject('IServiceItemsService') */],
})
export class ServiceItemsModule {}