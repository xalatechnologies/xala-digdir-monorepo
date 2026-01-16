#!/usr/bin/env node

/**
 * i18n Compliance Scanner
 *
 * Scans the codebase for hardcoded strings that should be localized.
 *
 * Detects:
 * 1. Hardcoded user-facing text in JSX
 * 2. Hardcoded strings in component props (title, label, placeholder, etc.)
 * 3. Missing t() function usage
 * 4. Hardcoded Norwegian/English text
 *
 * Usage: node scripts/scan-i18n.js <directory>
 * Example: node scripts/scan-i18n.js apps/tenant-admin/src
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludePatterns: [
    'node_modules',
    'dist',
    '.test.',
    '.spec.',
    '__tests__',
    '__mocks__',
    '.d.ts',
    '-backup-', // Backup directories
    '.backup',
  ],
};

// Props that typically contain user-facing text
const USER_FACING_PROPS = [
  'title',
  'label',
  'placeholder',
  'description',
  'aria-label',
  'alt',
  'helperText',
  'errorMessage',
  'successMessage',
  'loadingText',
  'emptyText',
  'tooltip',
  'hint',
  'caption',
];

// Words that indicate hardcoded Norwegian text
const NORWEGIAN_INDICATORS = [
  'administrasjon',
  'adgangskontroll',
  'administr',
  'aktivitet',
  'betaling',
  'bestilling',
  'bruk',
  'bruker',
  'dato',
  'deling',
  'drift',
  'endring',
  'feil',
  'for',
  'fra',
  'fremtid',
  'hvor',
  'hva',
  'hvem',
  'hvis',
  'info',
  'innstilling',
  'integrering',
  'integrasjon',
  'kabin',
  'kalender',
  'kategori',
  'konfig',
  'lagring',
  'legg',
  'liste',
  'logg',
  'lokale',
  'maksim',
  'minim',
  'manus',
  'med',
  'melding',
  'mer',
  'merk',
  'nummer',
  'ny',
  'opprett',
  'over',
  'personvern',
  'registrer',
  'rolle',
  'send',
  'setting',
  'sikkerhets',
  'side',
  'slutt',
  'start',
  'status',
  'synkronisering',
  'søk',
  'til',
  'tilgang',
  'utlogging',
  'varsler',
  'ved',
  'velg',
  'visning',
  'åpne',
  'økt',
];

// Words that indicate hardcoded English text in user-facing context
const ENGLISH_UI_WORDS = [
  'Click',
  'Select',
  'Enter',
  'Submit',
  'Save',
  'Cancel',
  'Delete',
  'Edit',
  'Add',
  'Remove',
  'Loading',
  'Error',
  'Success',
  'Warning',
  'Info',
  'Close',
  'Open',
  'Next',
  'Previous',
  'Back',
  'Continue',
  'Confirm',
  'Yes',
  'No',
  'Welcome',
  'Login',
  'Logout',
  'Sign',
  'Account',
  'Settings',
  'Profile',
  'Dashboard',
  'Home',
  'Admin',
];

// Patterns that are OK to be hardcoded
const ALLOWED_PATTERNS = [
  // Technical strings
  /^[A-Z_]+$/, // Constants like TENANT_ADMIN
  /^[\d.]+$/, // Numbers
  /^#[0-9a-fA-F]{3,8}$/, // Hex colors
  /^https?:\/\//, // URLs
  /^var\(--/, // CSS variables
  /^[a-z]+:\/\//, // Protocol URLs
  /^\.\//, // Relative paths
  /^\d+px$/, // CSS sizes
  /^[a-z]+\.[a-z]+$/, // File extensions like logo.svg
  /^[A-Z]{2,}$/, // Abbreviations like ID, API
  /^[a-z]+-[a-z]+$/, // kebab-case identifiers
  /^\w+@\w+\.\w+$/, // Email patterns
  /^[\w-]+\/[\w-]+$/, // Path patterns
  // Brand names that shouldn't be translated
  /^(DIGILIST|Digilist|BankID|Vipps|Azure AD|ISO \d+|Microsoft|Outlook|SMTP|SMS)$/,
  // Single characters or very short strings
  /^.{0,2}$/,
  // Numbers with units
  /^\d+\s?(MB|GB|px|rem|em|%)$/,
  // Date format patterns
  /^[YMDHms/-]+$/,
  // JSON-like property names
  /^[a-z_]+$/,
  // Route paths
  /^\/[a-z0-9/-]*$/i,
  // CSS class interpolations
  /^\$\{styles\./,
  // File paths with extensions
  /^\/[\w-]+\.(svg|png|jpg|ico|css|js)$/,
  // Media queries
  /^\(prefers-/,
  // Technical error messages (developer-facing)
  /must be used within/i,
  // CSS border/shadow strings
  /^\d+px\s+(solid|dashed|dotted|double)/,
  // CSS gradient/animation strings
  /^(slideIn|fadeIn|slideOut|fadeOut)/i,
  // CSS var() with fallback
  /^var\(/,
  // Template literal interpolation
  /^\$\{/,
  // CSS color mode strings
  /^rgba?\(/,
  // NPM package paths
  /^@[\w-]+\/[\w-]+/,
  // CSS rem/em values
  /^\d+\.?\d*(rem|em)$/,
];

// Severity levels
const SEVERITY = {
  HIGH: 'high', // Definitely needs translation
  MEDIUM: 'medium', // Likely needs translation
  LOW: 'low', // May need review
};

// Results storage
const results = {
  high: [],
  medium: [],
  low: [],
  documented: [], // Items with eslint-disable comments
};

/**
 * Check if a string matches any allowed pattern
 */
