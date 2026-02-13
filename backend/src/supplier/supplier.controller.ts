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
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import {
  SupplierResponseDto,
  SupplierBalanceDto,
} from './dto/supplier-response.dto';
import { SupplierService } from './services/supplier.service';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('api/suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @Roles(Role.MANAGER) // MANAGER and above can create suppliers
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully',
    type: SupplierResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Phone number already exists' })
  async create(
    @Body() createSupplierDto: CreateSupplierDto,
  ): Promise<SupplierResponseDto> {
    return this.supplierService.create(createSupplierDto);
  }

  @Get()
  @Roles(Role.CASHIER) // CASHIER and above can view suppliers
  @ApiOperation({ summary: 'Get all suppliers with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'List of suppliers',
    type: [SupplierResponseDto],
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.supplierService.findAll(query);
  }

  @Get('search')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Search suppliers by phone number' })
  @ApiQuery({ name: 'phone', required: true })
  @ApiResponse({
    status: 200,
    description: 'List of matching suppliers',
    type: [SupplierResponseDto],
  })
  async searchByPhone(@Query('phone') phone: string) {
    return this.supplierService.searchByPhone(phone);
  }

  @Get(':id')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier found',
    type: SupplierResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SupplierResponseDto> {
    return this.supplierService.findOne(id);
  }

  @Get(':id/balance')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get supplier credit balance with unpaid purchases' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier balance',
    type: SupplierBalanceDto,
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async getBalance(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SupplierBalanceDto> {
    return this.supplierService.getBalance(id);
  }

  @Get(':id/transactions')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Get supplier transaction history (all purchases)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier transaction history',
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async getTransactions(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.getTransactions(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update supplier information' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully',
    type: SupplierResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  @ApiResponse({ status: 409, description: 'Phone number already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    return this.supplierService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER) // Only OWNER can delete suppliers
  @ApiOperation({ summary: 'Delete supplier (soft delete)' })
  @ApiParam({ name: 'id', description: 'Supplier ID' })
  @ApiResponse({ status: 204, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.supplierService.remove(id);
  }
}
