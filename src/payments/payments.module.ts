import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsRepository } from './payments.repository';
import { PaymentItemsRepository } from './payment-items.repository';
import { PaymentsService } from './payments.service';
import { PAYMENTS_SERVICE } from './payments.service.interface';

import { PaymentsCollectionController } from './payments.collection.controller';
import { PaymentsItemsController } from './payments.items.controller';
import { PaymentItemsCollectionController } from './payment-items.collection.controller';
import { PaymentItemsItemsController } from './payment-items.items.controller';

@Module({
  controllers: [
    PaymentsCollectionController,
    PaymentsItemsController,
    PaymentItemsCollectionController,
    PaymentItemsItemsController,
  ],
  providers: [
    PrismaService,
    PaymentsRepository,
    PaymentItemsRepository,
    PaymentsService,
    { provide: 'IPaymentsRepository', useExisting: PaymentsRepository },
    { provide: 'IPaymentItemsRepository', useExisting: PaymentItemsRepository },
    { provide: PAYMENTS_SERVICE, useExisting: PaymentsService },
  ],
  exports: [PAYMENTS_SERVICE],
})
export class PaymentsModule {}