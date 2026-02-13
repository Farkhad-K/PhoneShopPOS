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
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/enum';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { SaleService } from './services/sale.service';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('api/sales')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Post()
  @Roles(Role.CASHIER) // CASHIER and above can create sales
  @ApiOperation({
    summary: 'Create a new sale (sell phone to customer)',
    description:
      'Creates a sale record and updates phone status to SOLD. ' +
      'For CASH sales, customer is optional. ' +
      'For PAY_LATER sales, customer is required.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sale created successfully. Phone status updated to SOLD.',
    type: SaleResponseDto,
  })
  async create(@Body() createSaleDto: CreateSaleDto) {
    return this.saleService.create(createSaleDto);
  }

  @Get()
  @Roles(Role.CASHIER) // CASHIER and above can view sales
  @ApiOperation({ summary: 'Get all sales with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of sales with phone and customer details',
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.saleService.findAll(query);
  }

  @Get('customer/:customerId')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get all sales for a specific customer' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer purchase history',
  })
  async getCustomerSales(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.saleService.getCustomerSales(customerId);
  }

  @Get('customer/:customerId/debt')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get customer outstanding debt' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Total outstanding debt for customer',
    schema: {
      type: 'object',
      properties: {
        customerId: { type: 'number' },
        totalDebt: { type: 'number' },
      },
    },
  })
  async getCustomerDebt(@Param('customerId', ParseIntPipe) customerId: number) {
    const totalDebt = await this.saleService.getCustomerDebt(customerId);
    return { customerId, totalDebt };
  }

  @Get(':id')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get sale by ID' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({
    status: 200,
    description: 'Sale found with phone and customer details',
    type: SaleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.saleService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.CASHIER)
  @ApiOperation({
    summary: 'Update sale payment information (for PAY_LATER sales)',
    description:
      'Update paid amount for PAY_LATER sales. Payment status is auto-calculated.',
  })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({
    status: 200,
    description: 'Sale updated successfully',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    return this.saleService.update(id, updateSaleDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER) // Only OWNER can delete sales
  @ApiOperation({ summary: 'Delete sale (soft delete)' })
  @ApiParam({ name: 'id', description: 'Sale ID' })
  @ApiResponse({ status: 204, description: 'Sale deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.saleService.remove(id);
  }
}