function isAllowedString(str) {
  if (!str || typeof str !== 'string') return true;
  const trimmed = str.trim();
  if (trimmed.length === 0) return true;

  return ALLOWED_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Check if string contains Norwegian text
 */
function containsNorwegian(str) {
  if (!str) return false;
  const lower = str.toLowerCase();
  return NORWEGIAN_INDICATORS.some(word => lower.includes(word));
}

/**
 * Check if string looks like English UI text
 */
function containsEnglishUI(str) {
  if (!str) return false;
  return ENGLISH_UI_WORDS.some(word => str.includes(word));
}

/**
 * Extract strings from a line of code
 */
function extractStrings(line) {
  const strings = [];

  // Match single-quoted strings
  const singleQuoted = line.match(/'([^'\\]|\\.)*'/g);
  if (singleQuoted) {
    strings.push(...singleQuoted.map(s => s.slice(1, -1)));
  }

  // Match double-quoted strings
  const doubleQuoted = line.match(/"([^"\\]|\\.)*"/g);
  if (doubleQuoted) {
    strings.push(...doubleQuoted.map(s => s.slice(1, -1)));
  }

  // Match template literals (simple cases)
  const templateLiterals = line.match(/`([^`\\]|\\.)*`/g);
  if (templateLiterals) {
    strings.push(...templateLiterals.map(s => s.slice(1, -1)));
  }

  return strings;
}

/**
 * Check if a line is within a t() function call or uses i18n
 */
function usesI18n(line) {
  return (
    line.includes('t(') ||
    line.includes('useT()') ||
    line.includes('t:') ||
    line.includes('translation') ||
    line.includes('i18n') ||
    line.includes('defaultValue:') ||
    line.includes("defaultValue: '")
  );
}

/**
 * Check if a line has an eslint-disable comment for i18n
 */
function hasI18nDisable(line, prevLines) {
  const combinedContext = [...prevLines, line].join('\n');
  return (
    combinedContext.includes('eslint-disable') &&
    (combinedContext.includes('i18n') ||
     combinedContext.includes('hardcoded') ||
     combinedContext.includes('localization'))
  );
}

/**
 * Scan a single file for i18n issues
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileResults = [];

  // Track if the file imports useT
  const hasI18nImport = content.includes('useT') || content.includes('@xala/i18n');

  // Track recent lines for context
  const recentLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Update recent lines context
    recentLines.push(line);
    if (recentLines.length > 5) recentLines.shift();

    // Skip comments and imports
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
    if (line.includes('import ') && line.includes('from ')) continue;

    // Skip lines that already use i18n
    if (usesI18n(line)) continue;

    // Skip lines that are continuations of defaultValue (multi-line)
    const prevLine = i > 0 ? lines[i - 1].trim() : '';
    if (prevLine.endsWith('defaultValue:') || prevLine.includes('defaultValue:')) continue;

    // Skip console.log and debug statements
    if (line.includes('console.') || line.includes('debug')) continue;

    // Check for hardcoded strings
    const strings = extractStrings(line);

    for (const str of strings) {
      if (isAllowedString(str)) continue;

      // Determine severity
      let severity = SEVERITY.LOW;
      let reason = '';

      // Check for user-facing props
      const isUserFacingProp = USER_FACING_PROPS.some(prop => {
        const propPattern = new RegExp(`${prop}\\s*=\\s*["'\`]`);
        return propPattern.test(line);
      });

      if (isUserFacingProp) {
        severity = SEVERITY.HIGH;
        reason = 'Hardcoded string in user-facing prop';
      } else if (containsNorwegian(str)) {
        severity = SEVERITY.HIGH;
        reason = 'Hardcoded Norwegian text';
      } else if (containsEnglishUI(str)) {
        severity = SEVERITY.MEDIUM;
        reason = 'Possible UI text in English';
      } else if (str.length > 20 && /[A-Za-z]/.test(str)) {
        severity = SEVERITY.MEDIUM;
        reason = 'Long string that may be user-facing';
      } else if (line.includes('>') && line.includes('<')) {
        // Text content in JSX
        severity = SEVERITY.MEDIUM;
        reason = 'Text content in JSX';
      }

      // Check if documented
      const isDocumented = hasI18nDisable(line, recentLines);

      const issue = {
        file: filePath,
        line: lineNum,
        content: line.trim().substring(0, 100),
        string: str.substring(0, 50),
        severity,
        reason,
        isDocumented,
        hasI18nImport,
      };

      if (isDocumented) {
        results.documented.push(issue);
      } else {
        results[severity].push(issue);
      }

      fileResults.push(issue);
    }
  }

  return fileResults;
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    // Skip excluded patterns
    if (CONFIG.excludePatterns.some(p => item.includes(p))) continue;

    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (CONFIG.extensions.includes(path.extname(item))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Generate report
 */
function generateReport() {
  const totalIssues = results.high.length + results.medium.length + results.low.length;
  const undocumentedHigh = results.high.filter(i => !i.isDocumented).length;

  console.log('\n========================================');
  console.log('       i18n Compliance Scan Report      ');
  console.log('========================================\n');

  console.log('📊 Summary:');
  console.log(`   High Severity:   ${results.high.length} issues`);
  console.log(`   Medium Severity: ${results.medium.length} issues`);
  console.log(`   Low Severity:    ${results.low.length} issues`);
  console.log(`   Documented:      ${results.documented.length} items\n`);

  if (totalIssues === 0) {
    console.log('✅ No i18n issues found!\n');
    return { totalIssues: 0, undocumentedHigh: 0 };
  }

  // Show high severity issues
  if (results.high.length > 0) {
    console.log('❌ HIGH SEVERITY ISSUES (must be fixed or documented):');
    console.log('─'.repeat(50));
    for (const issue of results.high.slice(0, 20)) {
      console.log(`   ${issue.file}:${issue.line}`);
      console.log(`   String: "${issue.string}"`);
      console.log(`   Reason: ${issue.reason}`);
      console.log('');
    }
    if (results.high.length > 20) {
      console.log(`   ... and ${results.high.length - 20} more\n`);
    }
  }

  // Show medium severity issues
  if (results.medium.length > 0) {
    console.log('\n⚠️  MEDIUM SEVERITY ISSUES (should be reviewed):');
    console.log('─'.repeat(50));
    for (const issue of results.medium.slice(0, 10)) {
      console.log(`   ${issue.file}:${issue.line}`);
      console.log(`   String: "${issue.string}"`);
      console.log(`   Reason: ${issue.reason}`);
      console.log('');
    }
    if (results.medium.length > 10) {
      console.log(`   ... and ${results.medium.length - 10} more\n`);
    }
  }

  // Show documented items
  if (results.documented.length > 0) {
    console.log('\n📝 DOCUMENTED EXCEPTIONS:');
    console.log('─'.repeat(50));
    for (const item of results.documented.slice(0, 5)) {
      console.log(`   ${item.file}:${item.line}`);
      console.log(`   String: "${item.string}"`);
      console.log('');
    }
    if (results.documented.length > 5) {
      console.log(`   ... and ${results.documented.length - 5} more\n`);
    }
  }

  console.log('\n========================================');
  console.log('          VERIFICATION RESULT           ');
  console.log('========================================\n');

  if (undocumentedHigh > 0) {
    console.log(`❌ FAIL: ${undocumentedHigh} high-severity issues need to be fixed or documented.\n`);
  } else if (totalIssues > 0) {
    console.log(`⚠️  PASS WITH WARNINGS: All high-severity issues are documented.`);
    console.log(`   ${results.medium.length + results.low.length} lower-severity issues remain for review.\n`);
  } else {
    console.log('✅ PASS: All i18n checks passed.\n');
  }

  return { totalIssues, undocumentedHigh };
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/scan-i18n.js <directory>');
    console.log('Example: node scripts/scan-i18n.js apps/tenant-admin/src');
    process.exit(1);
  }

  const targetDir = args[0];

  console.log(`🔍 Scanning ${targetDir} for i18n compliance...\n`);

  const files = getAllFiles(targetDir);
  console.log(`📁 Found ${files.length} files to scan\n`);

  let scanned = 0;
  for (const file of files) {
    scanFile(file);
    scanned++;
    if (scanned % 5 === 0) {
      process.stdout.write(`   Scanned ${scanned}/${files.length} files...\r`);
    }
  }
  console.log(`   Scanned ${files.length}/${files.length} files ✓\n`);

  const { undocumentedHigh } = generateReport();

  // Exit with error if there are undocumented high-severity issues
  if (undocumentedHigh > 0) {
    process.exit(1);
  }
}

main();
