#!/usr/bin/env node
/**
 * Seed Data Validation Script
 * Validates rental-objects-comprehensive.json against schema contracts
 *
 * Usage:
 *   node scripts/validate-seed-data.js
 *   node scripts/validate-seed-data.js --strict
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Canonical enum values (source of truth)
const VALID_CATEGORIES = [
  'LOKALER_OG_BANER',
  'UTSTYR_OG_INVENTAR',
  'KJORETOY_OG_TRANSPORT',
  'OPPLEVELSER_OG_ARRANGEMENT',
];

const VALID_TIME_MODES = ['PERIOD', 'SLOT', 'ALL_DAY'];

const VALID_STATUSES = ['draft', 'published', 'archived'];

const VALID_FEATURES = ['INVENTORY', 'SHARED_CAPACITY', 'PACKAGES'];

// Validation configuration
const strict = process.argv.includes('--strict');

// Load seed data
const seedDataPath = path.join(
  __dirname,
  '../apps/api/db/seed-data-bank/rental-objects-comprehensive.json'
);

if (!fs.existsSync(seedDataPath)) {
  console.error(`${colors.red}❌ Error: Seed data file not found at ${seedDataPath}${colors.reset}`);
  process.exit(1);
}

const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

// Validation state
const errors = [];
const warnings = [];
let totalChecks = 0;
let passedChecks = 0;

function logError(message) {
  errors.push(message);
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  warnings.push(message);
  console.warn(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logSuccess(message) {
  passedChecks++;
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.magenta}${title}${colors.reset}`);
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);
}

// Validation functions

function validateMetadata() {
  logSection('Validating Metadata');
  totalChecks++;

  if (!seedData.meta) {
    logError('Missing meta section in seed data');
    return;
  }

  logSuccess(`Version: ${seedData.meta.version}`);
  logSuccess(`Total Objects: ${seedData.meta.total_objects}`);
  logSuccess(`Schema Version: ${seedData.meta.schema_version}`);
}

function validateTenants() {
  logSection('Validating Tenants');
  totalChecks++;

  if (!seedData.tenants || seedData.tenants.length === 0) {
    logError('No tenants found in seed data');
    return;
  }

  for (const tenant of seedData.tenants) {
    if (!tenant.id) logError(`Tenant missing id: ${JSON.stringify(tenant)}`);
    if (!tenant.slug) logError(`Tenant ${tenant.id} missing slug`);
    if (!tenant.name) logError(`Tenant ${tenant.id} missing name`);
  }

  logSuccess(`${seedData.tenants.length} tenants validated`);
}

function validateOrganizations() {
  logSection('Validating Organizations');
  totalChecks++;

  if (!seedData.organizations || seedData.organizations.length === 0) {
    logError('No organizations found in seed data');
    return;
  }

  const tenantIds = seedData.tenants.map(t => t.id);

  for (const org of seedData.organizations) {
    if (!org.id) logError(`Organization missing id: ${JSON.stringify(org)}`);
    if (!org.tenant_id) logError(`Organization ${org.id} missing tenant_id`);
    if (!tenantIds.includes(org.tenant_id)) {
      logError(`Organization ${org.id} has invalid tenant_id: ${org.tenant_id}`);
    }
  }

  logSuccess(`${seedData.organizations.length} organizations validated`);
}

function validateUsers() {
  logSection('Validating Users');
  totalChecks++;

  if (!seedData.users || seedData.users.length === 0) {
    logWarning('No users found in seed data');
    return;
  }

  const tenantIds = seedData.tenants.map(t => t.id);
  const orgIds = seedData.organizations.map(o => o.id);

  for (const user of seedData.users) {
    if (!user.id) logError(`User missing id: ${JSON.stringify(user)}`);
    if (!user.tenant_id) logError(`User ${user.id} missing tenant_id`);
    if (!tenantIds.includes(user.tenant_id)) {
      logError(`User ${user.id} has invalid tenant_id: ${user.tenant_id}`);
    }
    if (user.organization_id && !orgIds.includes(user.organization_id)) {
      logError(`User ${user.id} has invalid organization_id: ${user.organization_id}`);
    }
  }

  logSuccess(`${seedData.users.length} users validated`);
}

function validateRentalObjects() {
  logSection('Validating Rental Objects');

  if (!seedData.rental_objects || seedData.rental_objects.length === 0) {
    logError('No rental objects found in seed data');
    return;
  }

  const tenantIds = seedData.tenants.map(t => t.id);
  const orgIds = seedData.organizations.map(o => o.id);

  const categoryCounts = {};
  const timeModeCounts = {};
  const statusCounts = {};
  const invalidCategories = [];
  const invalidTimeModes = [];
  const invalidStatuses = [];
  const invalidFeatures = [];

  for (const obj of seedData.rental_objects) {
    totalChecks++;

    // Required fields
    if (!obj.id) logError(`Rental object missing id: ${JSON.stringify(obj)}`);
    if (!obj.name) logError(`Rental object ${obj.id} missing name`);
    if (!obj.slug) logError(`Rental object ${obj.id} missing slug`);
    if (!obj.tenant_id) logError(`Rental object ${obj.id} missing tenant_id`);

    // Foreign key validation
    if (obj.tenant_id && !tenantIds.includes(obj.tenant_id)) {
      logError(`Rental object ${obj.id} (${obj.name}) has invalid tenant_id: ${obj.tenant_id}`);
    }
    if (obj.organization_id && !orgIds.includes(obj.organization_id)) {
      logError(`Rental object ${obj.id} (${obj.name}) has invalid organization_id: ${obj.organization_id}`);
    }

    // Category validation
    if (!obj.category_key) {
      logError(`Rental object ${obj.id} (${obj.name}) missing category_key`);
    } else {
      categoryCounts[obj.category_key] = (categoryCounts[obj.category_key] || 0) + 1;
      if (!VALID_CATEGORIES.includes(obj.category_key)) {
        invalidCategories.push({ id: obj.id, name: obj.name, category: obj.category_key });
      }
    }

    // Time mode validation
    if (!obj.time_mode) {
      logError(`Rental object ${obj.id} (${obj.name}) missing time_mode`);
    } else {
      timeModeCounts[obj.time_mode] = (timeModeCounts[obj.time_mode] || 0) + 1;
      if (!VALID_TIME_MODES.includes(obj.time_mode)) {
        invalidTimeModes.push({ id: obj.id, name: obj.name, mode: obj.time_mode });
      }
    }

    // Status validation
    if (!obj.status) {
      logWarning(`Rental object ${obj.id} (${obj.name}) missing status (will default to 'draft')`);
    } else {
      statusCounts[obj.status] = (statusCounts[obj.status] || 0) + 1;
      if (!VALID_STATUSES.includes(obj.status)) {
        invalidStatuses.push({ id: obj.id, name: obj.name, status: obj.status });
      }
    }

    // Features validation
    if (obj.features && Array.isArray(obj.features)) {
      for (const feature of obj.features) {
        if (!VALID_FEATURES.includes(feature)) {
          invalidFeatures.push({ id: obj.id, name: obj.name, feature });
        }
      }
    }

    // JSONB structure validation
    if (obj.images && !Array.isArray(obj.images)) {
      logError(`Rental object ${obj.id} (${obj.name}) has invalid images structure (must be array)`);
    }
    if (obj.pricing && typeof obj.pricing !== 'object') {
      logError(`Rental object ${obj.id} (${obj.name}) has invalid pricing structure (must be object)`);
    }
    if (obj.metadata && typeof obj.metadata !== 'object') {
      logError(`Rental object ${obj.id} (${obj.name}) has invalid metadata structure (must be object)`);
    }
  }

  // Report validation results
  logInfo('\nCategory Distribution:');
  for (const [category, count] of Object.entries(categoryCounts)) {
    const isValid = VALID_CATEGORIES.includes(category);
    const statusIcon = isValid ? '✅' : '❌';
    console.log(`  ${statusIcon} ${category}: ${count} objects`);
  }

  logInfo('\nTime Mode Distribution:');
  for (const [mode, count] of Object.entries(timeModeCounts)) {
    const isValid = VALID_TIME_MODES.includes(mode);
    const statusIcon = isValid ? '✅' : '❌';
    console.log(`  ${statusIcon} ${mode}: ${count} objects`);
  }

  logInfo('\nStatus Distribution:');
  for (const [status, count] of Object.entries(statusCounts)) {
    const isValid = VALID_STATUSES.includes(status);
    const statusIcon = isValid ? '✅' : '❌';
    console.log(`  ${statusIcon} ${status}: ${count} objects`);
  }

  // Report invalid values
  if (invalidCategories.length > 0) {
    logError(`\nFound ${invalidCategories.length} objects with invalid category_key:`);
    invalidCategories.forEach(obj => {
      console.error(`  - ${obj.name} (${obj.id}): ${obj.category}`);
    });
  }

  if (invalidTimeModes.length > 0) {
    logError(`\nFound ${invalidTimeModes.length} objects with invalid time_mode:`);
    invalidTimeModes.forEach(obj => {
      console.error(`  - ${obj.name} (${obj.id}): ${obj.mode}`);
    });
  }

  if (invalidStatuses.length > 0) {
    logError(`\nFound ${invalidStatuses.length} objects with invalid status:`);
    invalidStatuses.forEach(obj => {
      console.error(`  - ${obj.name} (${obj.id}): ${obj.status}`);
    });
  }

  if (invalidFeatures.length > 0) {
    logWarning(`\nFound ${invalidFeatures.length} objects with invalid features:`);
    invalidFeatures.forEach(obj => {
      console.warn(`  - ${obj.name} (${obj.id}): ${obj.feature}`);
    });
  }

  if (invalidCategories.length === 0 && invalidTimeModes.length === 0 && invalidStatuses.length === 0) {
    logSuccess(`\n${seedData.rental_objects.length} rental objects validated successfully`);
  }
}

// Run all validations
console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
console.log(`${colors.blue}SEED DATA VALIDATION${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
console.log(`File: ${seedDataPath}`);
console.log(`Mode: ${strict ? 'STRICT' : 'NORMAL'}\n`);

validateMetadata();
validateTenants();
validateOrganizations();
validateUsers();
validateRentalObjects();

// Final summary
logSection('Validation Summary');

console.log(`Total Checks: ${totalChecks}`);
console.log(`${colors.green}Passed: ${passedChecks}${colors.reset}`);
console.log(`${colors.yellow}Warnings: ${warnings.length}${colors.reset}`);
console.log(`${colors.red}Errors: ${errors.length}${colors.reset}\n`);

if (errors.length > 0) {
  console.error(`${colors.red}❌ Validation FAILED with ${errors.length} error(s)${colors.reset}`);
  process.exit(1);
}

if (warnings.length > 0 && strict) {
  console.error(`${colors.yellow}⚠️  Validation FAILED in strict mode with ${warnings.length} warning(s)${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.green}✅ Validation PASSED${colors.reset}\n`);
process.exit(0);
