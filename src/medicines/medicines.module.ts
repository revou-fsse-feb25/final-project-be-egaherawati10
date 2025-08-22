import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';
import { MedicinesRepository } from './medicines.repository';
import { MEDICINES_SERVICE } from './medicines.service.interface';

@Module({
  controllers: [MedicinesController],
  providers: [
    PrismaService,
    MedicinesRepository,
    MedicinesService,
    { provide: 'IMedicinesRepository', useExisting: MedicinesRepository },
    { provide: MEDICINES_SERVICE, useExisting: MedicinesService },
  ],
  exports: [MEDICINES_SERVICE],
})
export class MedicinesModule {}