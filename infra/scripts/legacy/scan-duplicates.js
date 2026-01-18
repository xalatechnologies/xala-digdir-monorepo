#!/usr/bin/env node

/**
 * Duplicate Code Scanner
 *
 * Prevents code inconsistencies by detecting:
 * - Duplicate controllers for the same feature
 * - Duplicate seed files
 * - Duplicate schema definitions
 * - Naming inconsistencies
 *
 * Usage:
 *   node scripts/scan-duplicates.js
 *   node scripts/scan-duplicates.js --strict  # Exit with error code if issues found
 *
 * Exit codes:
 *   0: No issues found
 *   1: Issues found (only with --strict flag)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Assuming this script is at infra/scripts/legacy/scan-duplicates.js
// We need to go up 3 levels to reach repo root (legacy -> scripts -> infra -> root)
const ROOT_DIR = path.resolve(__dirname, '../../..');

/**
 * Recursively find files matching a pattern
 */
function findFiles(dir, pattern, results = []) {
  if (!fs.existsSync(dir)) return results;

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      findFiles(fullPath, pattern, results);
    } else if (pattern.test(file.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

const STRICT_MODE = process.argv.includes('--strict');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Feature domains that should have exactly ONE controller
 */
const FEATURE_DOMAINS = [
  'auth',
  'tenant',
  'rental-object',
  'booking',
  'user',
  'monitoring',
  'dashboard',
  'calendar',
  'seasonal-lease',
  'messages',
  'reports',
  'organizations',
  'conversations',
  'allocations',
  'availability',
  'authz',
  'public',
  'audit',
  'settings',
  'discount-codes',
  'health',
  'categories',
  'access-grant',
  'permission-assignment',
  'case-handler-scope',
  'integrations',
  'widgets',
  'share',
  'help',
  'notifications',
  'pricing',
  'user-groups',
  'backoffice',
  'search',
  'seasons',
  'blocks',
  'profile',
  'reviews',
  'saas',
  'tenant-admin',
  'storage',
];

/**
 * Known aliases that should be consolidated
 */
const KNOWN_ALIASES = {
  'idporten': ['signicat', 'bankid', 'eid-hub'],
  'rental-object': ['listing', 'facility', 'resource'],
  'organization': ['kommune', 'municipality'],
};

/**
 * Scan for duplicate controllers
 */
async function scanControllers() {
  log('\n📋 Scanning for duplicate controllers...', 'cyan');

  const modulesDir = path.join(ROOT_DIR, 'apps/api/src/modules');
  const controllerFiles = findFiles(modulesDir, /\.controller\.(ts|js)$/);

  const issues = [];
  const controllersByDomain = new Map();

  for (const file of controllerFiles) {
    const filename = path.basename(file);
    const relativePath = path.relative(ROOT_DIR, file);

    // Extract domain from filename (e.g., "idporten.controller.ts" -> "idporten")
    const match = filename.match(/^([a-z-]+)\.controller\.[tj]s$/);
    if (!match) continue;

    const domain = match[1];

    // Check for known aliases
    let canonicalDomain = domain;
    for (const [canonical, aliases] of Object.entries(KNOWN_ALIASES)) {
      if (aliases.includes(domain)) {
        canonicalDomain = canonical;
        issues.push({
          type: 'alias',
          severity: 'error',
          domain,
          canonical: canonicalDomain,
          file: relativePath,
          message: `Controller uses alias "${domain}" instead of canonical name "${canonicalDomain}"`,
        });
      }
    }

    if (!controllersByDomain.has(canonicalDomain)) {
      controllersByDomain.set(canonicalDomain, []);
    }
    controllersByDomain.get(canonicalDomain).push(relativePath);
  }

  // Check for duplicates
  for (const [domain, files] of controllersByDomain.entries()) {
    if (files.length > 1) {
      issues.push({
        type: 'duplicate',
        severity: 'error',
        domain,
        files,
        message: `Multiple controllers found for "${domain}" domain: ${files.join(', ')}`,
      });
    }
  }

  return issues;
}

/**
 * Scan for duplicate seed files
 */
async function scanSeeds() {
  log('\n🌱 Scanning for duplicate seed files...', 'cyan');

  const seedsDir = path.join(ROOT_DIR, 'apps/api/src/database/seeds');
  const seedFiles = findFiles(seedsDir, /\.(ts|js)$/);

  const issues = [];
  const seedsByEntity = new Map();

  for (const file of seedFiles) {
    const filename = path.basename(file, path.extname(file));
    const relativePath = path.relative(ROOT_DIR, file);

    // Extract entity name (e.g., "001-users.ts" -> "users", "seed-tenants.ts" -> "tenants")
    const entityMatch = filename.match(/(?:\d+-)?(?:seed-)?([a-z-]+)/);
    if (!entityMatch) continue;

    const entity = entityMatch[1];

    if (!seedsByEntity.has(entity)) {
      seedsByEntity.set(entity, []);
    }
    seedsByEntity.get(entity).push(relativePath);
  }

  // Check for duplicates
  for (const [entity, files] of seedsByEntity.entries()) {
    if (files.length > 1) {
      issues.push({
        type: 'duplicate',
        severity: 'error',
        entity,
        files,
        message: `Multiple seed files found for "${entity}": ${files.join(', ')}`,
      });
    }
  }

  return issues;
}

/**
 * Scan for duplicate schema definitions
 */
async function scanSchemas() {
  log('\n📊 Scanning for duplicate schema definitions...', 'cyan');

  const schemaDir = path.join(ROOT_DIR, 'apps/api/src/database/schema');
  const schemaFiles = findFiles(schemaDir, /\.(ts|js)$/);

  const issues = [];
  const tableDefinitions = new Map();

  for (const file of schemaFiles) {
    const relativePath = path.relative(ROOT_DIR, file);
    const content = fs.readFileSync(file, 'utf-8');

    // Extract table definitions using regex
    // Matches: export const tableName = pgTable('table_name', {
    const tableMatches = content.matchAll(/export\s+const\s+(\w+)\s+=\s+pgTable\(['"]([^'"]+)['"]/g);

    for (const match of tableMatches) {
      const [, variableName, tableName] = match;

      if (!tableDefinitions.has(tableName)) {
        tableDefinitions.set(tableName, []);
      }
      tableDefinitions.get(tableName).push({
        file: relativePath,
        variable: variableName,
      });
    }
  }

  // Check for duplicates
  for (const [tableName, definitions] of tableDefinitions.entries()) {
    if (definitions.length > 1) {
      issues.push({
        type: 'duplicate',
        severity: 'error',
        table: tableName,
        definitions,
        message: `Table "${tableName}" defined in multiple files: ${definitions.map(d => d.file).join(', ')}`,
      });
    }
  }

  return issues;
}

/**
 * Scan main.ts for controller registration inconsistencies
 */
async function scanMainTs() {
  log('\n📝 Scanning main.ts for registration inconsistencies...', 'cyan');

  const mainTsPath = path.join(ROOT_DIR, 'apps/api/src/main.ts');
  if (!fs.existsSync(mainTsPath)) {
    return [{ type: 'error', severity: 'error', message: 'main.ts not found' }];
  }

  const content = fs.readFileSync(mainTsPath, 'utf-8');
  const issues = [];

  // Extract imported controllers (handles multi-controller imports)
  const importMatches = content.matchAll(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g);
  const importedControllers = new Set();
  for (const match of importMatches) {
    const imports = match[1].split(',').map(s => s.trim());
    for (const imp of imports) {
      if (imp.includes('Controller')) {
        importedControllers.add(imp);
      }
    }
  }

  // Extract registered controllers in container.registerFactory
  const registerMatches = content.matchAll(/container\.registerFactory\(['"](\w+Controller)['"]/g);
  const registeredControllers = new Set();
  for (const match of registerMatches) {
    registeredControllers.add(match[1]);
  }

  // Extract controllers in the controllers array
  const controllersArrayMatch = content.match(/const controllers = \[([\s\S]*?)\];/);
  const arrayControllers = new Set();
  if (controllersArrayMatch) {
    const arrayContent = controllersArrayMatch[1];
    const controllerMatches = arrayContent.matchAll(/(\w+Controller)/g);
    for (const match of controllerMatches) {
      arrayControllers.add(match[1]);
    }
  }

  // Check for imported but not registered
  for (const controller of importedControllers) {
    if (!registeredControllers.has(controller) && !arrayControllers.has(controller)) {
      issues.push({
        type: 'unused-import',
        severity: 'warning',
        controller,
        message: `Controller "${controller}" imported but not registered or used`,
      });
    }
  }

  // Check for registered but not in array
  for (const controller of registeredControllers) {
    if (!arrayControllers.has(controller)) {
      issues.push({
        type: 'unused-registration',
        severity: 'warning',
        controller,
        message: `Controller "${controller}" registered in container but not in controllers array`,
      });
    }
  }

  // Check for in array but not imported
  for (const controller of arrayControllers) {
    if (!importedControllers.has(controller)) {
      issues.push({
        type: 'missing-import',
        severity: 'error',
        controller,
        message: `Controller "${controller}" used in array but not imported`,
      });
    }
  }

  return issues;
}

/**
 * Print report
 */
function printReport(allIssues) {
  const errorIssues = allIssues.filter(i => i.severity === 'error');
  const warningIssues = allIssues.filter(i => i.severity === 'warning');

  log('\n' + '='.repeat(80), 'bold');
  log('  DUPLICATE CODE SCAN REPORT', 'bold');
  log('='.repeat(80), 'bold');

  if (allIssues.length === 0) {
    log('\n✅ No issues found! Code is consistent.', 'green');
    return;
  }

  if (errorIssues.length > 0) {
    log(`\n❌ ${errorIssues.length} ERROR(S) FOUND:`, 'red');
    errorIssues.forEach((issue, index) => {
      log(`\n${index + 1}. ${issue.message}`, 'red');
      if (issue.files) {
        issue.files.forEach(file => log(`   - ${file}`, 'yellow'));
      }
      if (issue.definitions) {
        issue.definitions.forEach(def => log(`   - ${def.file} (as ${def.variable})`, 'yellow'));
      }
      if (issue.file) {
        log(`   File: ${issue.file}`, 'yellow');
      }
    });
  }

  if (warningIssues.length > 0) {
    log(`\n⚠️  ${warningIssues.length} WARNING(S) FOUND:`, 'yellow');
    warningIssues.forEach((issue, index) => {
      log(`\n${index + 1}. ${issue.message}`, 'yellow');
    });
  }

  log('\n' + '='.repeat(80), 'bold');
  log(`Total: ${errorIssues.length} errors, ${warningIssues.length} warnings`, 'bold');
  log('='.repeat(80) + '\n', 'bold');

  // Recommendations
  if (errorIssues.length > 0) {
    log('📋 RECOMMENDATIONS:', 'cyan');
    log('  1. Keep only ONE controller per feature domain', 'cyan');
    log('  2. Use canonical names (e.g., "idporten" not "signicat" or "bankid")', 'cyan');
    log('  3. Consolidate duplicate seed files', 'cyan');
    log('  4. Keep schema definitions in one file per table', 'cyan');
    log('  5. Remove unused imports from main.ts', 'cyan');
    log('');
  }
}

/**
 * Main function
 */
async function main() {
  log('\n🔍 Starting duplicate code scan...', 'bold');

  const [controllerIssues, seedIssues, schemaIssues, mainTsIssues] = await Promise.all([
    scanControllers(),
    scanSeeds(),
    scanSchemas(),
    scanMainTs(),
  ]);

  const allIssues = [
    ...controllerIssues,
    ...seedIssues,
    ...schemaIssues,
    ...mainTsIssues,
  ];

  printReport(allIssues);

  // Exit with error code in strict mode
  const hasErrors = allIssues.some(i => i.severity === 'error');
  if (STRICT_MODE && hasErrors) {
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Scanner failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
