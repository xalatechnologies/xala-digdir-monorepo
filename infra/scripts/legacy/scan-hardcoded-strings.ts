#!/usr/bin/env npx tsx

/**
 * Hardcoded String Scanner for i18n Compliance
 *
 * Scans the codebase for hardcoded user-facing strings that should be
 * internationalized using @xala/i18n translation functions.
 *
 * Usage: npx tsx scripts/scan-hardcoded-strings.ts [--json] [--strict]
 *
 * Options:
 *   --json     Output results as JSON in addition to markdown
 *   --strict   Exit with error code 1 if hardcoded strings are found
 *   --verbose  Show detailed progress during scan
 *
 * The scanner detects:
 * - JSX text content: <div>Hello World</div>
 * - JSX string attributes: title="Hello", placeholder="Enter name"
 * - String literals in expressions: {"Hello World"}
 */

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// ============================================================================
// CONFIGURATION
// ============================================================================

interface ScanConfig {
  scanDirs: string[];
  extensions: string[];
  excludePatterns: RegExp[];
  reportPath: string;
}

const CONFIG: ScanConfig = {
  scanDirs: [
    'apps/web/src',
    'apps/backoffice/src',
    'apps/minside/src',
  ],
  extensions: ['.tsx', '.jsx'],
  excludePatterns: [
    /node_modules/,
    /dist/,
    /\.test\.(ts|tsx|js|jsx)$/,
    /\.spec\.(ts|tsx|js|jsx)$/,
    /\.stories\.(ts|tsx|js|jsx)$/,
    /__tests__/,
    /__mocks__/,
    /setupTests/,
    /vitest\.setup/,
  ],
  reportPath: 'reports/I18N_HARDCODED_STRINGS.md',
};

// ============================================================================
// DETECTION PATTERNS
// ============================================================================

// Attributes that typically contain user-facing text
const USER_FACING_ATTRIBUTES = [
  'title',
  'placeholder',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-placeholder',
  'alt',
  'label',
];

