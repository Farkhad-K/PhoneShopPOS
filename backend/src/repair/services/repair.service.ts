import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Repair } from '../entities/repair.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { CreateRepairDto } from '../dto/create-repair.dto';
import { UpdateRepairDto } from '../dto/update-repair.dto';
import { RepairFilterDto } from '../dto/repair-filter.dto';
import { RepairStatus, PhoneStatus } from 'src/common/enums/enum';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class RepairService {
  constructor(
    @InjectRepository(Repair)
    private readonly repairRepository: Repository<Repair>,
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createRepairDto: CreateRepairDto): Promise<Repair> {
    // Verify phone exists and is not sold
    const phone = await this.phoneRepository.findOne({
      where: { id: createRepairDto.phoneId },
    });

    if (!phone) {
      throw new NotFoundException(
        `Phone with ID ${createRepairDto.phoneId} not found`,
      );
    }

    if (phone.status === PhoneStatus.SOLD) {
      throw new BadRequestException('Cannot repair a phone that is already sold');
    }

    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      // Create repair
      const repair = manager.create(Repair, {
        ...createRepairDto,
        startDate: createRepairDto.startDate
          ? new Date(createRepairDto.startDate)
          : new Date(),
        status: createRepairDto.status || RepairStatus.PENDING,
      });

      const savedRepair = await manager.save(Repair, repair);

      // Update phone status to IN_REPAIR if repair is starting
      if (
        savedRepair.status === RepairStatus.IN_PROGRESS ||
        savedRepair.status === RepairStatus.PENDING
      ) {
        phone.status = PhoneStatus.IN_REPAIR;
        await manager.save(Phone, phone);
      }

      // Reload with relations
      const reloadedRepair = await manager.findOne(Repair, {
        where: { id: savedRepair.id },
        relations: ['phone'],
      });

      if (!reloadedRepair) {
        throw new Error('Failed to reload repair after creation');
      }

      return reloadedRepair;
    });
  }

  async findAll(filter: RepairFilterDto) {
    const {
      page = 1,
      take = 10,
      sortField,
      sortOrder,
      search,
      phoneId,
      status,
      startDate,
      endDate,
      minCost,
      maxCost,
    } = filter;

    const qb = this.repairRepository
      .createQueryBuilder('repair')
      .leftJoinAndSelect('repair.phone', 'phone');

    // Search filter
    if (search) {
      qb.andWhere(
        '(phone.brand ILIKE :search OR phone.model ILIKE :search OR repair.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Phone filter
    if (phoneId) {
      qb.andWhere('repair.phoneId = :phoneId', { phoneId });
    }

    // Status filter
    if (status) {
      qb.andWhere('repair.status = :status', { status });
    }

    // Date range filter
    if (startDate && endDate) {
      qb.andWhere('repair.startDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate + 'T23:59:59.999Z'),
      });
    } else if (startDate) {
      qb.andWhere('repair.startDate >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      qb.andWhere('repair.startDate <= :endDate', {
        endDate: new Date(endDate + 'T23:59:59.999Z'),
      });
    }

    // Cost range filter
    if (minCost !== undefined) {
      qb.andWhere('repair.repairCost >= :minCost', { minCost });
    }
    if (maxCost !== undefined) {
      qb.andWhere('repair.repairCost <= :maxCost', { maxCost });
    }

    // Sorting
    if (sortField) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`repair.${sortField}`, order);
    } else {
      qb.orderBy('repair.startDate', 'DESC');
    }

    // Pagination
    const skip = (page - 1) * take;
    qb.skip(skip).take(take);

    const [results, count] = await qb.getManyAndCount();

    return {
      data: results,
      meta: {
        page: Number(page),
        take: Number(take),
        totalItems: count,
        totalPages: Math.ceil(count / take),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(count / take),
      },
    };
  }

  async findOne(id: number): Promise<Repair> {
    const repair = await this.repairRepository.findOne({
      where: { id },
      relations: ['phone'],
    });

    if (!repair) {
      throw new NotFoundException(`Repair with ID ${id} not found`);
    }

    return repair;
  }

  async update(id: number, updateRepairDto: UpdateRepairDto): Promise<Repair> {
    const repair = await this.findOne(id);

    // Use transaction when completing repair (need to update phone totalCost and status)
    if (
      updateRepairDto.status === RepairStatus.COMPLETED &&
      repair.status !== RepairStatus.COMPLETED
    ) {
      return await this.completeRepair(repair, updateRepairDto);
    }

    // Handle repair cancellation - reset phone status
    if (
      updateRepairDto.status === RepairStatus.CANCELLED &&
      repair.status !== RepairStatus.CANCELLED
    ) {
      return await this.cancelRepair(repair, updateRepairDto);
    }

    // Regular update (no transaction needed)
    Object.assign(repair, updateRepairDto);

    if (updateRepairDto.completionDate) {
      repair.completionDate = new Date(updateRepairDto.completionDate);
    }

    return await this.repairRepository.save(repair);
  }

  private async completeRepair(
    repair: Repair,
    updateRepairDto: UpdateRepairDto,
  ): Promise<Repair> {
    return await this.dataSource.transaction(async (manager) => {
      // Update repair status
      repair.status = RepairStatus.COMPLETED;
      repair.completionDate = updateRepairDto.completionDate
        ? new Date(updateRepairDto.completionDate)
        : new Date();

      if (updateRepairDto.notes) {
        repair.notes = updateRepairDto.notes;
      }

      await manager.save(Repair, repair);

      // Update phone: add repair cost to totalCost and set status to READY_FOR_SALE
      const phone = await manager.findOne(Phone, {
        where: { id: repair.phoneId },
      });

      if (phone) {
        phone.totalCost = Number(phone.totalCost) + Number(repair.repairCost);
        phone.status = PhoneStatus.READY_FOR_SALE;
        await manager.save(Phone, phone);
      }

      // Reload repair with updated phone relation
      const reloadedRepair = await manager.findOne(Repair, {
        where: { id: repair.id },
        relations: ['phone'],
      });

      if (!reloadedRepair) {
        throw new Error('Failed to reload repair after completion');
      }

      return reloadedRepair;
    });
  }

  private async cancelRepair(
    repair: Repair,
    updateRepairDto: UpdateRepairDto,
  ): Promise<Repair> {
    return await this.dataSource.transaction(async (manager) => {
      // Update repair status
      repair.status = RepairStatus.CANCELLED;
      repair.completionDate = new Date(); // Set cancellation date

      if (updateRepairDto.notes) {
        repair.notes = updateRepairDto.notes;
      }

      await manager.save(Repair, repair);

      // Update phone: reset status to IN_STOCK (repair was cancelled, no cost added)
      const phone = await manager.findOne(Phone, {
        where: { id: repair.phoneId },
      });

      if (phone && phone.status === PhoneStatus.IN_REPAIR) {
        // Check if there are other active repairs for this phone
        const activeRepairs = await manager.count(Repair, {
          where: [
            { phoneId: repair.phoneId, status: RepairStatus.PENDING },
            { phoneId: repair.phoneId, status: RepairStatus.IN_PROGRESS },
          ],
        });

        // Only reset status if no other active repairs
        if (activeRepairs === 0) {
          phone.status = PhoneStatus.IN_STOCK;
          await manager.save(Phone, phone);
        }
      }

      // Reload repair with updated phone relation
      const reloadedRepair = await manager.findOne(Repair, {
        where: { id: repair.id },
        relations: ['phone'],
      });

      if (!reloadedRepair) {
        throw new Error('Failed to reload repair after cancellation');
      }

      return reloadedRepair;
    });
  }

  async remove(id: number): Promise<void> {
    const repair = await this.findOne(id);
    await this.repairRepository.softDelete(id);
  }

  // Utility method to get repair history for a phone
  async getPhoneRepairHistory(phoneId: number): Promise<Repair[]> {
    return await this.repairRepository.find({
      where: { phoneId },
      order: { startDate: 'DESC' },
    });
  }
}
