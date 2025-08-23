
import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ServiceItemsRepository } from "./service-items.repository";
import { ServiceItemsService } from "./service-items.service";
import { SERVICE_ITEMS_SERVICE } from "./service-items.service.interface";
import { ServiceItemsController } from "./service-items.controller";

@Module({
  imports: [PrismaModule],
  providers: [
    ServiceItemsRepository,
    ServiceItemsService,
    { provide: 'IServiceItemsRepository', useExisting: ServiceItemsRepository },
    { provide: SERVICE_ITEMS_SERVICE, useClass: ServiceItemsService },
  ],
  exports: [SERVICE_ITEMS_SERVICE],
  controllers: [ServiceItemsController], 
})
export class ServiceItemsModule {}