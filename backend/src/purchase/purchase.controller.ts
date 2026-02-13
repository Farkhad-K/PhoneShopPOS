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
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { PurchaseResponseDto } from './dto/purchase-response.dto';
import { PurchaseService } from './services/purchase.service';

@ApiTags('Purchases')
@ApiBearerAuth()
@Controller('api/purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @Roles(Role.MANAGER) // MANAGER and above can create purchases
  @ApiOperation({ summary: 'Create a new purchase (buy phones from supplier)' })
  @ApiResponse({
    status: 201,
    description: 'Purchase created successfully',
    type: PurchaseResponseDto,
  })
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.create(createPurchaseDto);
  }

  @Get()
  @Roles(Role.CASHIER) // CASHIER and above can view purchases
  @ApiOperation({ summary: 'Get all purchases with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of purchases',
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.purchaseService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.CASHIER)
  @ApiOperation({ summary: 'Get purchase by ID' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiResponse({
    status: 200,
    description: 'Purchase found',
    type: PurchaseResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchaseService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update purchase payment information' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiResponse({
    status: 200,
    description: 'Purchase updated successfully',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
  ) {
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER) // Only OWNER can delete purchases
  @ApiOperation({ summary: 'Delete purchase (soft delete)' })
  @ApiParam({ name: 'id', description: 'Purchase ID' })
  @ApiResponse({ status: 204, description: 'Purchase deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.purchaseService.remove(id);
  }
}
