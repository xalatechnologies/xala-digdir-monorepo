/**
 * Test Coverage Configuration for Rental Objects Feature
 * Targets 100% coverage across all test types
 */

export const coverageTargets = {
  statements: 100,
  branches: 100,
  functions: 100,
  lines: 100,
};

export const testTypes = {
  unit: {
    enabled: true,
    threshold: 100,
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
  },
  integration: {
    enabled: true,
    threshold: 100,
    files: [
      '**/__tests__/integration/**/*.spec.ts',
    ],
  },
  e2e: {
    enabled: true,
    threshold: 100, // E2E coverage measured differently
    files: [
      'e2e/**/*.spec.ts',
    ],
  },
  performance: {
    enabled: true,
    threshold: 100,
    files: [
      '**/__tests__/performance/**/*.test.ts',
    ],
  },
  security: {
    enabled: true,
    threshold: 100,
    files: [
      '**/__tests__/security/**/*.test.ts',
    ],
  },
  scenarios: {
    enabled: true,
    threshold: 100,
    files: [
      '**/__tests__/scenarios/**/*.test.tsx',
      'e2e/scenarios/**/*.spec.ts',
    ],
  },
  storybook: {
    enabled: true,
    threshold: 100,
    files: [
      '**/*.stories.tsx',
    ],
  },
};

export const coverageExclusions = [
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/*.stories.tsx',
  '**/node_modules/**',
  '**/dist/**',
  '**/.turbo/**',
  '**/types/**',
  '**/index.ts', // Barrel exports
];
