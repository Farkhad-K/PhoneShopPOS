import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Purchase } from '../entities/purchase.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { CreatePurchaseDto } from '../dto/create-purchase.dto';
import { UpdatePurchaseDto } from '../dto/update-purchase.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { generatePhoneBarcode } from 'src/common/utils/barcode-generator.util';
import { PaymentStatus } from 'src/common/enums/enum';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    // Verify supplier exists
    const supplier = await this.supplierRepository.findOne({
      where: { id: createPurchaseDto.supplierId },
    });

    if (!supplier) {
      throw new NotFoundException(
        `Supplier with ID ${createPurchaseDto.supplierId} not found`,
      );
    }

    // Calculate total amount
    const totalAmount = createPurchaseDto.phones.reduce(
      (sum, phone) => sum + Number(phone.purchasePrice),
      0,
    );

    // Validate paid amount
    const paidAmount = createPurchaseDto.paidAmount || 0;
    if (paidAmount > totalAmount) {
      throw new BadRequestException('Paid amount cannot exceed total amount');
    }

    // Determine payment status
    let paymentStatus = createPurchaseDto.paymentStatus;
    if (paidAmount === 0) {
      paymentStatus = PaymentStatus.UNPAID;
    } else if (paidAmount >= totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      // Create purchase
      const purchase = manager.create(Purchase, {
        supplierId: createPurchaseDto.supplierId,
        purchaseDate: createPurchaseDto.purchaseDate
          ? new Date(createPurchaseDto.purchaseDate)
          : new Date(),
        totalAmount,
        paymentStatus,
        paidAmount,
        notes: createPurchaseDto.notes,
      });

      const savedPurchase = await manager.save(Purchase, purchase);

      // Create phones with unique barcodes
      const phones = createPurchaseDto.phones.map((phoneDto) => {
        return manager.create(Phone, {
          ...phoneDto,
          barcode: generatePhoneBarcode(),
          totalCost: phoneDto.purchasePrice, // Initially, total cost = purchase price
          purchaseId: savedPurchase.id,
        });
      });

      await manager.save(Phone, phones);

      // Reload with relations
      const reloadedPurchase = await manager.findOne(Purchase, {
        where: { id: savedPurchase.id },
        relations: ['supplier', 'phones'],
      });

      if (!reloadedPurchase) {
        throw new Error('Failed to reload purchase after creation');
      }

      return reloadedPurchase;
    });
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, take = 10, sortField, sortOrder, search } = query;

    const qb = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.supplier', 'supplier')
      .leftJoinAndSelect('purchase.phones', 'phones');

    if (search) {
      qb.where('supplier.companyName ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (sortField) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`purchase.${sortField}`, order);
    } else {
      qb.orderBy('purchase.purchaseDate', 'DESC');
    }

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

  async findOne(id: number): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: ['supplier', 'phones'],
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    return purchase;
  }

  async update(id: number, updatePurchaseDto: UpdatePurchaseDto): Promise<Purchase> {
    const purchase = await this.findOne(id);

    // Update paid amount and recalculate payment status
    if (updatePurchaseDto.paidAmount !== undefined) {
      const paidAmount = Number(updatePurchaseDto.paidAmount);
      const totalAmount = Number(purchase.totalAmount);

      if (paidAmount > totalAmount) {
        throw new BadRequestException('Paid amount cannot exceed total amount');
      }

      purchase.paidAmount = paidAmount;

      // Auto-update payment status
      if (paidAmount === 0) {
        purchase.paymentStatus = PaymentStatus.UNPAID;
      } else if (paidAmount >= totalAmount) {
        purchase.paymentStatus = PaymentStatus.PAID;
      } else {
        purchase.paymentStatus = PaymentStatus.PARTIAL;
      }
    }

    if (updatePurchaseDto.notes) {
      purchase.notes = updatePurchaseDto.notes;
    }

    return await this.purchaseRepository.save(purchase);
  }

  async remove(id: number): Promise<void> {
    const purchase = await this.findOne(id);
    await this.purchaseRepository.softDelete(id);
  }
}
