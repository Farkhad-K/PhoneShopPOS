import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker } from '../entities/worker.entity';
import { CreateWorkerDto } from '../dto/create-worker.dto';
import { UpdateWorkerDto } from '../dto/update-worker.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Injectable()
export class WorkerService {
  constructor(
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
  ) {}

  async create(createWorkerDto: CreateWorkerDto): Promise<Worker> {
    // Check if passport ID already exists
    const existingWorker = await this.workerRepository.findOne({
      where: { passportId: createWorkerDto.passportId },
    });

    if (existingWorker) {
      throw new BadRequestException(
        `Worker with passport ID ${createWorkerDto.passportId} already exists`,
      );
    }

    const worker = this.workerRepository.create({
      ...createWorkerDto,
      hireDate: new Date(createWorkerDto.hireDate),
    });

    return await this.workerRepository.save(worker);
  }

  async findAll(query: PaginationQueryDto) {
    const { page = 1, take = 10, sortField, sortOrder, search } = query;

    const qb = this.workerRepository
      .createQueryBuilder('worker')
      .leftJoinAndSelect('worker.user', 'user');

    // Search by name, phone, passport ID
    if (search) {
      qb.andWhere(
        '(worker.fullName ILIKE :search OR worker.phoneNumber ILIKE :search OR worker.passportId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    if (sortField) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`worker.${sortField}`, order);
    } else {
      qb.orderBy('worker.hireDate', 'DESC');
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

  async findOne(id: number): Promise<Worker> {
    const worker = await this.workerRepository.findOne({
      where: { id },
      relations: ['user', 'payments'],
    });

    if (!worker) {
      throw new NotFoundException(`Worker with ID ${id} not found`);
    }

    return worker;
  }

  async findActive() {
    return await this.workerRepository.find({
      where: { isActive: true },
      order: { fullName: 'ASC' },
    });
  }

  async update(id: number, updateWorkerDto: UpdateWorkerDto): Promise<Worker> {
    const worker = await this.findOne(id);

    Object.assign(worker, updateWorkerDto);

    if (updateWorkerDto.terminationDate) {
      worker.terminationDate = new Date(updateWorkerDto.terminationDate);
      worker.isActive = false;
    }

    return await this.workerRepository.save(worker);
  }

  async remove(id: number): Promise<void> {
    const worker = await this.findOne(id);
    await this.workerRepository.softDelete(id);
  }
}
