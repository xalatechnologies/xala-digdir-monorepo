/**
 * Designsystemet Compliance Tests
 * 
 * Tests DS component exports are available
 */

import { describe, it, expect } from 'vitest';
import * as ds from '@xalatechnologies/platform/ui';

describe('Designsystemet Compliance', () => {
  describe('Core Exports', () => {
    it('should export DataTable', () => {
      expect(ds.DataTable).toBeDefined();
    });

    it('should export ListToolbar', () => {
      expect(ds.ListToolbar).toBeDefined();
    });

    // Note: FilterChip may need to be added to vitest.setup.ts mock
  });

  describe('Icon Exports', () => {
    it('should export SearchIcon', () => {
      expect(ds.SearchIcon).toBeDefined();
    });

    it('should export CalendarIcon', () => {
      expect(ds.CalendarIcon).toBeDefined();
    });
  });

  describe('Layout Components', () => {
    it('should export DashboardHeader', () => {
      expect(ds.DashboardHeader).toBeDefined();
    });

    it('should export DashboardSidebar', () => {
      expect(ds.DashboardSidebar).toBeDefined();
    });
  });
});
