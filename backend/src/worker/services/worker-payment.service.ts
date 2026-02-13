import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorkerPayment } from '../entities/worker-payment.entity';
import { Worker } from '../entities/worker.entity';
import { CreateWorkerPaymentDto } from '../dto/create-worker-payment.dto';
import { WorkerSalaryHistoryDto } from '../dto/worker-response.dto';

@Injectable()
export class WorkerPaymentService {
  constructor(
    @InjectRepository(WorkerPayment)
    private readonly paymentRepository: Repository<WorkerPayment>,
    @InjectRepository(Worker)
    private readonly workerRepository: Repository<Worker>,
  ) {}

  async create(
    createPaymentDto: CreateWorkerPaymentDto,
  ): Promise<WorkerPayment> {
    // Verify worker exists
    const worker = await this.workerRepository.findOne({
      where: { id: createPaymentDto.workerId },
    });

    if (!worker) {
      throw new NotFoundException(
        `Worker with ID ${createPaymentDto.workerId} not found`,
      );
    }

    // Check if payment for this month/year already exists
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        workerId: createPaymentDto.workerId,
        month: createPaymentDto.month,
        year: createPaymentDto.year,
      },
    });

    if (existingPayment) {
      throw new BadRequestException(
        `Payment for ${createPaymentDto.month}/${createPaymentDto.year} already exists for this worker`,
      );
    }

    const bonus = createPaymentDto.bonus || 0;
    const deduction = createPaymentDto.deduction || 0;
    const totalPaid =
      Number(createPaymentDto.amount) + Number(bonus) - Number(deduction);

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paymentDate: new Date(createPaymentDto.paymentDate),
      bonus,
      deduction,
      totalPaid,
    });

    return await this.paymentRepository.save(payment);
  }

  async findAll(query: { page?: number; take?: number; workerId?: number }) {
    const { page = 1, take = 10, workerId } = query;

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.worker', 'worker');

    if (workerId) {
      qb.andWhere('payment.workerId = :workerId', { workerId });
    }

    qb.orderBy('payment.year', 'DESC')
      .addOrderBy('payment.month', 'DESC')
      .addOrderBy('payment.paymentDate', 'DESC');

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

  async getWorkerSalaryHistory(
    workerId: number,
    year?: number,
  ): Promise<WorkerSalaryHistoryDto> {
    const worker = await this.workerRepository.findOne({
      where: { id: workerId },
    });

    if (!worker) {
      throw new NotFoundException(`Worker with ID ${workerId} not found`);
    }

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.workerId = :workerId', { workerId });

    if (year) {
      queryBuilder.andWhere('payment.year = :year', { year });
    }

    const payments = await queryBuilder
      .orderBy('payment.year', 'DESC')
      .addOrderBy('payment.month', 'DESC')
      .getMany();

    const totalPaid = payments.reduce(
      (sum, p) => sum + Number(p.totalPaid),
      0,
    );
    const totalBonus = payments.reduce((sum, p) => sum + Number(p.bonus), 0);
    const totalDeduction = payments.reduce(
      (sum, p) => sum + Number(p.deduction),
      0,
    );

    return {
      workerId,
      workerName: worker.fullName,
      monthlySalary: Number(worker.monthlySalary),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalBonus: Number(totalBonus.toFixed(2)),
      totalDeduction: Number(totalDeduction.toFixed(2)),
      paymentCount: payments.length,
      payments: payments.map((p) => ({
        id: p.id,
        workerId: p.workerId,
        amount: Number(p.amount),
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        month: p.month,
        year: p.year,
        bonus: Number(p.bonus),
        deduction: Number(p.deduction),
        totalPaid: Number(p.totalPaid),
        notes: p.notes,
        createdAt: p.createdAt,
      })),
    };
  }

  async findOne(id: number): Promise<WorkerPayment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['worker'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.paymentRepository.softDelete(id);
  }
}
