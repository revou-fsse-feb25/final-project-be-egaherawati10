import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { PAYMENTS_SERVICE, IPaymentsService } from './payments.service.interface';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsItemsController {
  constructor(@Inject(PAYMENTS_SERVICE) private readonly service: IPaymentsService) {}

  @Get(':id')
  @Can('Payment', 'read')
  @ApiOkResponse({ type: PaymentResponseDto })
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.findById(id, { id: req.user.id, role: req.user.role });
  }

  @Patch(':id')
  @Can('Payment', 'update')
  @ApiOkResponse({ type: PaymentResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentDto, @Req() req: any) {
    return this.service.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @Can('Payment', 'delete')
  @ApiOkResponse({ description: 'Soft-deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}