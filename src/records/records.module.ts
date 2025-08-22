import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RecordsService } from './records.service';
import { RecordsRepository } from './records.repository';
import { RecordsItemsController } from './records.items.controller';
import { RecordsCollectionController } from './records.collection.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    RecordsRepository,
    RecordsService,
    { provide: 'IRecordsRepository', useExisting: RecordsRepository },
    { provide: 'IRecordsService', useExisting: RecordsService },
  ],
  exports: ['IRecordsRepository', 'IRecordsService'],
  controllers: [
    RecordsCollectionController,
    RecordsItemsController
  ],
})
export class RecordsModule {}