import { describe, it, expect } from 'vitest';
import { platformSchema, tenants } from '@digilist/database-schema';

// SKIPPED
describe.skip('Schema Debug', () => {
  it('platformSchema should be defined', () => {
    console.log('platformSchema:', platformSchema);
    expect(platformSchema).toBeDefined();
  });

  it('tenants should be defined', () => {
    console.log('tenants:', tenants);
    expect(tenants).toBeDefined();
  });
});
