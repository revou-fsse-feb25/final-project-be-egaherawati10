import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { PAYMENTS_SERVICE, IPaymentsService } from './payments.service.interface';
import { CreatePaymentItemDto } from './dto/create-payment-item.dto';
import { PaymentItemResponseDto } from './dto/payment-item-response.dto';
import { Can } from '../common/guards/can.decorator';

class PaginationDto { page?: number = 1; limit?: number = 20; }

@ApiTags('payments.items')
@ApiBearerAuth('jwt')
@Controller('payments/:paymentId/items')
export class PaymentItemsCollectionController {
  constructor(@Inject(PAYMENTS_SERVICE) private readonly service: IPaymentsService) {}

  @Get()
  @Can('PaymentItem', 'read')
  @ApiOkResponse({ description: 'List items for this payment' })
  list(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Query() q: PaginationDto,
    @Req() req: any,
  ) {
    return this.service.listItems(paymentId, q.page ?? 1, q.limit ?? 20, { id: req.user.id, role: req.user.role });
  }

  @Post()
  @Can('PaymentItem', 'create')
  @ApiCreatedResponse({ type: PaymentItemResponseDto })
  add(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() dto: CreatePaymentItemDto,
    @Req() req: any,
  ) {
    return this.service.addItem(paymentId, { id: req.user.id, role: req.user.role }, dto);
  }
}