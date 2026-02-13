import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/enum';
import { WorkerService } from './services/worker.service';
import { WorkerPaymentService } from './services/worker-payment.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { CreateWorkerPaymentDto } from './dto/create-worker-payment.dto';
import { WorkerResponseDto, WorkerSalaryHistoryDto } from './dto/worker-response.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@ApiTags('Workers')
@ApiBearerAuth()
@Controller('api/workers')
export class WorkerController {
  constructor(
    private readonly workerService: WorkerService,
    private readonly paymentService: WorkerPaymentService,
  ) {}

  @Post()
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Add a new worker',
    description: 'Create a worker record with hire date and salary information',
  })
  @ApiResponse({
    status: 201,
    description: 'Worker created successfully',
    type: WorkerResponseDto,
  })
  async create(@Body() createWorkerDto: CreateWorkerDto) {
    return this.workerService.create(createWorkerDto);
  }

  @Get()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Get all workers with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of workers',
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.workerService.findAll(query);
  }

  @Get('active')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Get all active workers' })
  @ApiResponse({
    status: 200,
    description: 'List of active workers',
  })
  async findActive() {
    return this.workerService.findActive();
  }

  @Get(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Get worker by ID' })
  @ApiParam({ name: 'id', description: 'Worker ID' })
  @ApiResponse({
    status: 200,
    description: 'Worker details',
    type: WorkerResponseDto,
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workerService.findOne(id);
  }

  @Get(':id/salary-history')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Get worker salary payment history',
    description: 'Returns all salary payments for a worker with totals',
  })
  @ApiParam({ name: 'id', description: 'Worker ID' })
  @ApiResponse({
    status: 200,
    description: 'Worker salary history',
    type: WorkerSalaryHistoryDto,
  })
  async getSalaryHistory(
    @Param('id', ParseIntPipe) id: number,
    @Query('year') year?: string,
  ) {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.paymentService.getWorkerSalaryHistory(id, yearNumber);
  }

  @Patch(':id')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Update worker information',
    description: 'Update worker details, salary, or set termination date',
  })
  @ApiParam({ name: 'id', description: 'Worker ID' })
  @ApiResponse({
    status: 200,
    description: 'Worker updated successfully',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkerDto: UpdateWorkerDto,
  ) {
    return this.workerService.update(id, updateWorkerDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Delete worker (soft delete)',
    description: 'Soft delete a worker record',
  })
  @ApiParam({ name: 'id', description: 'Worker ID' })
  @ApiResponse({
    status: 204,
    description: 'Worker deleted successfully',
  })
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.workerService.remove(id);
  }

  // Payment endpoints
  @Post('payments')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Record salary payment',
    description: 'Record a salary payment with optional bonus/deduction',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment recorded successfully',
  })
  async createPayment(@Body() createPaymentDto: CreateWorkerPaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get('payments/all')
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get all worker payments' })
  @ApiResponse({
    status: 200,
    description: 'List of payments',
  })
  async findAllPayments(
    @Query('page', ParseIntPipe) page?: number,
    @Query('take', ParseIntPipe) take?: number,
    @Query('workerId', ParseIntPipe) workerId?: number,
  ) {
    return this.paymentService.findAll({ page, take, workerId });
  }

  @Delete('payments/:id')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Delete payment record (soft delete)',
    description: 'Soft delete a payment record',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 204,
    description: 'Payment deleted successfully',
  })
  @HttpCode(204)
  async removePayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.remove(id);
  }
}
