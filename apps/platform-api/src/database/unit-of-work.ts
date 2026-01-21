/**
 * Unit of Work Pattern
 * Transaction management across multiple repositories
 */

/**
 * Unit of Work interface for transactional operations
 */
export interface IUnitOfWork {
  /**
   * Begin a new transaction
   */
  begin(): Promise<void>;

  /**
   * Commit the current transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the current transaction
   */
  rollback(): Promise<void>;

  /**
   * Execute work within a transaction
   */
  transaction<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
}

/**
 * Drizzle Unit of Work implementation
 */
export class DrizzleUnitOfWork implements IUnitOfWork {
  private transactionClient: any = null;
  private isInTransaction = false;

  constructor(private readonly db: any) {}

  /**
   * Get the current database client (transaction or regular)
   */
  getClient(): any {
    return this.transactionClient || this.db;
  }

  /**
   * Check if currently in a transaction
   */
  isTransactionActive(): boolean {
    return this.isInTransaction;
  }

  /**
   * Begin a new transaction
   */
  async begin(): Promise<void> {
    if (this.isInTransaction) {
      throw new Error('Transaction already in progress');
    }
    // Note: Drizzle uses callback-based transactions, so this is a placeholder
    this.isInTransaction = true;
  }

  /**
   * Commit the current transaction
   */
  async commit(): Promise<void> {
    if (!this.isInTransaction) {
      throw new Error('No transaction in progress');
    }
    this.isInTransaction = false;
    this.transactionClient = null;
  }

  /**
   * Rollback the current transaction
   */
  async rollback(): Promise<void> {
    if (!this.isInTransaction) {
      throw new Error('No transaction in progress');
    }
    this.isInTransaction = false;
    this.transactionClient = null;
  }

  /**
   * Execute work within a transaction
   * Uses Drizzle's transaction callback pattern
   */
  async transaction<T>(work: (uow: DrizzleUnitOfWork) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx: any) => {
      const scopedUow = new DrizzleUnitOfWork(tx);
      scopedUow.transactionClient = tx;
      scopedUow.isInTransaction = true;

      try {
        const result = await work(scopedUow);
        return result;
      } catch (error) {
        // Transaction will be automatically rolled back by Drizzle on error
        throw error;
      }
    });
  }
}

/**
 * Create a transactional wrapper for a function
 */
export function transactional<TArgs extends unknown[], TResult>(
  db: any,
  fn: (uow: DrizzleUnitOfWork, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const uow = new DrizzleUnitOfWork(db);
    return uow.transaction((scopedUow) => fn(scopedUow, ...args));
  };
}
