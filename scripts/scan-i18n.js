#!/usr/bin/env node

/**
 * i18n Compliance Scanner
 *
 * Scans the codebase for hardcoded Norwegian strings that should use i18n t() function.
 *
 * Usage: node scripts/scan-i18n.js [path]
 * Example: node scripts/scan-i18n.js apps/saas-admin/src
 *
 * Exit codes:
 *   0 - No violations found
 *   1 - Violations found
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// Configuration
const CONFIG = {
  extensions: ['.tsx', '.jsx'],
  excludePatterns: [
    'node_modules',
    'dist',
    '.test.',
    '.spec.',
    '__tests__',
    '__mocks__',
  ],
};

// Common Norwegian words and patterns to detect
const NORWEGIAN_PATTERNS = [
  // Common Norwegian words
  /\b(?:til|fra|med|for|som|har|det|denne|denne|dette|disse|hva|hvor|hvordan|hvorfor|når|alle|ikke|mer|flere|nye|ny|nytt|gamle|gammel|stort|liten|liten)\b/i,
  // Common Norwegian UI text
  /\b(?:laster|lagre|lagret|slette|slettet|avbryt|lukk|åpne|vis|skjul|søk|søker|finn|finner|legg til|opprett|rediger|redigere|bekreft|send|sender|ok|nei|ja|tilbake|neste|forrige|ferdig)\b/i,
  // Norwegian phrases
  /\b(?:er du sikker|ikke funnet|ingen data|noe gikk galt|prøv igjen|vennligst|obligatorisk|valgfri|velg|valgt)\b/i,
  // Norwegian status words
  /\b(?:aktiv|inaktiv|suspendert|ventende|godkjent|avvist|fullført|pågår|planlagt|kansellert)\b/i,
  // Norwegian labels
  /\b(?:navn|tittel|beskrivelse|dato|opprettet|oppdatert|status|type|kategori|antall|pris|beløp|total|sum)\b/i,
];

// Patterns that indicate proper i18n usage (exclusions)
const I18N_PATTERNS = [
  /t\s*\(/,  // t() function call
  /useT\s*\(/,  // useT() hook
  /i18n\./,  // i18n.t() or similar
  /translate\(/,  // translate() function
  /\{t\(/,  // JSX expression with t()
  /t\(`/,  // Template literal with t()
];

// Common false positives to exclude
const FALSE_POSITIVE_PATTERNS = [
  /import\s+/,  // import statements
  /from\s+['"]/, // from 'module' statements
  /export\s+/,  // export statements
  /console\./,  // console.log, etc.
  /throw new/,  // throw statements
  /['"]use\s+/, // 'use client', 'use server'
  /type\s+\w+\s*=/,  // type definitions
  /interface\s+/,  // interface definitions
  /const\s+\w+:\s*Record/,  // Record type annotations
  /:\s*['"][^'"]+['"]\s*[,;}\]]/,  // Object property types or values
  /key:\s*['"]/, // Object keys
  /value:\s*['"]/, // Object values
  /name:\s*['"]/, // Object name properties
  /id:\s*['"]/, // Object id properties
  /testId/i, // Test IDs
  /data-testid/i, // Data test IDs
  /aria-/i, // ARIA attributes (except labels)
  /role=/,  // Role attributes
  /className=/,  // className attributes
  /style=/,  // style attributes
  /href=/,  // href attributes
  /src=/,  // src attributes
  /\bformat[A-Z]/,  // format functions like formatDate
  /\.toLocaleString/,  // Locale string methods
  /\.toLocaleDateString/,  // Date formatting
  /\/\//,  // Comments
  /\/\*/,  // Block comments
  /\*\//,  // End block comments
  /eslint-disable/,  // ESLint comments
  /@ts-/,  // TypeScript comments
  /TODO/,  // TODO comments
  /FIXME/,  // FIXME comments
  /NOTE/,  // NOTE comments
  /variant=/,  // Component variant props
  /color=/,  // Component color props
  /data-size=/,  // Component size props
  /level=/,  // Heading level props
  /type="button"/,  // Button type
  /type="submit"/,  // Submit type
];

