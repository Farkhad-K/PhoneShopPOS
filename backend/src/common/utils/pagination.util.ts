import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  ObjectLiteral,
  Raw,
  Repository,
} from 'typeorm';

export interface PaginationQuery {
  page?: number;
  take?: number;
  search?: string;
  searchField?: keyof any;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
  createdFrom?: string;
  createdTo?: string;
}

export interface PaginationResult<T> {
  count: number;
  results: T[];
  totalPages: number;
  page: number;
  take: number;
}
function dateOnlyBoundary(
  ymd?: string,
  boundary: 'start' | 'end' = 'start',
): Date | undefined {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return undefined;
  const [y, m, d] = ymd.split('-').map(Number);
  if (boundary === 'start') return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
}

export async function paginateAndFilter<T extends ObjectLiteral>(
  repo: Repository<T>,
  query: PaginationQuery,
  baseWhere: FindOptionsWhere<T> = {},
): Promise<PaginationResult<T>> {
  const {
    page = 1,
    take = 6,
    search,
    searchField,
    sortField = 'createdAt',
    sortOrder = 'DESC',
    createdFrom,
    createdTo,
  } = query;

  const skip = (page - 1) * take;

  const where: FindOptionsWhere<T> = { ...baseWhere };

  if (search && searchField) {
    const column = repo.metadata.findColumnWithPropertyName(
      searchField as string,
    );

    const whereKey = searchField as string;
    const searchPattern = `%${search}%`;

    if (column?.type === 'uuid') {
      // Cast UUID columns to text to allow partial matches using ILIKE.
      (where as Record<string, unknown>)[whereKey] = Raw(
        (alias) => `CAST(${alias} AS TEXT) ILIKE :search`,
        { search: searchPattern },
      );
    } else {
      (where as Record<string, unknown>)[whereKey] = ILike(searchPattern);
    }
  }

  const fromDate = dateOnlyBoundary(createdFrom, 'start');
  const toDate = dateOnlyBoundary(createdTo, 'end');

  if (fromDate && toDate && fromDate > toDate) {
    const tmp = fromDate;
    (fromDate as unknown as Date) = toDate;
    (toDate as unknown as Date) = tmp;
  }

  if (fromDate && toDate) {
    (where as Record<string, unknown>).createdAt = Between(fromDate, toDate);
  } else if (fromDate) {
    (where as Record<string, unknown>).createdAt = MoreThanOrEqual(fromDate);
  } else if (toDate) {
    (where as Record<string, unknown>).createdAt = LessThanOrEqual(toDate);
  }

  const order: FindOptionsOrder<T> = {
    [sortField as keyof T]: sortOrder,
  } as FindOptionsOrder<T>;

  const [entities, count] = await repo.findAndCount({
    where,
    order,
    skip,
    take,
  });

  return {
    count,
    results: entities,
    totalPages: Math.ceil(count / take),
    page: Number(page),
    take: Number(take),
  };
}
