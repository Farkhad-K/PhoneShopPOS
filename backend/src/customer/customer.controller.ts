import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/enum';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import {
  CreateCustomerDto,
} from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
  CustomerResponseDto,
  CustomerBalanceDto,
} from './dto/customer-response.dto';
import { CustomerService } from './services/customer.service';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('api/customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Roles(Role.MANAGER) // MANAGER and above can create customers
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Phone number already exists' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @Roles(Role.CASHIER) // CASHIER and above can view customers
  @ApiOperation({ summary: 'Get all customers with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'List of customers',
    type: [CustomerResponseDto],
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.customerService.findAll(query);
  }

  @Get('search')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Search customers by phone number' })
  @ApiQuery({ name: 'phone', required: true })
  @ApiResponse({
    status: 200,
    description: 'List of matching customers',
    type: [CustomerResponseDto],
  })
  async searchByPhone(@Query('phone') phone: string) {
    return this.customerService.searchByPhone(phone);
  }

  @Get(':id')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer found',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CustomerResponseDto> {
    return this.customerService.findOne(id);
  }

  @Get(':id/balance')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get customer debt balance with unpaid sales' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer balance',
    type: CustomerBalanceDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getBalance(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CustomerBalanceDto> {
    return this.customerService.getBalance(id);
  }

  @Get(':id/transactions')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get customer transaction history (all sales)' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer transaction history',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getTransactions(@Param('id', ParseIntPipe) id: number) {
    return this.customerService.getTransactions(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update customer information' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Phone number already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER) // Only OWNER can delete customers
  @ApiOperation({ summary: 'Delete customer (soft delete)' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.customerService.remove(id);
  }
}
