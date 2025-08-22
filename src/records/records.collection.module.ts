import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecordsRepository } from './records.repository';
import { RecordsService } from './records.service';
import { RecordsCollectionController } from './records.collection.controller';
import { RECORDS_SERVICE } from './records.service.interface';

@Module({
  controllers: [RecordsCollectionController],
  providers: [
    PrismaService,
    RecordsRepository,
    RecordsService,
    { provide: 'IRecordsRepository', useExisting: RecordsRepository },
    { provide: RECORDS_SERVICE, useExisting: RecordsService },
  ],
  exports: [RECORDS_SERVICE],
})
export class RecordsCollectionModule {}