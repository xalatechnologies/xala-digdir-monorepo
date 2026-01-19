#!/usr/bin/env node
/**
 * SDK Coverage Verification Script
 * 
 * Verifies that all API controllers have corresponding SDK services.
 * Reports missing SDK services that need to be created.
 * 
 * Usage: node scripts/quality/verify-sdk-coverage.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

/**
 * Controllers that intentionally don't need SDK services
 */
const EXCLUDED_CONTROLLERS = [
  'public.controller.ts',         // Unauthenticated SSR endpoints
  'brreg.controller.ts',           // Integration adapter (internal only)
  'widgets.controller.ts',         // Embed API (external consumers)
  'blocks.controller.ts',          // Calendar internal
  'conversations.controller.ts',   // Merged with messages SDK
  'share.controller.ts',           // Tracking endpoint (analytics)
];

async function findControllers() {
  const controllers = await glob('apps/api/src/modules/**/*.controller.ts');
  return controllers
    .map(file => path.basename(file))
    .filter(name => !EXCLUDED_CONTROLLERS.includes(name))
    .map(name => name.replace('.controller.ts', ''));
}

async function findSDKServices() {
  const services = await glob('packages/client-sdk/src/services/*.service.ts');
  return services
    .map(file => path.basename(file))
    .map(name => name.replace('.service.ts', ''));
}

function normalizeModuleName(name) {
  // Handle plural/singular and naming variations
  const mapping = {
    'booking': 'bookings',
    'rental-object': 'rental-objects',
    'organization': 'organizations',
    'notification': 'notifications',
    'message': 'messages',
    'template': 'templates',
    'season-application': 'season-applications',
    'user-group': 'user-groups',
    'discount-code': 'discount-codes',
  };
  
  return mapping[name] || name;
}

async function main() {
  console.log(`${colors.blue}${colors.bold}🔍 SDK Coverage Verification${colors.reset}\n`);
  
  const controllers = await findControllers();
  const sdkServices = await findSDKServices();
  
  console.log(`${colors.green}✓${colors.reset} Found ${controllers.length} API controllers (${EXCLUDED_CONTROLLERS.length} intentionally excluded)`);
  console.log(`${colors.green}✓${colors.reset} Found ${sdkServices.length} SDK services\n`);
  
  // Find missing SDK services
  const missing = [];
  const covered = [];
  
  for (const controller of controllers) {
    const normalized = normalizeModuleName(controller);
    const hasService = sdkServices.some(service => 
      service === controller || 
      service === normalized ||
      service.includes(controller) ||
      controller.includes(service)
    );
    
    if (hasService) {
      covered.push(controller);
    } else {
      missing.push(controller);
    }
  }
  
  // Print results
  console.log(`${colors.bold}Coverage Summary:${colors.reset}`);
  console.log(`  ${colors.green}Covered:${colors.reset} ${covered.length}/${controllers.length} (${Math.round(covered.length / controllers.length * 100)}%)`);
  console.log(`  ${colors.red}Missing:${colors.reset} ${missing.length}/${controllers.length}\n`);
  
  if (missing.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  Missing SDK Services:${colors.reset}\n`);
    missing.sort().forEach((name, index) => {
      console.log(`  ${index + 1}. ${colors.red}${name}${colors.reset}`);
      console.log(`     File: packages/client-sdk/src/services/${name}.service.ts`);
      console.log(`     Priority: ${getPriority(name)}\n`);
    });
    
    console.log(`${colors.blue}ℹ️  To fix:${colors.reset}`);
    console.log(`   1. Create SDK services for the missing controllers`);
    console.log(`   2. Add React Query hooks in packages/client-sdk/src/hooks/`);
    console.log(`   3. See docs/QUALITY/REMEDIATION_PLAN.md Phase 2\n`);
    
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}✅ SDK coverage is complete!${colors.reset}\n`);
    process.exit(0);
  }
}

function getPriority(controllerName) {
  const highPriority = ['allocations', 'amenities', 'discount-codes', 'settings'];
  const mediumPriority = ['user-groups', 'permission-assignment', 'case-handler-scope', 'seasonal-lease'];
  
  if (highPriority.includes(controllerName)) {
    return `${colors.red}HIGH${colors.reset}`;
  } else if (mediumPriority.includes(controllerName)) {
    return `${colors.yellow}MEDIUM${colors.reset}`;
  }
  return `${colors.green}LOW${colors.reset}`;
}

main().catch(err => {
  console.error(`${colors.red}Error:${colors.reset}`, err);
  process.exit(1);
});
