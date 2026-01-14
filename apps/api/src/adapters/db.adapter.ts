/**
 * Database Adapter
 * Mock database for demo - replace with real Supabase/Drizzle in production
 */

interface QueryResult {
  rows: any[];
  rowCount: number;
}

/**
 * Mock database adapter
 * Simulates database operations for demo purposes
 */
export const mockDb = {
  // In-memory storage
  _storage: new Map<string, any[]>(),

  /**
   * Query - simulates SELECT queries
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T | T[] | null> {
    // This is a mock - in production, use real DB
    const tableName = this._extractTableName(sql);
    const data = this._storage.get(tableName) || [];
    
    // Simple filtering based on params (very basic mock)
    if (params && params.length > 0) {
      const [firstParam] = params;
      const result = data.find(r => r.id === firstParam || r.code === firstParam || r.listing_id === firstParam);
      return result as T;
    }
    
    return data as T[];
  },

  /**
   * Insert - simulates INSERT queries
   */
  async insert<T = any>(table: string, data: Record<string, any>): Promise<T> {
    const existing = this._storage.get(table) || [];
    const newRecord = {
      id: data.id || crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    existing.push(newRecord);
    this._storage.set(table, existing);
    return newRecord as T;
  },

  /**
   * Update - simulates UPDATE queries
   */
  async update<T = any>(table: string, id: string, data: Record<string, any>): Promise<T> {
    const existing = this._storage.get(table) || [];
    const index = existing.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Record not found: ${id}`);
    }
    existing[index] = {
      ...existing[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    this._storage.set(table, existing);
    return existing[index] as T;
  },

  /**
   * Delete - simulates DELETE queries
   */
  async delete(table: string, id: string): Promise<void> {
    const existing = this._storage.get(table) || [];
    const filtered = existing.filter(r => r.id !== id);
    this._storage.set(table, filtered);
  },

  /**
   * Extract table name from SQL (basic parser)
   */
  _extractTableName(sql: string): string {
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    const intoMatch = sql.match(/INTO\s+(\w+)/i);
    const updateMatch = sql.match(/UPDATE\s+(\w+)/i);
    return fromMatch?.[1] || intoMatch?.[1] || updateMatch?.[1] || 'unknown';
  },

  /**
   * Seed initial data
   */
  async seed(): Promise<void> {
    // User groups
    this._storage.set('user_groups', [
      { id: '00000001-0000-0000-0000-000000000001', code: 'U19', name: 'Under 19 år', description: 'Barn og ungdom under 19 år' },
      { id: '00000001-0000-0000-0000-000000000002', code: 'ADULT_ORG', name: 'Voksen organisasjon', description: 'Registrerte organisasjoner' },
      { id: '00000001-0000-0000-0000-000000000003', code: 'OTHER', name: 'Andre', description: 'Private og kommersielle' },
    ]);
    
    // Sample price rules for demo
    this._storage.set('price_rules', [
      // GYMSAL rules
      { id: 'pr-001', listing_id: '10000001-0000-0000-0000-000000000001', user_group_id: '00000001-0000-0000-0000-000000000001', rule_type: 'HOURLY', unit: 'HOUR', amount: 0, currency: 'NOK', applies_weekdays: true, applies_weekends: false, description: 'Gratis for U19', priority: 10 },
      { id: 'pr-002', listing_id: '10000001-0000-0000-0000-000000000001', user_group_id: '00000001-0000-0000-0000-000000000002', rule_type: 'HOURLY', unit: 'HOUR', amount: 9900, currency: 'NOK', applies_weekdays: true, applies_weekends: false, description: 'Voksenorg hverdag', priority: 10 },
      { id: 'pr-003', listing_id: '10000001-0000-0000-0000-000000000001', user_group_id: '00000001-0000-0000-0000-000000000003', rule_type: 'HOURLY', unit: 'HOUR', amount: 15000, currency: 'NOK', applies_weekdays: true, applies_weekends: false, description: 'Private hverdag', priority: 10 },
      { id: 'pr-004', listing_id: '10000001-0000-0000-0000-000000000001', user_group_id: null, rule_type: 'DAILY', unit: 'DAY', amount: 222500, currency: 'NOK', applies_weekdays: false, applies_weekends: true, description: 'Helgeleie gymsal', priority: 5 },
    ]);
  },
};

// Auto-seed on import
mockDb.seed();
