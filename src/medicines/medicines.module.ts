// src/medicines/medicines.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';
import { MedicinesRepository } from './medicines.repository';
import { MEDICINES_SERVICE } from './medicines.service.interface';

@Module({
  imports: [PrismaModule],
  controllers: [MedicinesController],
  providers: [
    MedicinesRepository,
    MedicinesService,
    { provide: 'IMedicinesRepository', useExisting: MedicinesRepository },
    { provide: MEDICINES_SERVICE, useExisting: MedicinesService },
  ],
  exports: [MEDICINES_SERVICE],
})
export class MedicinesModule {}