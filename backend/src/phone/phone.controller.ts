import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Body,
  Query,
  HttpCode,
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
import { PhoneService } from './services/phone.service';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { PhoneFilterDto } from './dto/phone-filter.dto';
import { PhoneResponseDto } from './dto/phone-response.dto';

@ApiTags('Phones')
@ApiBearerAuth()
@Controller('api/phones')
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}

  @Get()
  @Roles(Role.CASHIER) // CASHIER and above can view phones
  @ApiOperation({
    summary: 'Get all phones with advanced filtering',
    description:
      'Filter by status, condition, brand, model, or search across multiple fields. ' +
      'Includes purchase, repair, and sale information.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of phones with relations',
  })
  async findAll(@Query() filter: PhoneFilterDto) {
    return this.phoneService.findAll(filter);
  }

  @Get('available')
  @Roles(Role.CASHIER)
  @ApiOperation({
    summary: 'Get phones available for sale',
    description: 'Returns phones with status IN_STOCK or READY_FOR_SALE',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available phones',
  })
  async getAvailableForSale() {
    return this.phoneService.getAvailableForSale();
  }

  @Get('statistics')
  @Roles(Role.MANAGER)
  @ApiOperation({
    summary: 'Get phone inventory statistics',
    description: 'Returns counts by status and total available',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory statistics',
    schema: {
      type: 'object',
      properties: {
        totalPhones: { type: 'number' },
        byStatus: {
          type: 'object',
          properties: {
            inStock: { type: 'number' },
            inRepair: { type: 'number' },
            readyForSale: { type: 'number' },
            sold: { type: 'number' },
            available: { type: 'number' },
          },
        },
      },
    },
  })
  async getStatistics() {
    return this.phoneService.getStatistics();
  }

  @Get('barcode/:barcode')
  @Roles(Role.CASHIER)
  @ApiOperation({
    summary: 'Find phone by barcode (for scanning)',
    description: 'Returns phone with full history',
  })
  @ApiParam({ name: 'barcode', example: 'PH17078308000011234' })
  @ApiResponse({
    status: 200,
    description: 'Phone found',
    type: PhoneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Phone not found' })
  async findByBarcode(@Param('barcode') barcode: string) {
    return this.phoneService.findByBarcode(barcode);
  }

  @Get('imei/:imei')
  @Roles(Role.CASHIER)
  @ApiOperation({
    summary: 'Find phone by IMEI',
    description: 'Returns phone with full history',
  })
  @ApiParam({ name: 'imei', example: '123456789012345' })
  @ApiResponse({
    status: 200,
    description: 'Phone found',
    type: PhoneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Phone not found' })
  async findByIMEI(@Param('imei') imei: string) {
    return this.phoneService.findByIMEI(imei);
  }

  @Get(':id')
  @Roles(Role.CASHIER)
  @ApiOperation({
    summary: 'Get phone by ID',
    description: 'Returns phone with full purchase, repair, and sale history',
  })
  @ApiParam({ name: 'id', description: 'Phone ID' })
  @ApiResponse({
    status: 200,
    description: 'Phone found with all relations',
    type: PhoneResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Phone not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.phoneService.findOne(id);
  }

  @Get(':id/history')
  @Roles(Role.CASHIER)
  @ApiOperation({
    summary: 'Get complete phone lifecycle history',
    description:
      'Returns formatted timeline: purchase → repairs → sale with all costs and profit',
  })
  @ApiParam({ name: 'id', description: 'Phone ID' })
  @ApiResponse({
    status: 200,
    description: 'Phone history timeline',
  })
  async getPhoneHistory(@Param('id', ParseIntPipe) id: number) {
    return this.phoneService.getPhoneHistory(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER) // Only MANAGER and above can update phone directly
  @ApiOperation({
    summary: 'Update phone information',
    description:
      'Manually update phone status, condition, or notes. ' +
      'Use with caution - status is normally managed by business flows.',
  })
  @ApiParam({ name: 'id', description: 'Phone ID' })
  @ApiResponse({
    status: 200,
    description: 'Phone updated successfully',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePhoneDto: UpdatePhoneDto,
  ) {
    return this.phoneService.update(id, updatePhoneDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER) // Only OWNER can delete phones
  @ApiOperation({
    summary: 'Delete phone (soft delete)',
    description:
      'Soft deletes a phone. Cannot delete phones with repairs or sales.',
  })
  @ApiParam({ name: 'id', description: 'Phone ID' })
  @ApiResponse({
    status: 204,
    description: 'Phone deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete phone with repairs or sales',
  })
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.phoneService.delete(id);
  }
}
