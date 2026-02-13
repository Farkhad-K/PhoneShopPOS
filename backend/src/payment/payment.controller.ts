import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './services/payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApplyPaymentDto } from './dto/apply-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { Roles } from 'src/auth/decorators';
import { Role } from 'src/common/enums/enum';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @ApiOperation({ summary: 'Create a new payment record' })
  @ApiResponse({
    status: 201,
    description: 'Payment created successfully',
    type: PaymentResponseDto,
  })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'Returns all payments',
    type: [PaymentResponseDto],
  })
  async findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns payment details',
    type: PaymentResponseDto,
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @Post('customer/:customerId/apply')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @ApiOperation({
    summary: 'Apply customer payment using FIFO algorithm',
    description:
      'Automatically distributes payment across oldest unpaid sales. Returns payment record and affected sales.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment applied successfully',
  })
  async applyCustomerPayment(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Body() applyPaymentDto: ApplyPaymentDto,
  ) {
    return this.paymentService.applyCustomerPayment(customerId, applyPaymentDto);
  }

  @Post('supplier/:supplierId/apply')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({
    summary: 'Apply supplier payment using FIFO algorithm',
    description:
      'Automatically distributes payment across oldest unpaid purchases. Returns payment record and affected purchases.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment applied successfully',
  })
  async applySupplierPayment(
    @Param('supplierId', ParseIntPipe) supplierId: number,
    @Body() applyPaymentDto: ApplyPaymentDto,
  ) {
    return this.paymentService.applySupplierPayment(supplierId, applyPaymentDto);
  }

  @Get('customer/:customerId')
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @ApiOperation({ summary: 'Get all payments for a customer' })
  @ApiResponse({
    status: 200,
    description: 'Returns customer payment history',
    type: [PaymentResponseDto],
  })
  async findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.paymentService.findByCustomer(customerId);
  }

  @Get('supplier/:supplierId')
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Get all payments for a supplier' })
  @ApiResponse({
    status: 200,
    description: 'Returns supplier payment history',
    type: [PaymentResponseDto],
  })
  async findBySupplier(@Param('supplierId', ParseIntPipe) supplierId: number) {
    return this.paymentService.findBySupplier(supplierId);
  }

  @Get('sale/:saleId')
  @Roles(Role.OWNER, Role.MANAGER, Role.CASHIER)
  @ApiOperation({ summary: 'Get all payments for a sale' })
  @ApiResponse({
    status: 200,
    description: 'Returns sale payment history',
    type: [PaymentResponseDto],
  })
  async findBySale(@Param('saleId', ParseIntPipe) saleId: number) {
    return this.paymentService.findBySale(saleId);
  }

  @Get('purchase/:purchaseId')
  @Roles(Role.OWNER, Role.MANAGER)
  @ApiOperation({ summary: 'Get all payments for a purchase' })
  @ApiResponse({
    status: 200,
    description: 'Returns purchase payment history',
    type: [PaymentResponseDto],
  })
  async findByPurchase(@Param('purchaseId', ParseIntPipe) purchaseId: number) {
    return this.paymentService.findByPurchase(purchaseId);
  }
}
