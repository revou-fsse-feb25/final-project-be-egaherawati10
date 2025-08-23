import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordsRepository } from './records.repository';
import { RecordsService } from './records.service';
import { RecordsItemsController } from './records.items.controller';
import { RECORDS_SERVICE } from './records.service.interface';

@Module({
  controllers: [RecordsItemsController],
  providers: [
    PrismaService,
    RecordsRepository,
    RecordsService,
    { provide: 'IRecordsRepository', useExisting: RecordsRepository },
    { provide: RECORDS_SERVICE, useExisting: RecordsService },
  ],
  exports: [RECORDS_SERVICE],
})
export class RecordsItemsModule {}