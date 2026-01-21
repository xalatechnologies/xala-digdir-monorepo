#!/usr/bin/env node

/**
 * Module Verification Script
 *
 * Verifies that all API modules are properly classified in the module registry.
 *
 * Usage: node scripts/verify-modules.mjs
 */

import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const MODULES_DIR = join(ROOT, 'apps/api/src/modules');
const REGISTRY_FILE = join(ROOT, 'apps/api/src/module-registry.ts');

// Directories to ignore (not modules)
const IGNORE_DIRS = ['shared', 'common', 'types', 'utils', 'repositories'];

async function getModuleFolders() {
  const entries = await readdir(MODULES_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !IGNORE_DIRS.includes(e.name))
    .map((e) => e.name);
}

async function getRegisteredModules() {
  const content = await readFile(REGISTRY_FILE, 'utf-8');

  // Extract module names from MODULE_REGISTRY object
  const moduleNames = [];
  const regex = /^\s*['"]?([\w-]+)['"]?\s*:\s*\{/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    moduleNames.push(match[1]);
  }

  return moduleNames;
}

async function verifyModules() {
  console.log('🔍 Verifying API modules...\n');

  const folderModules = await getModuleFolders();
  const registeredModules = await getRegisteredModules();

  console.log(`📁 Found ${folderModules.length} module folders`);
  console.log(`📋 Found ${registeredModules.length} registered modules\n`);

  // Find unclassified modules (in folder but not in registry)
  const unclassified = folderModules.filter((m) => !registeredModules.includes(m));

  // Find orphaned registrations (in registry but no folder)
  const orphaned = registeredModules.filter((m) => !folderModules.includes(m));

  // Report
  let hasErrors = false;

  if (unclassified.length > 0) {
    console.log('❌ UNCLASSIFIED MODULES (exist but not in registry):');
    unclassified.forEach((m) => console.log(`   - ${m}`));
    console.log('');
    hasErrors = true;
  }

  if (orphaned.length > 0) {
    console.log('⚠️  ORPHANED REGISTRATIONS (in registry but no folder):');
    orphaned.forEach((m) => console.log(`   - ${m}`));
    console.log('');
    // Orphaned is a warning, not an error (could be aliases)
  }

  // Statistics
  console.log('📊 Module Statistics:');
  console.log(`   Total folders: ${folderModules.length}`);
  console.log(`   Total registered: ${registeredModules.length}`);
  console.log(`   Unclassified: ${unclassified.length}`);
  console.log(`   Orphaned: ${orphaned.length}`);
  console.log('');

  if (hasErrors) {
    console.log('❌ Verification FAILED. Please add missing modules to module-registry.ts');
    process.exit(1);
  } else {
    console.log('✅ All modules are properly classified!');
    process.exit(0);
  }
}

// Run
verifyModules().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
