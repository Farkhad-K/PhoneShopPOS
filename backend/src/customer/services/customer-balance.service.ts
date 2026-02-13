import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { PaymentStatus } from 'src/common/enums/enum';

export interface CustomerBalanceDto {
  customerId: number;
  customerName: string;
  totalDebt: number;
  unpaidSales: {
    id: number;
    salePrice: number;
    paidAmount: number;
    remainingBalance: number;
    saleDate: Date;
    phone: {
      brand: string;
      model: string;
    };
  }[];
}

@Injectable()
export class CustomerBalanceService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  /**
   * Calculate customer's total debt and unpaid sales
   */
  async getCustomerBalance(customerId: number): Promise<CustomerBalanceDto> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId, isActive: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Get all unpaid and partially paid sales
    const unpaidSales = await this.saleRepository.find({
      where: [
        { customerId, paymentStatus: PaymentStatus.UNPAID, isActive: true },
        { customerId, paymentStatus: PaymentStatus.PARTIAL, isActive: true },
      ],
      relations: ['phone'],
      order: { saleDate: 'ASC' },
    });

    let totalDebt = 0;
    const unpaidSalesData = unpaidSales.map((sale) => {
      const remainingBalance = Number(sale.salePrice) - Number(sale.paidAmount);
      totalDebt += remainingBalance;

      return {
        id: sale.id,
        salePrice: Number(sale.salePrice),
        paidAmount: Number(sale.paidAmount),
        remainingBalance,
        saleDate: sale.saleDate,
        phone: {
          brand: sale.phone.brand,
          model: sale.phone.model,
        },
      };
    });

    return {
      customerId: customer.id,
      customerName: customer.fullName,
      totalDebt,
      unpaidSales: unpaidSalesData,
    };
  }

  /**
   * Get customer's full transaction history
   */
  async getCustomerTransactions(customerId: number): Promise<Sale[]> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId, isActive: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    return await this.saleRepository.find({
      where: { customerId, isActive: true },
      relations: ['phone'],
      order: { saleDate: 'DESC' },
    });
  }
}
