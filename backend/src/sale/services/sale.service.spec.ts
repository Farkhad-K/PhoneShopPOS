import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SaleService } from './sale.service';
import { Sale } from '../entities/sale.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentType, PaymentStatus, PhoneStatus } from 'src/common/enums/enum';

describe('SaleService', () => {
  let service: SaleService;
  let saleRepository: Repository<Sale>;
  let phoneRepository: Repository<Phone>;
  let customerRepository: Repository<Customer>;
  let dataSource: DataSource;

  const mockPhone = {
    id: 1,
    brand: 'Apple',
    model: 'iPhone 15',
    status: PhoneStatus.IN_STOCK,
    totalCost: 850,
    sale: null,
  };

  const mockCustomer = {
    id: 1,
    fullName: 'John Doe',
    phoneNumber: '+998901234567',
  };

  const mockSale = {
    id: 1,
    phoneId: 1,
    customerId: 1,
    salePrice: 1100,
    saleDate: new Date(),
    paymentType: PaymentType.PAY_LATER,
    paymentStatus: PaymentStatus.UNPAID,
    paidAmount: 0,
    profit: 250,
  };

  const mockEntityManager = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockEntityManager)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleService,
        {
          provide: getRepositoryToken(Sale),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Phone),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SaleService>(SaleService);
    saleRepository = module.get<Repository<Sale>>(getRepositoryToken(Sale));
    phoneRepository = module.get<Repository<Phone>>(getRepositoryToken(Phone));
    customerRepository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createSaleDto = {
      phoneId: 1,
      customerId: 1,
      salePrice: 1100,
      saleDate: '2026-02-13',
      paymentType: PaymentType.PAY_LATER,
      paidAmount: 0,
    };

    it('should create a sale successfully', async () => {
      jest.spyOn(phoneRepository, 'findOne').mockResolvedValue(mockPhone as any);
      jest.spyOn(customerRepository, 'findOne').mockResolvedValue(mockCustomer as any);

      mockEntityManager.create.mockReturnValue(mockSale);
      mockEntityManager.save.mockResolvedValue(mockSale);
      mockEntityManager.findOne.mockResolvedValue({ ...mockSale, phone: mockPhone, customer: mockCustomer });

      const result = await service.create(createSaleDto);

      expect(phoneRepository.findOne).toHaveBeenCalled();
      expect(customerRepository.findOne).toHaveBeenCalled();
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if phone not found', async () => {
      jest.spyOn(phoneRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createSaleDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if phone is already sold', async () => {
      const soldPhone = { ...mockPhone, status: PhoneStatus.SOLD, sale: {} };
      jest.spyOn(phoneRepository, 'findOne').mockResolvedValue(soldPhone as any);

      await expect(service.create(createSaleDto)).rejects.toThrow(BadRequestException);
      expect(phoneRepository.findOne).toHaveBeenCalled();
    });

    it('should throw BadRequestException if phone is in repair', async () => {
      const repairPhone = { ...mockPhone, status: PhoneStatus.IN_REPAIR };
      jest.spyOn(phoneRepository, 'findOne').mockResolvedValue(repairPhone as any);

      await expect(service.create(createSaleDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if PAY_LATER without customer', async () => {
      const dtoWithoutCustomer = {
        ...createSaleDto,
        customerId: undefined,
      };
      jest.spyOn(phoneRepository, 'findOne').mockResolvedValue(mockPhone as any);

      await expect(service.create(dtoWithoutCustomer as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if paidAmount exceeds salePrice', async () => {
      const invalidDto = {
        ...createSaleDto,
        paidAmount: 1200,
      };
      jest.spyOn(phoneRepository, 'findOne').mockResolvedValue(mockPhone as any);
      jest.spyOn(customerRepository, 'findOne').mockResolvedValue(mockCustomer as any);

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a sale with relations', async () => {
      const mockSaleWithRelations = {
        ...mockSale,
        phone: mockPhone,
        customer: mockCustomer,
      };
      jest.spyOn(saleRepository, 'findOne').mockResolvedValue(mockSaleWithRelations as any);

      const result = await service.findOne(1);

      expect(saleRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['phone', 'customer'],
      });
      expect(result).toEqual(mockSaleWithRelations);
    });

    it('should throw NotFoundException if sale not found', async () => {
      jest.spyOn(saleRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCustomerSales', () => {
    it.skip('should return all sales for a customer', async () => {
      const mockSales = [mockSale];
      const findSpy = jest.spyOn(saleRepository, 'find').mockResolvedValue(mockSales as any);

      const result = await service.getCustomerSales(1);

      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId: 1 },
          relations: expect.arrayContaining(['phone', 'customer']),
        }),
      );
      expect(result).toEqual(mockSales);
    });
  });
});
