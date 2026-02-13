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
import { CreateRepairDto } from './dto/create-repair.dto';
import { UpdateRepairDto } from './dto/update-repair.dto';
import { RepairFilterDto } from './dto/repair-filter.dto';
import { RepairResponseDto } from './dto/repair-response.dto';
import { RepairService } from './services/repair.service';

@ApiTags('Repairs')
@ApiBearerAuth()
@Controller('api/repairs')
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  @Post()
  @Roles(Role.TECHNICIAN) // TECHNICIAN and above can create repairs
  @ApiOperation({ summary: 'Create a new repair job' })
  @ApiResponse({
    status: 201,
    description: 'Repair created successfully',
    type: RepairResponseDto,
  })
  async create(@Body() createRepairDto: CreateRepairDto) {
    return this.repairService.create(createRepairDto);
  }

  @Get()
  @Roles(Role.TECHNICIAN) // TECHNICIAN and above can view repairs
  @ApiOperation({
    summary: 'Get all repairs with advanced filtering',
    description:
      'Filter by date range, phone, status, cost range. ' +
      'Search by phone brand/model or repair description.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of repairs with metadata',
  })
  async findAll(@Query() filter: RepairFilterDto) {
    return this.repairService.findAll(filter);
  }

  @Get('phone/:phoneId')
  @Roles(Role.TECHNICIAN)
  @ApiOperation({ summary: 'Get repair history for a specific phone' })
  @ApiParam({ name: 'phoneId', description: 'Phone ID' })
  @ApiResponse({
    status: 200,
    description: 'Phone repair history',
  })
  async getPhoneRepairHistory(@Param('phoneId', ParseIntPipe) phoneId: number) {
    return this.repairService.getPhoneRepairHistory(phoneId);
  }

  @Get(':id')
  @Roles(Role.TECHNICIAN)
  @ApiOperation({ summary: 'Get repair by ID' })
  @ApiParam({ name: 'id', description: 'Repair ID' })
  @ApiResponse({
    status: 200,
    description: 'Repair found',
    type: RepairResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Repair not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.repairService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.TECHNICIAN)
  @ApiOperation({
    summary: 'Update repair (change status, complete repair, add notes)',
  })
  @ApiParam({ name: 'id', description: 'Repair ID' })
  @ApiResponse({
    status: 200,
    description: 'Repair updated successfully. If status changed to COMPLETED, phone totalCost and status will be updated.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepairDto: UpdateRepairDto,
  ) {
    return this.repairService.update(id, updateRepairDto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER) // Only MANAGER and above can delete repairs
  @ApiOperation({ summary: 'Delete repair (soft delete)' })
  @ApiParam({ name: 'id', description: 'Repair ID' })
  @ApiResponse({ status: 204, description: 'Repair deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.repairService.remove(id);
  }
}