// Patterns that are allowed (not user-facing text)
const ALLOWED_PATTERNS: RegExp[] = [
  // Empty strings
  /^$/,
  // Single characters (often used for separators)
  /^.$/,
  // Numbers only
  /^[\d.,\s]+$/,
  // URLs
  /^(https?:\/\/|\/|#)/,
  // CSS classes or IDs (lowercase with hyphens)
  /^[a-z][\w-]*$/,
  // Email patterns
  /^[\w.@]+$/,
  // File extensions
  /^\.\w+$/,
  // Template expressions only (no text)
  /^\s*$/,
  // HTML entities
  /^&\w+;$/,
  // Pure punctuation
  /^[.,;:!?()[\]{}<>\/\-_+=*&^%$#@~`'"\\|]+$/,
  // Date/time format patterns
  /^(HH|hh|mm|ss|MM|DD|YYYY|YY|dd)[:\-./\s]*(HH|hh|mm|ss|MM|DD|YYYY|YY|dd)?$/i,
  // Locale codes
  /^(nb|en|nb-NO|en-US|nn-NO)$/,
  // React key patterns
  /^[a-z]+-\d+$/i,
  // kebab-case strings (likely technical identifiers)
  /^[a-z]+(-[a-z]+)+$/,
  // Common technical values
  /^(true|false|null|undefined|none|auto|inherit|initial|unset)$/i,
  // Translation keys (already i18n)
  /^[a-z]+\.[a-z]+(\.[a-z]+)*$/i,
];

// Components that don't need i18n (icons, layout, SVG, etc.)
const IGNORED_COMPONENTS = new Set([
  'svg',
  'path',
  'rect',
  'circle',
  'line',
  'polyline',
  'polygon',
  'g',
  'defs',
  'mask',
  'use',
  'symbol',
  'clipPath',
  'linearGradient',
  'radialGradient',
  'stop',
  'pattern',
  'image',
  'style',
  'script',
  'meta',
  'link',
  'title', // HTML title element
  'head',
  'Route',
  'Routes',
  'Link',
  'NavLink',
  'Helmet',
]);

// ============================================================================
// DETECTION HELPERS
// ============================================================================

/**
 * Check if a value matches any allowed pattern
 */
function isAllowedValue(value: string): boolean {
  const trimmed = value.trim();
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Check if string looks like user-facing text (contains actual words)
 */
function looksLikeUserFacingText(value: string): boolean {
  const trimmed = value.trim();

  // Must contain at least one letter (including Norwegian characters)
  if (!/[a-zA-Z\u00C6\u00D8\u00C5\u00E6\u00F8\u00E5]/.test(trimmed)) return false;

  // Must be more than one character
  if (trimmed.length <= 1) return false;

  // Check if it looks like actual words
  const hasMultipleWords = /\s/.test(trimmed);
  const startsWithCapital = /^[A-Z\u00C6\u00D8\u00C5]/.test(trimmed);
  const hasLowercase = /[a-z\u00E6\u00F8\u00E5]/.test(trimmed);

  // If it has multiple words, it's likely user-facing
  if (hasMultipleWords) return true;

  // Single word starting with capital and having lowercase is likely a label
  if (startsWithCapital && hasLowercase && trimmed.length > 3) return true;

  return false;
}

// ============================================================================
// TYPES
// ============================================================================

interface HardcodedStringIssue {
  line: number;
  column: number;
  value: string;
  type: 'text' | 'attribute' | 'expression';
  context: string;
  attribute?: string;
  component?: string;
}

interface FileScanResult {
  path: string;
  issues: HardcodedStringIssue[];
}

interface AppScanResult {
  app: string;
  files: FileScanResult[];
  totalIssues: number;
}

interface ScanReport {
  timestamp: string;
  apps: AppScanResult[];
  totalFiles: number;
  totalIssues: number;
  issuesByType: {
    text: number;
    attribute: number;
    expression: number;
  };
}

// ============================================================================
// FILE SCANNER
// ============================================================================

function getAllFiles(dir: string, files: string[] = []): string[] {
  const fullPath = resolve(ROOT, dir);
  if (!existsSync(fullPath)) return files;

  const items = readdirSync(fullPath);

  for (const item of items) {
    const itemPath = resolve(fullPath, item);
    const relativePath = relative(ROOT, itemPath);

    // Skip excluded patterns
    if (CONFIG.excludePatterns.some((p) => p.test(relativePath))) continue;

    const stat = statSync(itemPath);

    if (stat.isDirectory()) {
      getAllFiles(relativePath, files);
    } else if (CONFIG.extensions.includes(extname(item))) {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Extract the parent component name from a position in the source
 */
function findParentComponent(lines: string[], lineIndex: number): string | undefined {
  // Look backwards for the opening JSX tag
  for (let i = lineIndex; i >= Math.max(0, lineIndex - 10); i--) {
    const match = lines[i].match(/<([A-Z][a-zA-Z0-9]*|[a-z]+)/);
    if (match) {
      return match[1];
    }
  }
  return undefined;
}

/**
 * Scan a single file for hardcoded strings
 */
function scanFile(filePath: string): FileScanResult {
  const fullPath = resolve(ROOT, filePath);
  const content = readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  const issues: HardcodedStringIssue[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineNum = lineIndex + 1;

    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

    // Pattern 1: JSX text content - >Text here<
    // Match text between > and < that's not just whitespace/punctuation
    const jsxTextMatches = line.matchAll(/>([^<>{]+)</g);
    for (const match of jsxTextMatches) {
      const text = match[1];
      const col = match.index! + 1;

      if (isAllowedValue(text)) continue;
      if (!looksLikeUserFacingText(text)) continue;

      const parentComponent = findParentComponent(lines, lineIndex);
      if (parentComponent && IGNORED_COMPONENTS.has(parentComponent.toLowerCase())) continue;

      issues.push({
        line: lineNum,
        column: col,
        value: text.trim(),
        type: 'text',
        context: line.trim().substring(0, 100),
        component: parentComponent,
      });
    }

    // Pattern 2: User-facing attributes with string values
    for (const attr of USER_FACING_ATTRIBUTES) {
      // Match attribute="value" or attribute={'value'}
      const attrPatterns = [
        new RegExp(`${attr}=["']([^"']+)["']`, 'g'),
        new RegExp(`${attr}=\\{["']([^"']+)["']\\}`, 'g'),
      ];

      for (const pattern of attrPatterns) {
        const attrMatches = line.matchAll(pattern);
        for (const match of attrMatches) {
          const value = match[1];
          const col = match.index! + 1;

          if (isAllowedValue(value)) continue;
          if (!looksLikeUserFacingText(value)) continue;

          const parentComponent = findParentComponent(lines, lineIndex);
          if (parentComponent && IGNORED_COMPONENTS.has(parentComponent.toLowerCase())) continue;

          issues.push({
            line: lineNum,
            column: col,
            value: value.trim(),
            type: 'attribute',
            context: line.trim().substring(0, 100),
            attribute: attr,
            component: parentComponent,
          });
        }
      }
    }

    // Pattern 3: String literals in JSX expressions - {"Text here"}
    // Match strings inside JSX braces that look like user-facing text
    const expressionMatches = line.matchAll(/\{["']([^"']+)["']\}/g);
    for (const match of expressionMatches) {
      const text = match[1];
      const col = match.index! + 1;

      if (isAllowedValue(text)) continue;
      if (!looksLikeUserFacingText(text)) continue;

      // Skip if it looks like a prop value (followed by closing bracket or comma)
      const after = line.substring(match.index! + match[0].length).trimStart();
      if (after.startsWith('}') || after.startsWith(',')) continue;

      const parentComponent = findParentComponent(lines, lineIndex);
      if (parentComponent && IGNORED_COMPONENTS.has(parentComponent.toLowerCase())) continue;

      issues.push({
        line: lineNum,
        column: col,
        value: text.trim(),
        type: 'expression',
        context: line.trim().substring(0, 100),
        component: parentComponent,
      });
    }
  }

  return {
    path: filePath,
    issues,
  };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateMarkdownReport(report: ScanReport): string {
  const { timestamp, apps, totalFiles, totalIssues, issuesByType } = report;

  let md = `# I18n Hardcoded Strings Audit Report

**Scan Date:** ${timestamp}
**Repository:** xala-digdir-monorepo
**Total Files Scanned:** ${totalFiles}
**Total Issues Found:** ${totalIssues}

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Hardcoded Strings | ${totalIssues} |
| Text Content | ${issuesByType.text} |
| Attribute Values | ${issuesByType.attribute} |
| Expression Values | ${issuesByType.expression} |

### Issues by Application

| Application | Files with Issues | Total Issues |
|-------------|-------------------|--------------|
`;

  for (const app of apps) {
    const filesWithIssues = app.files.filter((f) => f.issues.length > 0).length;
    md += `| ${app.app} | ${filesWithIssues} | ${app.totalIssues} |\n`;
  }

  md += `
---

## How to Fix

Replace hardcoded strings with translation function calls:

\`\`\`tsx
// Before (hardcoded string)
<Button>Save Changes</Button>
<Input placeholder="Enter your name" />

// After (using @xala/i18n)
import { useT } from '@xala/i18n';

function MyComponent() {
  const t = useT();
  return (
    <>
      <Button>{t('common.save')}</Button>
      <Input placeholder={t('form.namePlaceholder')} />
    </>
  );
}
\`\`\`

---

## Detailed Findings

`;

  for (const app of apps) {
    md += `### ${app.app}

**Files Scanned:** ${app.files.length}
**Issues Found:** ${app.totalIssues}

`;

    if (app.totalIssues === 0) {
      md += `> ✅ No hardcoded strings found.\n\n`;
      continue;
    }

    const filesWithIssues = app.files.filter((f) => f.issues.length > 0);

    for (const file of filesWithIssues) {
      md += `#### \`${file.path}\`

| Line | Type | String | Context |
|------|------|--------|---------|
`;

      for (const issue of file.issues.slice(0, 25)) {
        const escapedValue = issue.value
          .replace(/\|/g, '\\|')
          .replace(/`/g, "'")
          .substring(0, 40);
        const escapedContext = issue.context
          .replace(/\|/g, '\\|')
          .replace(/`/g, "'")
          .substring(0, 50);
        const typeLabel = issue.attribute ? `${issue.type} (${issue.attribute})` : issue.type;

        md += `| ${issue.line} | ${typeLabel} | \`${escapedValue}\` | \`${escapedContext}...\` |\n`;
      }

      if (file.issues.length > 25) {
        md += `| ... | ... | +${file.issues.length - 25} more | ... |\n`;
      }

      md += '\n';
    }
  }

  md += `---

## Recommended Translation Keys

Based on common patterns found, consider adding these keys to your locale files:

\`\`\`typescript
// packages/i18n/src/locales/nb.ts
export const nb = {
  // Add keys for common hardcoded strings
  'common.saveChanges': 'Lagre endringer',
  'common.cancel': 'Avbryt',
  'common.delete': 'Slett',
  'common.edit': 'Rediger',
  'common.search': 'Søk',
  'common.loading': 'Laster...',
  'form.required': 'Påkrevd felt',
  'form.invalid': 'Ugyldig verdi',
  // ... add more based on findings
};
\`\`\`

---

## Scanner Commands

\`\`\`bash
# Run hardcoded string scanner
npx tsx scripts/scan-hardcoded-strings.ts

# Run with JSON output
npx tsx scripts/scan-hardcoded-strings.ts --json

# Run in strict mode (exit 1 if issues found)
npx tsx scripts/scan-hardcoded-strings.ts --strict

# Run ESLint i18n rule
pnpm lint
\`\`\`

---

*Generated by scan-hardcoded-strings.ts*
*Date: ${timestamp}*
`;

  return md;
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const strict = args.includes('--strict');
  const verbose = args.includes('--verbose');

  console.log('\n🔍 I18n Hardcoded String Scanner');
  console.log('=================================\n');

  const appResults: AppScanResult[] = [];
  let totalFiles = 0;
  let totalIssues = 0;
  const issuesByType = { text: 0, attribute: 0, expression: 0 };

  for (const dir of CONFIG.scanDirs) {
    const appName = dir.split('/')[1]; // Extract app name (web, backoffice, minside)
    console.log(`📂 Scanning ${appName}...`);

    const files = getAllFiles(dir);
    const fileResults: FileScanResult[] = [];
    let appIssues = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = scanFile(file);
      fileResults.push(result);
      appIssues += result.issues.length;

      // Count by type
      for (const issue of result.issues) {
        issuesByType[issue.type]++;
      }

      if (verbose && (i + 1) % 20 === 0) {
        process.stdout.write(`\r   Scanned ${i + 1}/${files.length} files...`);
      }
    }

    if (verbose) {
      console.log(`\r   Scanned ${files.length} files ✓`);
    }

    appResults.push({
      app: appName,
      files: fileResults,
      totalIssues: appIssues,
    });

    totalFiles += files.length;
    totalIssues += appIssues;

    const icon = appIssues === 0 ? '✅' : appIssues < 10 ? '⚠️' : '❌';
    console.log(`   ${icon} Found ${appIssues} hardcoded strings in ${files.length} files\n`);
  }

  // Build report
  const report: ScanReport = {
    timestamp: new Date().toISOString().split('T')[0],
    apps: appResults,
    totalFiles,
    totalIssues,
    issuesByType,
  };

  // Ensure reports directory exists
  const reportsDir = resolve(ROOT, 'reports');
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
  }

  // Generate and save markdown report
  const markdown = generateMarkdownReport(report);
  const reportPath = resolve(ROOT, CONFIG.reportPath);
  writeFileSync(reportPath, markdown);
  console.log(`📄 Report saved to: ${CONFIG.reportPath}`);

  // Output JSON if requested
  if (outputJson) {
    const jsonPath = reportPath.replace('.md', '.json');
    writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`📊 JSON saved to: reports/I18N_HARDCODED_STRINGS.json`);
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Total issues found: ${totalIssues}`);
  console.log(`   - Text content: ${issuesByType.text}`);
  console.log(`   - Attribute values: ${issuesByType.attribute}`);
  console.log(`   - Expression values: ${issuesByType.expression}`);

  if (strict && totalIssues > 0) {
    console.log('\n❌ Strict mode: Failing due to hardcoded strings found');
    process.exit(1);
  }

  if (totalIssues === 0) {
    console.log('\n✅ All checks passed! No hardcoded strings found.');
  } else {
    console.log('\n⚠️  Hardcoded strings found. Review the report for details.');
    console.log('   Run `pnpm lint` to see ESLint warnings for these issues.');
  }
}

main().catch((err) => {
  console.error('❌ Scanner failed:', err);
  process.exit(1);
});
