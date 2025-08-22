import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { PAYMENTS_SERVICE, IPaymentsService } from './payments.service.interface';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaginatedPaymentResponseDto, PaymentResponseDto } from './dto/payment-response.dto';
import { Can } from 'src/common/guards/can.decorator';

@ApiTags('medical-records.payments')
@ApiBearerAuth()
@Controller('medical-records/:medicalRecordId/payments')
export class PaymentsCollectionController {
  constructor(@Inject(PAYMENTS_SERVICE) private readonly service: IPaymentsService) {}

  @Get()
  @Can('Payment', 'read')
  @ApiOkResponse({ type: PaginatedPaymentResponseDto })
  list(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Query() q: QueryPaymentDto,
    @Req() req: any,
  ) {
    return this.service.listForMedicalRecord(medicalRecordId, q, { id: req.user.id, role: req.user.role });
  }

  @Post()
  @Can('Payment', 'create')
  @ApiCreatedResponse({ type: PaymentResponseDto })
  create(
    @Param('medicalRecordId', ParseIntPipe) medicalRecordId: number,
    @Body() dto: CreatePaymentDto,
    @Req() req: any,
  ) {
    return this.service.createForMedicalRecord(medicalRecordId, { id: req.user.id, role: req.user.role }, dto);
  }
}