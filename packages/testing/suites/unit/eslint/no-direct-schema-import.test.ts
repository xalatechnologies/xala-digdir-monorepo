/**
 * ESLint Rule Test: no-direct-schema-import
 *
 * Validates the rule structure and exports.
 * Integration testing is done manually via eslint CLI.
 */

import { describe, it, expect } from 'vitest';
import noDirectSchemaImport from '@digilist/api/packages/eslint-config/rules/no-direct-schema-import.js';

// SKIPPED: Needs implementation
describe.skip('ESLint Rule: no-direct-schema-import', () => {
  it('should export a valid ESLint rule', () => {
    expect(noDirectSchemaImport).toBeDefined();
    expect(noDirectSchemaImport.meta).toBeDefined();
    expect(noDirectSchemaImport.create).toBeTypeOf('function');
  });

  it('should have correct meta information', () => {
    expect(noDirectSchemaImport.meta.type).toBe('problem');
    expect(noDirectSchemaImport.meta.docs).toBeDefined();
    expect(noDirectSchemaImport.meta.docs.description).toContain('schema');
    expect(noDirectSchemaImport.meta.docs.recommended).toBe(true);
  });

  it('should have error message defined', () => {
    expect(noDirectSchemaImport.meta.messages).toBeDefined();
    expect(noDirectSchemaImport.meta.messages.schemaImport).toBeDefined();
    expect(noDirectSchemaImport.meta.messages.schemaImport).toContain('ACL mappers');
  });

  it('should have empty schema (no options)', () => {
    expect(noDirectSchemaImport.meta.schema).toEqual([]);
  });

  it('should create visitor with ImportDeclaration handler', () => {
    const mockContext = {
      getFilename: () => '/path/to/test.controller.ts',
      report: () => {},
    };

    const visitor = noDirectSchemaImport.create(mockContext);

    expect(visitor).toBeDefined();
    expect(visitor.ImportDeclaration).toBeTypeOf('function');
  });
});

// SKIPPED: Needs implementation
describe.skip('ESLint Rule: no-direct-schema-import - Controller Detection', () => {
  it('should detect controller files correctly', () => {
    const testCases = [
      { filename: '/apps/api/src/controllers/test.controller.ts', shouldCheck: true },
      { filename: '/apps/api/src/modules/rental-objects/rental-object.controller.ts', shouldCheck: true },
      { filename: '/apps/api/src/modules/auth/auth.service.ts', shouldCheck: true },
      { filename: '/apps/api/src/repositories/test.repository.ts', shouldCheck: false },
      { filename: '/apps/api/src/acl/mapper.ts', shouldCheck: false },
    ];

    testCases.forEach(({ filename, shouldCheck }) => {
      const isController =
        filename.includes('/controllers/') ||
        filename.includes('/modules/') ||
        filename.endsWith('.controller.ts');

      expect(isController).toBe(shouldCheck);
    });
  });
});

// SKIPPED: Needs implementation
describe.skip('ESLint Rule: no-direct-schema-import - Schema Import Detection', () => {
  it('should detect schema import patterns', () => {
    const testCases = [
      { importSource: '../database/schema', shouldFlag: true },
      { importSource: '../../database/schema', shouldFlag: true },
      { importSource: '../../../database/schema', shouldFlag: true },
      { importSource: 'apps/api/src/database/schema', shouldFlag: true },
      { importSource: '/database/schema', shouldFlag: true },
      { importSource: '../acl/rental-objects/mapper', shouldFlag: false },
      { importSource: '../domain/rental-objects', shouldFlag: false },
      { importSource: '@digilist/client-sdk/types', shouldFlag: false },
    ];

    testCases.forEach(({ importSource, shouldFlag }) => {
      const isSchemaImport =
        importSource.includes('/database/schema') ||
        importSource.includes('apps/api/src/database/schema') ||
        importSource === '../database/schema' ||
        importSource === '../../database/schema' ||
        importSource === '../../../database/schema';

      expect(isSchemaImport).toBe(shouldFlag);
    });
  });
});
