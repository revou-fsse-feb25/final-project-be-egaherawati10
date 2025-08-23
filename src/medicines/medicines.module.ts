import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MedicinesService } from './medicines.service';
import { MedicinesRepository } from './medicines.repository';
import { MedicinesController } from './medicines.controller';
import { MEDICINES_SERVICE } from './medicines.service.interface';

@Module({
  imports: [PrismaModule],
  controllers: [MedicinesController],
  providers: [
    MedicinesService,
    MedicinesRepository,
    { provide: 'IMedicinesRepository', useClass: MedicinesRepository },
    { provide: MEDICINES_SERVICE, useExisting: MedicinesService },
  ],
  exports: [
    'IMedicinesRepository', MEDICINES_SERVICE,
  ],
})
export class MedicinesModule {}