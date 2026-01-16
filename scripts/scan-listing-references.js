#!/usr/bin/env node
/**
 * Listing Reference Scanner
 * Scans codebase for all "listing" terminology to track migration progress
 *
 * Usage:
 *   node scripts/scan-listing-references.js [--detailed]
 *
 * Exit codes:
 *   0 - No listing references found (migration complete)
 *   1 - Listing references found
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const SCAN_TARGETS = {
  'Client SDK - Hooks': 'packages/client-sdk/src/hooks',
  'Client SDK - Services': 'packages/client-sdk/src/services',
  'Client SDK - Types': 'packages/client-sdk/src/types',
  'Design System - Components': 'packages/ds/src/blocks',
  'Design System - Types': 'packages/ds/src/types',
  'App - Web': 'apps/web/src',
  'App - Backoffice': 'apps/backoffice/src',
  'App - Minside': 'apps/minside/src',
};

const ALLOWED_EXCEPTIONS = [
  '__tests__',
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  'node_modules',
  'dist',
  'build',
  // Allow in comments only
];

function scanDirectory(dir, pattern, category) {
  try {
    // Use ripgrep for fast searching
    const result = execSync(
      `rg -i "${pattern}" "${dir}" --type-add 'src:*.{ts,tsx}' -t src --files-with-matches --no-heading 2>/dev/null || true`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    if (!result.trim()) return [];

    const files = result.trim().split('\n').filter(f => f);

    // Filter out exceptions
    return files.filter(file => {
      return !ALLOWED_EXCEPTIONS.some(exc => file.includes(exc));
    });
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error.message);
    return [];
  }
}

function getLineMatches(file, pattern) {
  try {
    const result = execSync(
      `rg -i -n "${pattern}" "${file}" --type-add 'src:*.{ts,tsx}' -t src || true`,
      { encoding: 'utf-8', maxBuffer: 1024 * 1024 }
    );
    return result.trim().split('\n').filter(l => l).map(line => {
      const [lineNum, ...rest] = line.split(':');
      return { lineNum: parseInt(lineNum), content: rest.join(':').trim() };
    });
  } catch (error) {
    return [];
  }
}

function main() {
  const detailed = process.argv.includes('--detailed');

  console.log(`${COLORS.cyan}╔════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.cyan}║  Listing → RentalObject Migration Scanner             ║${COLORS.reset}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

  const patterns = [
    { name: 'Listing Types/Classes', regex: '\\bListing[A-Z]\\w*' },
    { name: 'listing variables', regex: '\\blisting[A-Z]\\w*' },
    { name: 'useListing hooks', regex: '\\buseListing\\w*' },
    { name: 'listingId fields', regex: '\\blistingId\\b' },
    { name: 'listing paths', regex: '/listings[/\'"]' },
    { name: 'listing imports', regex: 'from.*listing' },
  ];

  let totalIssues = 0;
  const results = {};

  for (const [category, dir] of Object.entries(SCAN_TARGETS)) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.log(`${COLORS.yellow}⚠ Skipping ${category} (path not found)${COLORS.reset}`);
      continue;
    }

    results[category] = {};
    let categoryTotal = 0;

    for (const { name, regex } of patterns) {
      const matches = scanDirectory(fullPath, regex, category);
      if (matches.length > 0) {
        results[category][name] = matches;
        categoryTotal += matches.length;
      }
    }

    if (categoryTotal > 0) {
      console.log(`${COLORS.red}✗ ${category}: ${categoryTotal} files${COLORS.reset}`);
      totalIssues += categoryTotal;

      if (detailed) {
        for (const [patternName, files] of Object.entries(results[category])) {
          console.log(`  ${COLORS.yellow}${patternName}:${COLORS.reset}`);
          files.forEach(file => {
            const relPath = path.relative(process.cwd(), file);
            console.log(`    - ${relPath}`);

            // Show line numbers
            const lines = getLineMatches(file, patterns.find(p => p.name === patternName).regex);
            lines.slice(0, 3).forEach(({ lineNum, content }) => {
              console.log(`      ${COLORS.blue}L${lineNum}:${COLORS.reset} ${content.substring(0, 80)}`);
            });
            if (lines.length > 3) {
              console.log(`      ${COLORS.magenta}... and ${lines.length - 3} more occurrences${COLORS.reset}`);
            }
          });
        }
      }
    } else {
      console.log(`${COLORS.green}✓ ${category}: Clean${COLORS.reset}`);
    }
  }

  console.log(`\n${COLORS.cyan}════════════════════════════════════════════════════════${COLORS.reset}`);

  if (totalIssues === 0) {
    console.log(`${COLORS.green}✓ Migration Complete! No listing references found.${COLORS.reset}`);
    console.log(`${COLORS.cyan}════════════════════════════════════════════════════════${COLORS.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red}✗ Found ${totalIssues} files with listing references${COLORS.reset}`);
    console.log(`${COLORS.cyan}════════════════════════════════════════════════════════${COLORS.reset}\n`);
    console.log(`Run with ${COLORS.yellow}--detailed${COLORS.reset} flag to see line numbers and context`);
    process.exit(1);
  }
}

main();