// Specific Norwegian text patterns to flag (more targeted)
const HARDCODED_NORWEGIAN_TEXT = [
  // Complete phrases (case insensitive)
  { pattern: /["']Laster\.{0,3}["']/i, description: 'Hardcoded "Laster..."' },
  { pattern: /["']Lagre["']/i, description: 'Hardcoded "Lagre"' },
  { pattern: /["']Lagret["']/i, description: 'Hardcoded "Lagret"' },
  { pattern: /["']Avbryt["']/i, description: 'Hardcoded "Avbryt"' },
  { pattern: /["']Lukk["']/i, description: 'Hardcoded "Lukk"' },
  { pattern: /["']Søk["']/i, description: 'Hardcoded "Søk"' },
  { pattern: /["']Rediger["']/i, description: 'Hardcoded "Rediger"' },
  { pattern: /["']Slett["']/i, description: 'Hardcoded "Slett"' },
  { pattern: /["']Tilbake["']/i, description: 'Hardcoded "Tilbake"' },
  { pattern: /["']Neste["']/i, description: 'Hardcoded "Neste"' },
  { pattern: /["']Forrige["']/i, description: 'Hardcoded "Forrige"' },
  { pattern: /["']Bekreft["']/i, description: 'Hardcoded "Bekreft"' },
  { pattern: /["']Send["']/i, description: 'Hardcoded "Send"' },
  { pattern: /["']Ja["']/i, description: 'Hardcoded "Ja"' },
  { pattern: /["']Nei["']/i, description: 'Hardcoded "Nei"' },
  { pattern: /["']Velg["']/i, description: 'Hardcoded "Velg"' },
  { pattern: /["']Aktiv["']/i, description: 'Hardcoded "Aktiv"' },
  { pattern: /["']Inaktiv["']/i, description: 'Hardcoded "Inaktiv"' },
  { pattern: /["']Suspendert["']/i, description: 'Hardcoded "Suspendert"' },
  { pattern: /["']Ventende["']/i, description: 'Hardcoded "Ventende"' },
  { pattern: /["']Er du sikker/i, description: 'Hardcoded confirmation text' },
  { pattern: /["']Ikke funnet/i, description: 'Hardcoded "not found" text' },
  { pattern: /["']Noe gikk galt/i, description: 'Hardcoded error text' },
  { pattern: /["']Prøv igjen/i, description: 'Hardcoded "try again" text' },
  { pattern: /["']Vennligst/i, description: 'Hardcoded "please" text' },
  { pattern: /["']Obligatorisk/i, description: 'Hardcoded "required" text' },
  { pattern: /["']Ingen\s+\w+["']/i, description: 'Hardcoded "no X" text' },
  // Common status labels
  { pattern: /['"]Konfigurert["']/i, description: 'Hardcoded "Konfigurert"' },
  { pattern: /['"]Ikke konfigurert["']/i, description: 'Hardcoded "Ikke konfigurert"' },
  { pattern: /['"]Lisensiert["']/i, description: 'Hardcoded "Lisensiert"' },
  { pattern: /['"]Tenant ikke funnet["']/i, description: 'Hardcoded "Tenant not found"' },
  // JSX text content (children)
  { pattern: />Laster\.{0,3}<\//i, description: 'JSX hardcoded "Laster..."' },
  { pattern: />Lagre<\//i, description: 'JSX hardcoded "Lagre"' },
  { pattern: />Avbryt<\//i, description: 'JSX hardcoded "Avbryt"' },
  { pattern: />Lukk<\//i, description: 'JSX hardcoded "Lukk"' },
  { pattern: />Søk<\//i, description: 'JSX hardcoded "Søk"' },
  { pattern: />Rediger<\//i, description: 'JSX hardcoded "Rediger"' },
  { pattern: />Slett<\//i, description: 'JSX hardcoded "Slett"' },
  { pattern: />Tilbake[\s<]/i, description: 'JSX hardcoded "Tilbake"' },
  { pattern: />Bekreft<\//i, description: 'JSX hardcoded "Bekreft"' },
  { pattern: />Status<\//i, description: 'JSX hardcoded "Status"' },
  { pattern: />Navn<\//i, description: 'JSX hardcoded "Navn"' },
  { pattern: />Beskrivelse<\//i, description: 'JSX hardcoded "Beskrivelse"' },
  { pattern: />Dato<\//i, description: 'JSX hardcoded "Dato"' },
  { pattern: />Type<\//i, description: 'JSX hardcoded "Type"' },
];

// Colors for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function color(text, colorName) {
  return `${COLORS[colorName] || ''}${text}${COLORS.reset}`;
}

function printBanner() {
  console.log('');
  console.log(color('  i18n Compliance Scanner', 'cyan'));
  console.log(color('  ═══════════════════════', 'dim'));
  console.log('');
}

// Get all files recursively
function getAllFiles(dir, files = []) {
  const fullPath = resolve(ROOT, dir);
  if (!existsSync(fullPath)) {
    console.error(color(`  ✗ Directory not found: ${dir}`, 'red'));
    return files;
  }

  const items = readdirSync(fullPath);

  for (const item of items) {
    const itemPath = resolve(fullPath, item);
    const stat = statSync(itemPath);

    // Skip excluded patterns
    if (CONFIG.excludePatterns.some((p) => item.includes(p))) continue;

    if (stat.isDirectory()) {
      getAllFiles(relative(ROOT, itemPath), files);
    } else if (CONFIG.extensions.includes(extname(item))) {
      files.push(relative(ROOT, itemPath));
    }
  }

  return files;
}

// Check if a line uses proper i18n
function usesI18n(line) {
  return I18N_PATTERNS.some((pattern) => pattern.test(line));
}

// Check if a line is a false positive
function isFalsePositive(line) {
  return FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(line));
}

// Scan a single file for i18n violations
function scanFile(filePath) {
  const fullPath = resolve(ROOT, filePath);
  const content = readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip lines that use proper i18n
    if (usesI18n(line)) continue;

    // Skip false positives
    if (isFalsePositive(line)) continue;

    // Check for hardcoded Norwegian text
    for (const { pattern, description } of HARDCODED_NORWEGIAN_TEXT) {
      pattern.lastIndex = 0;
      const match = line.match(pattern);
      if (match) {
        violations.push({
          line: lineNum,
          content: line.trim().substring(0, 80),
          description,
          match: match[0],
        });
      }
    }
  }

  return violations;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || 'apps/saas-admin/src';

  printBanner();
  console.log(color(`  Scanning: `, 'dim') + targetPath);
  console.log('');

  // Get all files
  const files = getAllFiles(targetPath);

  if (files.length === 0) {
    console.log(color('  ✗ No files found to scan', 'red'));
    process.exit(1);
  }

  console.log(color(`  Found ${files.length} files to scan`, 'dim'));
  console.log('');

  // Scan files
  const allViolations = {};
  let totalViolations = 0;

  for (const file of files) {
    const violations = scanFile(file);
    if (violations.length > 0) {
      allViolations[file] = violations;
      totalViolations += violations.length;
    }
  }

  // Print results
  if (totalViolations === 0) {
    console.log(color('  ✓ No i18n violations found!', 'green'));
    console.log('');
    process.exit(0);
  }

  console.log(color(`  ✗ Found ${totalViolations} i18n violations`, 'red'));
  console.log('');

  for (const [file, violations] of Object.entries(allViolations)) {
    console.log(color(`  ${file}`, 'yellow'));
    for (const v of violations) {
      console.log(`    Line ${v.line}: ${color(v.description, 'red')}`);
      console.log(`      ${color(v.match, 'dim')}`);
    }
    console.log('');
  }

  console.log(color('  Recommendation:', 'bright'));
  console.log('    Replace hardcoded strings with t() function calls from @xala/i18n');
  console.log('    Example: <Heading>{t(\'saasAdmin.tenants.title\')}</Heading>');
  console.log('');

  process.exit(1);
}

main().catch((err) => {
  console.error(color('  Error:', 'red'), err.message);
  process.exit(1);
});
