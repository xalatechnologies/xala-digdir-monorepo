#!/usr/bin/env node

/**
 * Digdir Design System Scanner CLI
 *
 * Scans codebase for design token violations, component pattern issues,
 * and accessibility problems.
 *
 * Usage:
 *   pnpm scan                    # Full scan with default rules
 *   pnpm scan:strict             # Strict mode (all rules as errors)
 *   pnpm scan:tokens             # Design tokens only
 *   pnpm scan:components         # Component patterns only
 *   pnpm scan:fix                # Auto-fix where possible
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RULE_SETS = {
  default: [
    'digdir/no-hardcoded-colors',
    'digdir/no-hardcoded-spacing',
    'digdir/no-hardcoded-typography',
    'digdir/no-hardcoded-border-radius',
    'digdir/as-child-single-child',
    'digdir/require-button-type',
    'digdir/require-interactive-labels',
    'digdir/prefer-ds-components',
    'digdir/require-provider',
  ],
  tokens: [
    'digdir/no-hardcoded-colors',
    'digdir/no-hardcoded-spacing',
    'digdir/no-hardcoded-typography',
    'digdir/no-hardcoded-border-radius',
  ],
  components: [
    'digdir/as-child-single-child',
    'digdir/require-button-type',
    'digdir/require-interactive-labels',
    'digdir/prefer-ds-components',
    'digdir/require-provider',
  ],
  accessibility: [
    'digdir/require-button-type',
    'digdir/require-interactive-labels',
  ],
};

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
  console.log(color('  Digdir Design System Scanner', 'cyan'));
  console.log(color('  ════════════════════════════', 'dim'));
  console.log('');
}

function printHelp() {
  printBanner();
  console.log(color('  Usage:', 'bright'));
  console.log('    pnpm scan [options] [paths...]');
  console.log('');
  console.log(color('  Options:', 'bright'));
  console.log('    --strict      Run all rules as errors');
  console.log('    --tokens      Check design tokens only');
  console.log('    --components  Check component patterns only');
  console.log('    --a11y        Check accessibility rules only');
  console.log('    --fix         Auto-fix issues where possible');
  console.log('    --quiet       Only show errors');
  console.log('    --help        Show this help message');
  console.log('');
  console.log(color('  Examples:', 'bright'));
  console.log('    pnpm scan                     # Scan all apps');
  console.log('    pnpm scan --tokens            # Check design tokens');
  console.log('    pnpm scan --strict apps/web   # Strict scan of web app');
  console.log('    pnpm scan --fix               # Auto-fix issues');
  console.log('');
  console.log(color('  Rules:', 'bright'));
  console.log(color('    Design Tokens:', 'yellow'));
  console.log('      - no-hardcoded-colors     Enforce CSS variables for colors');
  console.log('      - no-hardcoded-spacing    Enforce spacing tokens');
  console.log('      - no-hardcoded-typography Enforce typography tokens');
  console.log('      - no-hardcoded-border-radius Enforce border-radius tokens');
  console.log('');
  console.log(color('    Component Patterns:', 'yellow'));
  console.log('      - as-child-single-child   Validate asChild usage');
  console.log('      - require-button-type     Require explicit button types');
  console.log('      - require-interactive-labels Ensure accessible labels');
  console.log('      - prefer-ds-components    Suggest DS component usage');
  console.log('      - require-provider        Check for provider setup');
  console.log('');
}

function parseArgs(args) {
  const options = {
    ruleSet: 'default',
    fix: false,
    quiet: false,
    strict: false,
    paths: [],
    help: false,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--strict') {
      options.strict = true;
    } else if (arg === '--tokens') {
      options.ruleSet = 'tokens';
    } else if (arg === '--components') {
      options.ruleSet = 'components';
    } else if (arg === '--a11y' || arg === '--accessibility') {
      options.ruleSet = 'accessibility';
    } else if (arg === '--fix') {
      options.fix = true;
    } else if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    } else if (!arg.startsWith('-')) {
      options.paths.push(arg);
    }
  }

  // Default to scanning apps if no paths specified
  if (options.paths.length === 0) {
    options.paths = ['apps/'];
  }

  return options;
}

async function runScanner(options) {
  printBanner();

  const ruleSet = options.strict ? 'default' : options.ruleSet;
  const rules = RULE_SETS[ruleSet] || RULE_SETS.default;

  console.log(color(`  Mode: `, 'dim') + color(options.strict ? 'strict' : ruleSet, 'yellow'));
  console.log(color(`  Paths: `, 'dim') + options.paths.join(', '));
  console.log(color(`  Rules: `, 'dim') + rules.length + ' active');
  console.log('');

  // Build eslint command
  const eslintArgs = [
    'eslint',
    ...options.paths,
    '--ext', '.tsx,.jsx',
    '--format', 'stylish',
  ];

  if (options.fix) {
    eslintArgs.push('--fix');
  }

  if (options.quiet) {
    eslintArgs.push('--quiet');
  }

  // Run eslint via pnpm
  const result = spawn('pnpm', eslintArgs, {
    cwd: join(__dirname, '../..'),
    stdio: 'inherit',
    shell: true,
  });

  return new Promise((resolve) => {
    result.on('close', (code) => {
      console.log('');
      if (code === 0) {
        console.log(color('  ✓ No violations found', 'green'));
      } else {
        console.log(color('  ✗ Violations found - see above for details', 'red'));
      }
      console.log('');
      resolve(code);
    });
  });
}

// Main execution
const args = process.argv.slice(2);
const options = parseArgs(args);

if (options.help) {
  printHelp();
  process.exit(0);
} else {
  runScanner(options).then((code) => {
    process.exit(code);
  });
}
