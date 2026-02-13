import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Repair } from 'src/repair/entities/repair.entity';
import { ReportFilterDto } from '../dto/report-filter.dto';
import { RepairReportDto } from '../dto/report-response.dto';
import { RepairStatus } from 'src/common/enums/enum';

@Injectable()
export class RepairReportService {
  constructor(
    @InjectRepository(Repair)
    private readonly repairRepository: Repository<Repair>,
  ) {}

  async getRepairReport(filter: ReportFilterDto): Promise<RepairReportDto> {
    const { startDate, endDate } = filter;

    // Build query conditions
    const where: any = { isActive: true };

    if (startDate && endDate) {
      where.startDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.startDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.startDate = LessThanOrEqual(new Date(endDate));
    }

    // Get all repairs matching criteria
    const repairs = await this.repairRepository.find({
      where,
    });

    // Calculate metrics
    const totalRepairs = repairs.length;
    const totalRepairCost = repairs.reduce(
      (sum, repair) => sum + Number(repair.repairCost),
      0,
    );
    const averageRepairCost =
      totalRepairs > 0 ? totalRepairCost / totalRepairs : 0;

    const completedRepairs = repairs.filter(
      (r) => r.status === RepairStatus.COMPLETED,
    ).length;
    const pendingRepairs = repairs.filter(
      (r) => r.status === RepairStatus.PENDING,
    ).length;
    const inProgressRepairs = repairs.filter(
      (r) => r.status === RepairStatus.IN_PROGRESS,
    ).length;
    const cancelledRepairs = repairs.filter(
      (r) => r.status === RepairStatus.CANCELLED,
    ).length;

    // Group by description to find common repairs
    const repairMap = new Map<
      string,
      { description: string; count: number; totalCost: number }
    >();

    for (const repair of repairs) {
      const desc = repair.description.toLowerCase().trim();
      if (!repairMap.has(desc)) {
        repairMap.set(desc, {
          description: repair.description,
          count: 0,
          totalCost: 0,
        });
      }

      const repairData = repairMap.get(desc)!;
      repairData.count += 1;
      repairData.totalCost += Number(repair.repairCost);
    }

    const commonRepairs = Array.from(repairMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 most common
      .map((r) => ({
        ...r,
        totalCost: Number(r.totalCost.toFixed(2)),
      }));

    return {
      totalRepairs,
      totalRepairCost: Number(totalRepairCost.toFixed(2)),
      averageRepairCost: Number(averageRepairCost.toFixed(2)),
      completedRepairs,
      pendingRepairs,
      inProgressRepairs,
      cancelledRepairs,
      commonRepairs,
      startDate,
      endDate,
    };
  }
}
