/**
 * Base Repository Pattern
 * Generic repository interface with CRUD operations
 */
import { eq, and, sql, type InferSelectModel, type SQL } from 'drizzle-orm';
import type { PgTable, PgColumn, TableConfig } from 'drizzle-orm/pg-core';
import { NotFoundError } from '../core/errors/problem-details';

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Filter operators for queries
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'isNull' | 'isNotNull';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Base Repository Interface
 */
export interface IRepository<
  TEntity,
  TCreateDTO,
  TUpdateDTO = Partial<TCreateDTO>,
  TId = string
> {
  findById(id: TId): Promise<TEntity | null>;
  findOne(conditions: FilterCondition[]): Promise<TEntity | null>;
  findAll(params?: PaginationParams & SortParams): Promise<PaginatedResult<TEntity>>;
  findMany(conditions: FilterCondition[], params?: PaginationParams & SortParams): Promise<PaginatedResult<TEntity>>;
  create(data: TCreateDTO): Promise<TEntity>;
  createMany(data: TCreateDTO[]): Promise<TEntity[]>;
  update(id: TId, data: TUpdateDTO): Promise<TEntity>;
  delete(id: TId): Promise<void>;
  softDelete?(id: TId): Promise<void>;
  count(conditions?: FilterCondition[]): Promise<number>;
  exists(id: TId): Promise<boolean>;
}

/**
 * Abstract Base Repository with Drizzle ORM
 */
export abstract class BaseRepository<
  TTable extends PgTable<TableConfig>,
  TEntity extends InferSelectModel<TTable>,
  TCreateDTO,
  TUpdateDTO = Partial<TCreateDTO>,
  TId = string
> implements IRepository<TEntity, TCreateDTO, TUpdateDTO, TId> {

  constructor(
    protected readonly db: any, // DrizzlePostgresDatabase
    protected readonly table: TTable,
    protected readonly idColumn: PgColumn
  ) {}

  /**
   * Find entity by ID
   */
  async findById(id: TId): Promise<TEntity | null> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(this.idColumn, id))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find entity by ID or throw NotFoundError
   */
  async findByIdOrFail(id: TId): Promise<TEntity> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundError(this.getEntityName(), String(id));
    }
    return entity;
  }

  /**
   * Find one entity matching conditions
   */
  async findOne(conditions: FilterCondition[]): Promise<TEntity | null> {
    const whereClause = this.buildWhereClause(conditions);
    const results = await this.db
      .select()
      .from(this.table)
      .where(whereClause)
      .limit(1);

    return results[0] || null;
  }

  /**
   * Find all entities with pagination
   */
  async findAll(params: PaginationParams & SortParams = {}): Promise<PaginatedResult<TEntity>> {
    const { page = 1, limit = 20, offset, sortBy, sortOrder = 'desc' } = params;
    const skip = offset ?? (page - 1) * limit;

    // Get total count
    const countResult = await this.db.select({ count: sql<number>`count(*)` }).from(this.table);
    const total = Number(countResult[0]?.count || 0);

    // Get data with pagination
    let query = this.db.select().from(this.table);

    if (sortBy) {
      const column = (this.table as any)[sortBy];
      if (column) {
        query = query.orderBy(sortOrder === 'asc' ? sql`${column} asc` : sql`${column} desc`);
      }
    }

    const data = await query.limit(limit).offset(skip);

    return this.paginateResult(data, { page, limit, total });
  }

  /**
   * Find many entities matching conditions with pagination
   */
  async findMany(
    conditions: FilterCondition[],
    params: PaginationParams & SortParams = {}
  ): Promise<PaginatedResult<TEntity>> {
    const { page = 1, limit = 20, offset, sortBy, sortOrder = 'desc' } = params;
    const skip = offset ?? (page - 1) * limit;
    const whereClause = this.buildWhereClause(conditions);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(this.table)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    // Get data with pagination
    let query = this.db.select().from(this.table).where(whereClause);

    if (sortBy) {
      const column = (this.table as any)[sortBy];
      if (column) {
        query = query.orderBy(sortOrder === 'asc' ? sql`${column} asc` : sql`${column} desc`);
      }
    }

    const data = await query.limit(limit).offset(skip);

    return this.paginateResult(data, { page, limit, total });
  }

  /**
   * Create a new entity
   */
  async create(data: TCreateDTO): Promise<TEntity> {
    const result = await this.db
      .insert(this.table)
      .values(data as any)
      .returning();

    return result[0];
  }

  /**
   * Create multiple entities
   */
  async createMany(data: TCreateDTO[]): Promise<TEntity[]> {
    if (data.length === 0) return [];

    return this.db
      .insert(this.table)
      .values(data as any)
      .returning();
  }

  /**
   * Update an entity
   */
  async update(id: TId, data: TUpdateDTO): Promise<TEntity> {
    const result = await this.db
      .update(this.table)
      .set({ ...data as any, updatedAt: new Date() })
      .where(eq(this.idColumn, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundError(this.getEntityName(), String(id));
    }

    return result[0];
  }

  /**
   * Delete an entity (hard delete)
   */
  async delete(id: TId): Promise<void> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.idColumn, id))
      .returning();

    if (!result[0]) {
      throw new NotFoundError(this.getEntityName(), String(id));
    }
  }

  /**
   * Count entities matching conditions
   */
  async count(conditions?: FilterCondition[]): Promise<number> {
    let query = this.db.select({ count: sql<number>`count(*)` }).from(this.table);

    if (conditions && conditions.length > 0) {
      query = query.where(this.buildWhereClause(conditions));
    }

    const result = await query;
    return Number(result[0]?.count || 0);
  }

  /**
   * Check if entity exists
   */
  async exists(id: TId): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(this.table)
      .where(eq(this.idColumn, id));

    return Number(result[0]?.count || 0) > 0;
  }

  /**
   * Serialize value for SQL - converts Date to ISO string
   */
  private serializeValue(value: unknown): unknown {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }

  /**
   * Build WHERE clause from filter conditions
   */
  protected buildWhereClause(conditions: FilterCondition[]): SQL | undefined {
    if (conditions.length === 0) return undefined;

    const clauses = conditions.map((condition) => {
      const column = (this.table as any)[condition.field];
      if (!column) {
        throw new Error(`Unknown field: ${condition.field}`);
      }

      // Serialize the value to handle Date objects
      const value = this.serializeValue(condition.value);

      switch (condition.operator) {
        case 'eq':
          return eq(column, value);
        case 'ne':
          return sql`${column} != ${value}`;
        case 'gt':
          return sql`${column} > ${value}`;
        case 'gte':
          return sql`${column} >= ${value}`;
        case 'lt':
          return sql`${column} < ${value}`;
        case 'lte':
          return sql`${column} <= ${value}`;
        case 'like':
          return sql`${column} ILIKE ${value}`;
        case 'in':
          return sql`${column} = ANY(${value})`;
        case 'isNull':
          return sql`${column} IS NULL`;
        case 'isNotNull':
          return sql`${column} IS NOT NULL`;
        default:
          throw new Error(`Unknown operator: ${condition.operator}`);
      }
    });

    return and(...clauses);
  }

  /**
   * Create paginated result
   */
  protected paginateResult(
    data: TEntity[],
    { page, limit, total }: { page: number; limit: number; total: number }
  ): PaginatedResult<TEntity> {
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get entity name for error messages (override in subclasses)
   */
  protected getEntityName(): string {
    return this.table._.name;
  }
}
