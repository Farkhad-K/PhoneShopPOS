import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkerService } from './worker.service';
import { Worker } from '../entities/worker.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WorkerService', () => {
  let service: WorkerService;
  let repository: Repository<Worker>;

  const mockWorker = {
    id: 1,
    fullName: 'Ali Karimov',
    phoneNumber: '+998901234567',
    passportId: 'AA9876543',
    hireDate: new Date('2026-01-15'),
    monthlySalary: 3000000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockWorker], 1]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerService,
        {
          provide: getRepositoryToken(Worker),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WorkerService>(WorkerService);
    repository = module.get<Repository<Worker>>(getRepositoryToken(Worker));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createWorkerDto = {
      fullName: 'Ali Karimov',
      phoneNumber: '+998901234567',
      passportId: 'AA9876543',
      hireDate: '2026-01-15',
      monthlySalary: 3000000,
      notes: 'Senior technician',
    };

    it('should create a new worker', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockWorker);
      mockRepository.save.mockResolvedValue(mockWorker);

      const result = await service.create(createWorkerDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { passportId: createWorkerDto.passportId },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockWorker);
    });

    it('should throw BadRequestException if passport ID already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockWorker);

      await expect(service.create(createWorkerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { passportId: createWorkerDto.passportId },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated workers', async () => {
      const query = { page: 1, take: 10 };

      const result = await service.findAll(query);

      expect(result.data).toEqual([mockWorker]);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.take).toBe(10);
    });

    it('should filter by search term', async () => {
      const mockAndWhere = jest.fn().mockReturnThis();
      mockRepository.createQueryBuilder = jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: mockAndWhere,
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockWorker], 1]),
      }));

      const query = { page: 1, take: 10, search: 'Ali' };
      await service.findAll(query);

      expect(mockAndWhere).toHaveBeenCalledWith(
        '(worker.fullName ILIKE :search OR worker.phoneNumber ILIKE :search OR worker.passportId ILIKE :search)',
        { search: '%Ali%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return a worker by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockWorker);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'payments'],
      });
      expect(result).toEqual(mockWorker);
    });

    it('should throw NotFoundException if worker not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findActive', () => {
    it('should return only active workers', async () => {
      mockRepository.find.mockResolvedValue([mockWorker]);

      const result = await service.findActive();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { fullName: 'ASC' },
      });
      expect(result).toEqual([mockWorker]);
    });
  });

  describe('update', () => {
    it('should update a worker', async () => {
      const updateDto = { monthlySalary: 3500000 };
      mockRepository.findOne.mockResolvedValue(mockWorker);
      mockRepository.save.mockResolvedValue({ ...mockWorker, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(result.monthlySalary).toBe(3500000);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should set isActive to false when termination date is set', async () => {
      const updateDto = { terminationDate: '2026-12-31' };
      mockRepository.findOne.mockResolvedValue(mockWorker);
      mockRepository.save.mockResolvedValue({
        ...mockWorker,
        terminationDate: new Date('2026-12-31'),
        isActive: false,
      });

      const result = await service.update(1, updateDto);

      expect(result.isActive).toBe(false);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a worker', async () => {
      mockRepository.findOne.mockResolvedValue(mockWorker);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if worker not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
