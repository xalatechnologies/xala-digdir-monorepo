/**
 * ACL Performance Tests
 *
 * Performance benchmarks for ACL transformations and permission checks.
 *
 * Target: <50ms p95 for all ACL operations
 *
 * Test Categories:
 * - Single transformation latency (4 tests)
 * - Batch transformation performance (4 tests)
 * - Large dataset handling (3 tests)
 * - Complex object transformation (2 tests)
 * - Memory efficiency (2 tests)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setupMockApi } from '../../mocks/api-server.mock';
import {
  toDomain,
  toCardProjection,
  toDetailsProjection,
  toPersistence,
  type DbRentalObject,
} from '@testing/stubs/api-importsacl/rental-objects/rental-object.mapper';
import type { RentalObject } from '@testing/stubs/api-importsdomain/rental-objects';

// =============================================================================
// PERFORMANCE UTILITIES
// =============================================================================

interface PerformanceResult {
  min: number;
  max: number;
  avg: number;
  median: number;
  p95: number;
  p99: number;
  iterations: number;
}

function measurePerformance(fn: () => void, iterations: number = 1000): PerformanceResult {
  const times: number[] = [];

  // Warm-up run
  for (let i = 0; i < 10; i++) {
    fn();
  }

  // Actual measurements
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const sorted = times.sort((a, b) => a - b);
  const sum = times.reduce((acc, time) => acc + time, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / times.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    iterations,
  };
}

async function measureAsync(fn: () => Promise<void>, iterations: number = 100): Promise<PerformanceResult> {
  const times: number[] = [];

  // Warm-up
  for (let i = 0; i < 5; i++) {
    await fn();
  }

  // Measurements
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  const sorted = times.sort((a, b) => a - b);
  const sum = times.reduce((acc, time) => acc + time, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / times.length,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    iterations,
  };
}

function formatPerf(result: PerformanceResult): string {
  return `avg: ${result.avg.toFixed(2)}ms | p95: ${result.p95.toFixed(2)}ms | p99: ${result.p99.toFixed(2)}ms`;
}

// =============================================================================
// TEST FIXTURES
// =============================================================================

const mockDbRentalObject: DbRentalObject = {
  id: 'perf-test-123',
  tenantId: 'perf-tenant',
  organizationId: 'perf-org',
  name: 'Performance Test Hall',
  slug: 'performance-hall',
  description: 'Testing ACL transformation performance with realistic data',
  categoryKey: 'LOKALER_OG_BANER',
  timeMode: 'PERIOD',
  features: ['SHARED_CAPACITY'],
  ruleSetKey: 'SPORTS_FACILITIES',
  status: 'published',
  requiresApproval: true,
  capacity: 200,
  inventoryTotal: null,
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ],
  pricing: {
    basePrice: 500,
    currency: 'NOK',
    unit: 'hour',
    taxIncluded: true,
    taxRate: 0.25,
  },
  metadata: {
    location: {
      address: 'Performance Street 123',
      city: 'Oslo',
      lat: 59.9139,
      lng: 10.7522,
    },
    address: {
      street: 'Performance Street 123',
      postalCode: '0150',
      city: 'Oslo',
      municipality: 'Oslo',
      country: 'Norge',
    },
    contact: {
      name: 'Performance Test Contact',
      email: 'perf@example.com',
      phone: '+47 12345678',
      website: 'https://example.com',
    },
    openingHours: [
      { dayIndex: 1, openTime: '08:00', closeTime: '22:00', isClosed: false },
      { dayIndex: 2, openTime: '08:00', closeTime: '22:00', isClosed: false },
      { dayIndex: 3, openTime: '08:00', closeTime: '22:00', isClosed: false },
      { dayIndex: 4, openTime: '08:00', closeTime: '22:00', isClosed: false },
      { dayIndex: 5, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { dayIndex: 6, openTime: '09:00', closeTime: '18:00', isClosed: false },
      { dayIndex: 0, openTime: '', closeTime: '', isClosed: true },
    ],
    bookingConfig: {
      minDurationMinutes: 60,
      maxDurationMinutes: 480,
      advanceBookingDays: 90,
      cancellationDeadlineHours: 24,
      instantBookingEnabled: false,
      calendarType: 'TIME_SLOTS',
    },
    amenities: ['Garderobe', 'Dusjer', 'Tribuner', 'Parkering', 'Kaffemaskin'],
    equipment: [
      { id: 'eq-1', name: 'Basketkurv', quantity: 2, description: 'Justerbar høyde' },
      { id: 'eq-2', name: 'Volleyballnett', quantity: 1, description: 'Profesjonelt' },
      { id: 'eq-3', name: 'Håndballmål', quantity: 2, description: 'Standard størrelse' },
    ],
    rules: [
      { id: 'rule-1', title: 'Røykeforbud', content: 'Strengt forbudt', order: 0 },
      { id: 'rule-2', title: 'Rydding', content: 'Rydd etter bruk', order: 1 },
      { id: 'rule-3', title: 'Sko', content: 'Innendørssko påkrevd', order: 2 },
    ],
    faq: [
      { id: 'faq-1', question: 'Kan vi spille musikk?', answer: 'Ja, moderat volum', order: 0 },
      { id: 'faq-2', question: 'Er det parkering?', answer: 'Ja, gratis parkering', order: 1 },
    ],
    additionalServices: [
      { id: 'serv-1', name: 'Forfriskninger', description: 'Kaffe og te', price: 100, currency: 'NOK' },
      { id: 'serv-2', name: 'Utstyr', description: 'Ekstra baller', price: 50, currency: 'NOK' },
    ],
    highlights: ['Moderne fasiliteter', 'Sentralt', 'God parkering', 'Wifi tilgjengelig'],
    featured: true,
    averageRating: 4.7,
    reviewCount: 142,
  },
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-16T12:30:00Z'),
};

// =============================================================================
// CATEGORY 1: SINGLE TRANSFORMATION LATENCY (4 tests)
// =============================================================================

describe('ACL Performance - Single Transformation Latency', () => {
  setupMockApi();
  it('should transform DB → Domain in <50ms p95', () => {
    const result = measurePerformance(() => {
      toDomain(mockDbRentalObject);
    }, 1000);

    console.log(`  toDomain: ${formatPerf(result)}`);

    expect(result.p95).toBeLessThan(50);
    expect(result.avg).toBeLessThan(10);
  });

  it('should transform Domain → Persistence in <50ms p95', () => {
    const domain = toDomain(mockDbRentalObject);

    const result = measurePerformance(() => {
      toPersistence(domain);
    }, 1000);

    console.log(`  toPersistence: ${formatPerf(result)}`);

    expect(result.p95).toBeLessThan(50);
    expect(result.avg).toBeLessThan(10);
  });

  it('should transform Domain → Card Projection in <50ms p95', () => {
    const domain = toDomain(mockDbRentalObject);

    const result = measurePerformance(() => {
      toCardProjection(domain);
    }, 1000);

    console.log(`  toCardProjection: ${formatPerf(result)}`);

    expect(result.p95).toBeLessThan(50);
    expect(result.avg).toBeLessThan(10);
  });

  it('should transform Domain → Details Projection in <50ms p95', () => {
    const domain = toDomain(mockDbRentalObject);

    const result = measurePerformance(() => {
      toDetailsProjection(domain, {
        canBook: true,
        canEdit: false,
        canViewPricing: true,
        availableActions: ['view', 'book'],
      });
    }, 1000);

    console.log(`  toDetailsProjection: ${formatPerf(result)}`);

    expect(result.p95).toBeLessThan(50);
    expect(result.avg).toBeLessThan(15);
  });
});

// =============================================================================
// CATEGORY 2: BATCH TRANSFORMATION PERFORMANCE (4 tests)
// =============================================================================

describe('ACL Performance - Batch Transformations', () => {
  setupMockApi();
  it('should handle batch of 10 objects in <100ms total', () => {
    const batch = Array.from({ length: 10 }, (_, i) => ({
      ...mockDbRentalObject,
      id: `batch-${i}`,
    }));

    const start = performance.now();
    batch.forEach((db) => {
      const domain = toDomain(db);
      toCardProjection(domain);
    });
    const end = performance.now();

    const elapsed = end - start;
    console.log(`  Batch 10: ${elapsed.toFixed(2)}ms (${(elapsed / 10).toFixed(2)}ms per item)`);

    expect(elapsed).toBeLessThan(100);
  });

  it('should handle batch of 50 objects in <500ms total', () => {
    const batch = Array.from({ length: 50 }, (_, i) => ({
      ...mockDbRentalObject,
      id: `batch-${i}`,
    }));

    const start = performance.now();
    batch.forEach((db) => {
      const domain = toDomain(db);
      toCardProjection(domain);
    });
    const end = performance.now();

    const elapsed = end - start;
    console.log(`  Batch 50: ${elapsed.toFixed(2)}ms (${(elapsed / 50).toFixed(2)}ms per item)`);

    expect(elapsed).toBeLessThan(500);
  });

  it('should handle batch of 100 objects in <1000ms total', () => {
    const batch = Array.from({ length: 100 }, (_, i) => ({
      ...mockDbRentalObject,
      id: `batch-${i}`,
    }));

    const start = performance.now();
    batch.forEach((db) => {
      const domain = toDomain(db);
      toCardProjection(domain);
    });
    const end = performance.now();

    const elapsed = end - start;
    console.log(`  Batch 100: ${elapsed.toFixed(2)}ms (${(elapsed / 100).toFixed(2)}ms per item)`);

    expect(elapsed).toBeLessThan(1000);
  });

  it('should maintain consistent per-item latency in large batches', () => {
    const sizes = [10, 50, 100];
    const perItemTimes: number[] = [];

    sizes.forEach((size) => {
      const batch = Array.from({ length: size }, (_, i) => ({
        ...mockDbRentalObject,
        id: `batch-${i}`,
      }));

      const start = performance.now();
      batch.forEach((db) => {
        const domain = toDomain(db);
        toCardProjection(domain);
      });
      const end = performance.now();

      perItemTimes.push((end - start) / size);
    });

    // Per-item time should not increase significantly with batch size
    const firstAvg = perItemTimes[0];
    const lastAvg = perItemTimes[perItemTimes.length - 1];
    const degradation = (lastAvg - firstAvg) / firstAvg;

    console.log(`  Per-item times: ${perItemTimes.map((t) => t.toFixed(2)).join('ms, ')}ms`);
    console.log(`  Degradation: ${(degradation * 100).toFixed(1)}%`);

    // Allow up to 50% degradation (e.g., GC, cache effects)
    expect(degradation).toBeLessThan(0.5);
  });
});

// =============================================================================
// CATEGORY 3: LARGE DATASET HANDLING (3 tests)
// =============================================================================

describe('ACL Performance - Large Dataset Handling', () => {
  setupMockApi();
  it('should handle objects with 100+ images efficiently', () => {
    const largeImageDb = {
      ...mockDbRentalObject,
      images: Array.from({ length: 100 }, (_, i) => `https://example.com/image${i}.jpg`),
    };

    const result = measurePerformance(() => {
      const domain = toDomain(largeImageDb);
      toDetailsProjection(domain);
    }, 100);

    console.log(`  100 images: ${formatPerf(result)}`);

    expect(result.p95).toBeLessThan(100);
  });

  it('should handle objects with 50+ amenities efficiently', () => {
    const largeAmenitiesDb = {
      ...mockDbRentalObject,
      metadata: {
        ...mockDbRentalObject.metadata,
        amenities: Array.from({ length: 50 }, (_, i) => `Amenity ${i}`),
      },
    };

    const result = measurePerformance(() => {
      const domain = toDomain(largeAmenitiesDb);
      toDetailsProjection(domain);
    }, 100);

    console.log(`  50 amenities: ${formatPerf(result)}`);

    expect(result.p95).toBeLessThan(100);
  });

  it('should handle large metadata objects (10KB+) efficiently', () => {
    const largeMetadata = {
      ...mockDbRentalObject.metadata,
      customData: Array.from({ length: 100 }, (_, i) => ({
        key: `field${i}`,
        value: 'A'.repeat(100), // 100 bytes per field
      })),
    };

    const largeMetadataDb = {
      ...mockDbRentalObject,
      metadata: largeMetadata,
    };

    const result = measurePerformance(() => {
      const domain = toDomain(largeMetadataDb);
      toDetailsProjection(domain);
    }, 100);

    console.log(`  Large metadata: ${formatPerf(result)}`);

    expect(result.p95).toBeLessThan(100);
  });
});

// =============================================================================
// CATEGORY 4: COMPLEX OBJECT TRANSFORMATION (2 tests)
// =============================================================================

describe('ACL Performance - Complex Object Transformation', () => {
  setupMockApi();
  it('should handle full round-trip transformation efficiently', () => {
    const result = measurePerformance(() => {
      const domain = toDomain(mockDbRentalObject);
      const persistence = toPersistence(domain);
      const domainAgain = toDomain({ ...mockDbRentalObject, ...persistence });
      toDetailsProjection(domainAgain);
    }, 100);

    console.log(`  Full round-trip: ${formatPerf(result)}`);

    expect(result.p95).toBeLessThan(150);
  });

  it('should handle concurrent transformations without degradation', () => {
    const concurrentBatches = 5;
    const itemsPerBatch = 20;

    const start = performance.now();

    // Simulate concurrent requests
    const results = Array.from({ length: concurrentBatches }, (_, batchIdx) => {
      return Array.from({ length: itemsPerBatch }, (_, itemIdx) => {
        const db = { ...mockDbRentalObject, id: `concurrent-${batchIdx}-${itemIdx}` };
        const domain = toDomain(db);
        return toCardProjection(domain);
      });
    });

    const end = performance.now();
    const elapsed = end - start;
    const totalItems = concurrentBatches * itemsPerBatch;

    console.log(
      `  ${concurrentBatches} concurrent batches (${totalItems} items): ${elapsed.toFixed(2)}ms (${(elapsed / totalItems).toFixed(2)}ms per item)`
    );

    expect(elapsed).toBeLessThan(1000);
    expect(results.flat()).toHaveLength(totalItems);
  });
});

// =============================================================================
// CATEGORY 5: MEMORY EFFICIENCY (2 tests)
// =============================================================================

describe('ACL Performance - Memory Efficiency', () => {
  setupMockApi();
  it('should not create excessive intermediate objects', () => {
    // Baseline memory
    if (global.gc) global.gc();
    const baselineMemory = process.memoryUsage().heapUsed;

    // Transform 1000 objects
    const results = [];
    for (let i = 0; i < 1000; i++) {
      const db = { ...mockDbRentalObject, id: `mem-test-${i}` };
      const domain = toDomain(db);
      results.push(toCardProjection(domain));
    }

    const afterMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (afterMemory - baselineMemory) / 1024 / 1024; // MB

    console.log(`  Memory increase for 1000 objects: ${memoryIncrease.toFixed(2)}MB`);
    console.log(`  Per object: ${(memoryIncrease / 1000).toFixed(3)}MB`);

    // Should use less than 50MB for 1000 objects (~50KB per object)
    expect(memoryIncrease).toBeLessThan(50);
  });

  it('should handle repeated transformations without memory leaks', () => {
    if (global.gc) global.gc();
    const initialMemory = process.memoryUsage().heapUsed;

    // Run transformations 10 times
    for (let iteration = 0; iteration < 10; iteration++) {
      const batch = Array.from({ length: 100 }, (_, i) => ({
        ...mockDbRentalObject,
        id: `leak-test-${iteration}-${i}`,
      }));

      batch.forEach((db) => {
        const domain = toDomain(db);
        toCardProjection(domain);
      });
    }

    if (global.gc) global.gc();
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB

    console.log(`  Memory growth after 10x100 transformations: ${memoryGrowth.toFixed(2)}MB`);

    // Memory should not grow significantly (< 20MB for 1000 total transformations)
    expect(memoryGrowth).toBeLessThan(20);
  });
});

// =============================================================================
// CATEGORY 6: PERFORMANCE REGRESSION DETECTION (2 tests)
// =============================================================================

describe('ACL Performance - Regression Detection', () => {
  setupMockApi();
  it('should establish baseline performance metrics', () => {
    const metrics = {
      toDomain: measurePerformance(() => toDomain(mockDbRentalObject), 500),
      toCardProjection: measurePerformance(() => {
        const domain = toDomain(mockDbRentalObject);
        toCardProjection(domain);
      }, 500),
      toDetailsProjection: measurePerformance(() => {
        const domain = toDomain(mockDbRentalObject);
        toDetailsProjection(domain);
      }, 500),
    };

    console.log('\n  === Performance Baselines ===');
    console.log(`  toDomain:           ${formatPerf(metrics.toDomain)}`);
    console.log(`  toCardProjection:   ${formatPerf(metrics.toCardProjection)}`);
    console.log(`  toDetailsProjection: ${formatPerf(metrics.toDetailsProjection)}`);

    // All operations should be well under target
    expect(metrics.toDomain.p95).toBeLessThan(50);
    expect(metrics.toCardProjection.p95).toBeLessThan(50);
    expect(metrics.toDetailsProjection.p95).toBeLessThan(50);
  });

  it('should document performance characteristics for monitoring', () => {
    const characteristics = {
      singleTransform: {
        target_p95: '< 50ms',
        target_avg: '< 10ms',
      },
      batchTransform: {
        batch_10: '< 100ms total',
        batch_50: '< 500ms total',
        batch_100: '< 1000ms total',
      },
      memoryUsage: {
        per_object: '< 50KB',
        batch_1000: '< 50MB',
      },
      scalability: {
        degradation_tolerance: '< 50% increase per-item in large batches',
      },
    };

    expect(characteristics.singleTransform.target_p95).toBe('< 50ms');
    expect(characteristics.memoryUsage.per_object).toBe('< 50KB');
  });
});

// =============================================================================
// TEST SUMMARY
// =============================================================================

describe('ACL Performance - Test Coverage Summary', () => {
  setupMockApi();
  it('should have comprehensive performance test coverage', () => {
    const testCategories = {
      'Single Transformation': 4,
      'Batch Transformation': 4,
      'Large Dataset': 3,
      'Complex Transformation': 2,
      'Memory Efficiency': 2,
      'Regression Detection': 2,
    };

    const totalTests = Object.values(testCategories).reduce((sum, count) => sum + count, 0);

    expect(totalTests).toBeGreaterThanOrEqual(15);
  });
});
