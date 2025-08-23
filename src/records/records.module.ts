// src/records/records.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RecordsService } from './records.service';
import { RecordsRepository } from './records.repository';
import { RecordsItemsController } from './records.items.controller';
import { RecordsCollectionController } from './records.collection.controller';
import { RECORDS_SERVICE } from './records.service.interface';
import { RECORDS_REPOSITORY } from './records.repository.interface'; // add this export in the interface if you don't have it

@Module({
  imports: [PrismaModule],
  controllers: [RecordsCollectionController, RecordsItemsController],
  providers: [
    // concrete classes
    RecordsRepository,
    RecordsService,

    // repository tokens (support both Symbol and string)
    { provide: RECORDS_REPOSITORY, useExisting: RecordsRepository },
    { provide: 'IRecordsRepository', useExisting: RecordsRepository },

    // service tokens (support both Symbol and string)
    { provide: RECORDS_SERVICE, useExisting: RecordsService },
    { provide: 'IRecordsService', useExisting: RecordsService },
  ],
  exports: [
    RECORDS_REPOSITORY,
    'IRecordsRepository',
    RECORDS_SERVICE,
    'IRecordsService',
  ],
})
export class RecordsModule {}