/**
 * DS Component Tests - Smoke Tests
 * 
 * Tests DS component availability
 * Note: @xalatechnologies/platform/ui is partially mocked globally in vitest.setup.ts
 * So we verify the mocked icons work correctly
 */

import { describe, it, expect } from 'vitest';
import * as ds from '@xalatechnologies/platform/ui';

describe('DS Component Module', () => {
  it('should export the DS module', () => {
    expect(ds).toBeDefined();
    expect(typeof ds).toBe('object');
  });

  it('should have mocked icons available', () => {
    // These are mocked in vitest.setup.ts
    expect(ds.SearchIcon).toBeDefined();
    expect(ds.CalendarIcon).toBeDefined();
    expect(ds.BuildingIcon).toBeDefined();
    expect(ds.PeopleIcon).toBeDefined();
  });

  it('should have core exports from actual module', () => {
    // DataTable and ListToolbar are re-exported from actual module
    expect(ds.DataTable).toBeDefined();
    expect(ds.ListToolbar).toBeDefined();
  });
});
