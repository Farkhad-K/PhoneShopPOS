import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';
import { SaleFilterDto } from '../dto/sale-filter.dto';
import { PaymentStatus, PaymentType, PhoneStatus } from 'src/common/enums/enum';
import { Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

@Injectable()
export class SaleService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    // Verify phone exists and is available for sale
    const phone = await this.phoneRepository.findOne({
      where: { id: createSaleDto.phoneId },
      relations: ['sale'],
    });

    if (!phone) {
      throw new NotFoundException(
        `Phone with ID ${createSaleDto.phoneId} not found`,
      );
    }

    if (phone.status === PhoneStatus.SOLD || phone.sale) {
      throw new BadRequestException('Phone has already been sold');
    }

    if (phone.status === PhoneStatus.IN_REPAIR) {
      throw new BadRequestException('Cannot sell a phone that is currently in repair');
    }

    // For PAY_LATER sales, customer is required
    if (createSaleDto.paymentType === PaymentType.PAY_LATER) {
      if (!createSaleDto.customerId) {
        throw new BadRequestException(
          'Customer is required for PAY_LATER sales',
        );
      }

      const customer = await this.customerRepository.findOne({
        where: { id: createSaleDto.customerId },
      });

      if (!customer) {
        throw new NotFoundException(
          `Customer with ID ${createSaleDto.customerId} not found`,
        );
      }
    }

    // Calculate paid amount and payment status
    let paidAmount = createSaleDto.paidAmount || 0;
    const salePrice = Number(createSaleDto.salePrice);

    // For CASH sales, paid amount should equal sale price
    if (createSaleDto.paymentType === PaymentType.CASH) {
      paidAmount = salePrice;
    }

    // Validate paid amount
    if (paidAmount > salePrice) {
      throw new BadRequestException('Paid amount cannot exceed sale price');
    }

    // Determine payment status
    let paymentStatus: PaymentStatus;
    if (paidAmount === 0) {
      paymentStatus = PaymentStatus.UNPAID;
    } else if (paidAmount >= salePrice) {
      paymentStatus = PaymentStatus.PAID;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      // Create sale
      const sale = manager.create(Sale, {
        ...createSaleDto,
        saleDate: createSaleDto.saleDate
          ? new Date(createSaleDto.saleDate)
          : new Date(),
        paymentType: createSaleDto.paymentType || PaymentType.CASH,
        paymentStatus,
        paidAmount,
      });

      const savedSale = await manager.save(Sale, sale);

      // Update phone status to SOLD
      phone.status = PhoneStatus.SOLD;
      await manager.save(Phone, phone);

      // Reload with relations
      const reloadedSale = await manager.findOne(Sale, {
        where: { id: savedSale.id },
        relations: ['phone', 'customer'],
      });

      if (!reloadedSale) {
        throw new Error('Failed to reload sale after creation');
      }

      return reloadedSale;
    });
  }

  async findAll(filter: SaleFilterDto) {
    const {
      page = 1,
      take = 10,
      sortField,
      sortOrder,
      search,
      customerId,
      paymentType,
      paymentStatus,
      startDate,
      endDate,
      minPrice,
      maxPrice,
    } = filter;

    const qb = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.phone', 'phone')
      .leftJoinAndSelect('sale.customer', 'customer');

    // Search filter
    if (search) {
      qb.andWhere(
        '(phone.brand ILIKE :search OR phone.model ILIKE :search OR customer.fullName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Customer filter
    if (customerId) {
      qb.andWhere('sale.customerId = :customerId', { customerId });
    }

    // Payment type filter
    if (paymentType) {
      qb.andWhere('sale.paymentType = :paymentType', { paymentType });
    }

    // Payment status filter
    if (paymentStatus) {
      qb.andWhere('sale.paymentStatus = :paymentStatus', { paymentStatus });
    }

    // Date range filter
    if (startDate && endDate) {
      qb.andWhere('sale.saleDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate + 'T23:59:59.999Z'),
      });
    } else if (startDate) {
      qb.andWhere('sale.saleDate >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      qb.andWhere('sale.saleDate <= :endDate', {
        endDate: new Date(endDate + 'T23:59:59.999Z'),
      });
    }

    // Price range filter
    if (minPrice !== undefined) {
      qb.andWhere('sale.salePrice >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('sale.salePrice <= :maxPrice', { maxPrice });
    }

    // Sorting
    if (sortField) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`sale.${sortField}`, order);
    } else {
      qb.orderBy('sale.saleDate', 'DESC');
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

  async findOne(id: number): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['phone', 'customer'],
    });

    if (!sale) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);

    // Update paid amount and recalculate payment status
    if (updateSaleDto.paidAmount !== undefined) {
      const paidAmount = Number(updateSaleDto.paidAmount);
      const salePrice = Number(sale.salePrice);

      if (paidAmount > salePrice) {
        throw new BadRequestException('Paid amount cannot exceed sale price');
      }

      sale.paidAmount = paidAmount;

      // Auto-update payment status
      if (paidAmount === 0) {
        sale.paymentStatus = PaymentStatus.UNPAID;
      } else if (paidAmount >= salePrice) {
        sale.paymentStatus = PaymentStatus.PAID;
      } else {
        sale.paymentStatus = PaymentStatus.PARTIAL;
      }
    }

    if (updateSaleDto.notes) {
      sale.notes = updateSaleDto.notes;
    }

    return await this.saleRepository.save(sale);
  }

  async remove(id: number): Promise<void> {
    const sale = await this.findOne(id);
    await this.saleRepository.softDelete(id);
  }

  // Utility method to get customer's purchase history
  async getCustomerSales(customerId: number): Promise<Sale[]> {
    return await this.saleRepository.find({
      where: { customerId },
      relations: ['phone'],
      order: { saleDate: 'DESC' },
    });
  }

  // Utility method to get customer's outstanding debt
  async getCustomerDebt(customerId: number): Promise<number> {
    const sales = await this.saleRepository.find({
      where: {
        customerId,
        paymentType: PaymentType.PAY_LATER,
      },
    });

    return sales.reduce((total, sale) => {
      const remaining = Number(sale.salePrice) - Number(sale.paidAmount);
      return total + remaining;
    }, 0);
  }
}
