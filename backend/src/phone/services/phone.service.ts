import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Phone } from '../entities/phone.entity';
import { UpdatePhoneDto } from '../dto/update-phone.dto';
import { PhoneFilterDto } from '../dto/phone-filter.dto';
import { PhoneStatus } from 'src/common/enums/enum';

@Injectable()
export class PhoneService {
  constructor(
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
  ) {}

  async findAll(filter: PhoneFilterDto) {
    const {
      page = 1,
      take = 10,
      sortField,
      sortOrder,
      search,
      status,
      condition,
      brand,
      model,
    } = filter;

    const qb = this.phoneRepository
      .createQueryBuilder('phone')
      .leftJoinAndSelect('phone.purchase', 'purchase')
      .leftJoinAndSelect('purchase.supplier', 'supplier')
      .leftJoinAndSelect('phone.repairs', 'repairs')
      .leftJoinAndSelect('phone.sale', 'sale');

    // Apply filters
    if (status) {
      qb.andWhere('phone.status = :status', { status });
    }

    if (condition) {
      qb.andWhere('phone.condition = :condition', { condition });
    }

    if (brand) {
      qb.andWhere('phone.brand ILIKE :brand', { brand: `%${brand}%` });
    }

    if (model) {
      qb.andWhere('phone.model ILIKE :model', { model: `%${model}%` });
    }

    // General search across brand, model, IMEI, barcode
    if (search) {
      qb.andWhere(
        '(phone.brand ILIKE :search OR phone.model ILIKE :search OR phone.imei ILIKE :search OR phone.barcode ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    if (sortField) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`phone.${sortField}`, order);
    } else {
      qb.orderBy('phone.createdAt', 'DESC');
    }

    // Pagination
    const skip = (page - 1) * take;
    qb.skip(skip).take(take);

    const [results, count] = await qb.getManyAndCount();

    return {
      count,
      results,
      totalPages: Math.ceil(count / take),
      page: Number(page),
      take: Number(take),
    };
  }

  async findOne(id: number): Promise<Phone> {
    const phone = await this.phoneRepository.findOne({
      where: { id },
      relations: ['purchase', 'purchase.supplier', 'repairs', 'sale', 'sale.customer'],
    });

    if (!phone) {
      throw new NotFoundException(`Phone with ID ${id} not found`);
    }

    return phone;
  }

  async findByBarcode(barcode: string): Promise<Phone> {
    const phone = await this.phoneRepository.findOne({
      where: { barcode },
      relations: ['purchase', 'purchase.supplier', 'repairs', 'sale', 'sale.customer'],
    });

    if (!phone) {
      throw new NotFoundException(`Phone with barcode ${barcode} not found`);
    }

    return phone;
  }

  async findByIMEI(imei: string): Promise<Phone> {
    const phone = await this.phoneRepository.findOne({
      where: { imei },
      relations: ['purchase', 'purchase.supplier', 'repairs', 'sale', 'sale.customer'],
    });

    if (!phone) {
      throw new NotFoundException(`Phone with IMEI ${imei} not found`);
    }

    return phone;
  }

  async update(id: number, updatePhoneDto: UpdatePhoneDto): Promise<Phone> {
    const phone = await this.findOne(id);

    // Validate status changes
    if (updatePhoneDto.status) {
      // Cannot change status of sold phone (except to return)
      if (phone.status === PhoneStatus.SOLD && updatePhoneDto.status !== PhoneStatus.RETURNED) {
        throw new BadRequestException(
          'Cannot change status of sold phone. Use return flow if needed.',
        );
      }

      // Warn if changing to IN_REPAIR without creating repair record
      if (updatePhoneDto.status === PhoneStatus.IN_REPAIR && !phone.repairs?.length) {
        // Allow it but log warning (in real app, you'd use a logger)
        console.warn(
          `Phone ${id} status changed to IN_REPAIR without repair record`,
        );
      }
    }

    Object.assign(phone, updatePhoneDto);
    return await this.phoneRepository.save(phone);
  }

  async getPhoneHistory(id: number) {
    const phone = await this.findOne(id);

    const history = {
      phone: {
        id: phone.id,
        brand: phone.brand,
        model: phone.model,
        imei: phone.imei,
        barcode: phone.barcode,
        status: phone.status,
        condition: phone.condition,
      },
      purchase: phone.purchase
        ? {
            id: phone.purchase.id,
            date: phone.purchase.purchaseDate,
            supplier: phone.purchase.supplier?.companyName,
            price: phone.purchasePrice,
          }
        : null,
      repairs: phone.repairs
        ? phone.repairs.map((repair) => ({
            id: repair.id,
            description: repair.description,
            cost: repair.repairCost,
            status: repair.status,
            startDate: repair.startDate,
            completionDate: repair.completionDate,
          }))
        : [],
      totalCost: phone.totalCost,
      sale: phone.sale
        ? {
            id: phone.sale.id,
            date: phone.sale.saleDate,
            customer: phone.sale.customer?.fullName,
            price: phone.sale.salePrice,
            profit: phone.sale.profit,
            paymentType: phone.sale.paymentType,
            paymentStatus: phone.sale.paymentStatus,
          }
        : null,
    };

    return history;
  }

  // Get available phones for sale (IN_STOCK or READY_FOR_SALE)
  async getAvailableForSale() {
    return await this.phoneRepository.find({
      where: [
        { status: PhoneStatus.IN_STOCK },
        { status: PhoneStatus.READY_FOR_SALE },
      ],
      relations: ['purchase', 'purchase.supplier'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get statistics
  async getStatistics() {
    const [
      totalPhones,
      inStock,
      inRepair,
      readyForSale,
      sold,
    ] = await Promise.all([
      this.phoneRepository.count(),
      this.phoneRepository.count({ where: { status: PhoneStatus.IN_STOCK } }),
      this.phoneRepository.count({ where: { status: PhoneStatus.IN_REPAIR } }),
      this.phoneRepository.count({ where: { status: PhoneStatus.READY_FOR_SALE } }),
      this.phoneRepository.count({ where: { status: PhoneStatus.SOLD } }),
    ]);

    return {
      totalPhones,
      byStatus: {
        inStock,
        inRepair,
        readyForSale,
        sold,
        available: inStock + readyForSale,
      },
    };
  }
}
