import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { PAYMENTS_SERVICE, IPaymentsService } from './payments.service.interface';
import { PaymentItemResponseDto } from './dto/payment-item-response.dto';
import { UpdatePaymentItemDto } from './dto/update-payment-item.dto';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('payment-items')
@ApiBearerAuth()
@Controller('payment-items')
export class PaymentItemsItemsController {
  constructor(@Inject(PAYMENTS_SERVICE) private readonly service: IPaymentsService) {}

  @Get(':id')
  @Can('PaymentItem', 'read')
  @ApiOkResponse({ type: PaymentItemResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findItemById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch(':id')
  @Can('PaymentItem', 'update')
  @ApiOkResponse({ type: PaymentItemResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentItemDto, @Req() req: any) {
    return this.service.updateItem(id, req.user.id, dto);
  }

  @Delete(':id')
  @Can('PaymentItem', 'delete')
  @ApiOkResponse({ description: 'Deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteItem(id);
  }
}