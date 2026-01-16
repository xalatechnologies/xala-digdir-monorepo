#!/usr/bin/env node
/**
 * i18n Localization Scanner
 *
 * Scans the codebase for hardcoded strings that should be localized.
 *
 * Usage:
 *   node scripts/scan-i18n.js [path]
 *
 * Examples:
 *   node scripts/scan-i18n.js apps/minside/src
 *   node scripts/scan-i18n.js apps/minside/src/routes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // File extensions to scan
  extensions: ['.tsx', '.ts', '.jsx', '.js'],

  // Directories to skip
  skipDirs: ['node_modules', 'dist', 'build', '.git', 'coverage'],

  // Files to skip
  skipFiles: ['.test.', '.spec.', '.stories.'],

  // Minimum string length to report (avoid single chars like "X", "Y")
  minStringLength: 2,

  // Patterns that indicate a string should be localized
  shouldLocalizePatterns: [
    // JSX text content
    />\s*([A-ZÆØÅ][a-zæøå\s]+.*?)\s*</g,
    // String props that should be localized
    /(?:title|label|placeholder|description|message|text|subtitle|heading|alt|aria-label)\s*=\s*["']([^"']{2,})["']/g,
    // Alert/console messages
    /(?:alert|confirm|console\.(?:log|warn|error))\s*\(\s*["']([^"']{2,})["']/g,
  ],

  // Patterns to ignore (already localized or shouldn't be localized)
  ignorePatterns: [
    // Already using t() function
    /t\s*\(\s*["']/,
    // Environment variables
    /process\.env\./,
    /import\.meta\.env\./,
    // URLs and paths
    /^https?:\/\//,
    /^\/[a-z-/]+$/,
    // CSS classes and IDs
    /className\s*=/,
    /class\s*=/,
    /id\s*=/,
    // Data attributes
    /data-[a-z-]+\s*=/,
    // File extensions and MIME types
    /\.(jpg|png|svg|pdf|json|css|js|ts|tsx)/,
    /^image\//,
    /^text\//,
    // ISO dates and numbers
    /^\d{4}-\d{2}-\d{2}/,
    /^\d+$/,
    // Email addresses
    /@[a-z0-9.-]+\.[a-z]{2,}/i,
    // Common code strings
    /^(true|false|null|undefined)$/,
    // Regex patterns
    /new RegExp/,
    // Import/export statements
    /^(import|export|from)\s/,
    // Mock/test data patterns
    /MOCK_[A-Z_]+/,
    /^Test\s/,
    /@test\./,
    // Technical identifier constants (CONTEXT_, TYPE_, etc.)
    /(?:const|let|var)\s+[A-Z_][A-Z0-9_]*\s*[:=]\s*["']/,
    // Technical identifiers in assignments
    /CONTEXT_[A-Z_]+\s*[:=]\s*["']/,
    /TYPE_[A-Z_]+\s*[:=]\s*["']/,
    // Route context values (technical identifiers)
    /requiredContext\s*=\s*\{[A-Z_]+\}/,
  ],

  // Common Norwegian/English words that indicate user-facing text
  commonWords: [
    // Norwegian
    'hjelp', 'søk', 'lukk', 'åpne', 'lagre', 'avbryt', 'slett', 'endre', 'legg til',
    'tilbake', 'neste', 'forrige', 'send', 'bekreft', 'ja', 'nei', 'velg', 'valgt',
    'feil', 'suksess', 'advarsel', 'informasjon', 'laster', 'ingen', 'alle', 'ny',
    'rediger', 'opprett', 'fjern', 'kopier', 'lim inn', 'last ned', 'last opp',
    // English
    'help', 'search', 'close', 'open', 'save', 'cancel', 'delete', 'edit', 'add',
    'back', 'next', 'previous', 'submit', 'confirm', 'yes', 'no', 'select', 'selected',
    'error', 'success', 'warning', 'info', 'loading', 'none', 'all', 'new',
    'remove', 'copy', 'paste', 'download', 'upload', 'create',
  ],
};

// Results storage
const results = {
  totalFiles: 0,
  scannedFiles: 0,
  skippedFiles: 0,
  issues: [],
  summary: {
    hardcodedStrings: 0,
    missingT: 0,
    suspiciousPatterns: 0,
  },
};

/**
 * Check if a string should be ignored
 */
function shouldIgnore(str, context = '') {
  if (!str || str.trim().length < CONFIG.minStringLength) return true;

  // Check against ignore patterns
  for (const pattern of CONFIG.ignorePatterns) {
    if (pattern.test(str) || pattern.test(context)) {
      return true;
    }
  }

  // Ignore strings that are just symbols or punctuation
  if (/^[^a-zA-ZæøåÆØÅ]+$/.test(str)) return true;

  // Ignore single words that are likely code (camelCase, PascalCase, etc.)
  if (/^[a-z]+[A-Z]/.test(str) && !/\s/.test(str)) return true;

  return false;
}

/**
 * Check if a string contains common user-facing words
 */
function containsCommonWords(str) {
  const lower = str.toLowerCase();
  return CONFIG.commonWords.some(word => lower.includes(word));
}

/**
 * Extract strings from JSX/TSX content
 */
function extractStrings(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  // Check if file uses t() function
  const usesT = /const\s+t\s*=\s*useT\s*\(/.test(content) ||
                /import\s+{[^}]*\buseT\b[^}]*}\s+from/.test(content);

  // Pattern 1: JSX text content between tags
  // Match: >Some Text< but not >  < or >123<
  const jsxTextPattern = />([^<>{}\n]+)</g;
  let match;

  while ((match = jsxTextPattern.exec(content)) !== null) {
    const text = match[1].trim();
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const lineContent = lines[lineNumber - 1]?.trim() || '';

    // Skip if it's just whitespace, numbers, or should be ignored
    if (shouldIgnore(text, lineContent)) continue;

    // Check if it looks like user-facing text (starts with capital or contains common words)
    if (/^[A-ZÆØÅ]/.test(text) || containsCommonWords(text)) {
      // Check if it's using t() on the same or nearby lines
      const contextLines = lines.slice(Math.max(0, lineNumber - 2), lineNumber + 1).join('\n');
      if (!contextLines.includes('t(') && !contextLines.includes('{t(')) {
        issues.push({
          file: filePath,
          line: lineNumber,
          type: 'hardcoded_jsx_text',
          string: text,
          context: lineContent.substring(0, 100),
          severity: 'high',
        });
        results.summary.hardcodedStrings++;
      }
    }
  }

  // Pattern 2: String literals in props
  const propsPattern = /(title|label|placeholder|description|message|text|subtitle|heading|alt|aria-label|panelTitle|panelSubtitle|brandName|brandTagline)\s*=\s*["']([^"']+)["']/g;

  while ((match = propsPattern.exec(content)) !== null) {
    const propName = match[1];
    const propValue = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const lineContent = lines[lineNumber - 1]?.trim() || '';

    if (shouldIgnore(propValue, lineContent)) continue;

    // Ignore if this is a constant assignment (technical identifier)
    // Check if line contains const/let/var declaration with uppercase constant name
    if (/^\s*(const|let|var)\s+[A-Z_][A-Z0-9_]*\s*[:=]\s*["']/.test(lineContent)) continue;
    
    // Ignore technical identifier values (personal, organization, etc. in constant context)
    if ((propValue === 'personal' || propValue === 'organization') && 
        /CONTEXT_|TYPE_|const\s+[A-Z_]/.test(lineContent)) continue;

    // Check if it's using t()
    if (!lineContent.includes('t(')) {
      issues.push({
        file: filePath,
        line: lineNumber,
        type: 'hardcoded_prop',
        string: propValue,
        prop: propName,
        context: lineContent.substring(0, 100),
        severity: 'high',
      });
      results.summary.hardcodedStrings++;
    }
  }

  // Pattern 3: Alert/console messages
  const alertPattern = /(alert|confirm)\s*\(\s*["']([^"']+)["']/g;

  while ((match = alertPattern.exec(content)) !== null) {
    const method = match[1];
    const message = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const lineContent = lines[lineNumber - 1]?.trim() || '';

    if (shouldIgnore(message, lineContent)) continue;

    if (!lineContent.includes('t(')) {
      issues.push({
        file: filePath,
        line: lineNumber,
        type: 'hardcoded_alert',
        string: message,
        method: method,
        context: lineContent.substring(0, 100),
        severity: 'medium',
      });
      results.summary.hardcodedStrings++;
    }
  }

  // Pattern 4: Object properties that look like text
  const objectTextPattern = /(name|title|label|description)\s*:\s*["']([^"']+)["']/g;

  while ((match = objectTextPattern.exec(content)) !== null) {
    const key = match[1];
    const value = match[2];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const lineContent = lines[lineNumber - 1]?.trim() || '';

    if (shouldIgnore(value, lineContent)) continue;

    // Only flag if it looks like user-facing text
    if ((/^[A-ZÆØÅ]/.test(value) || containsCommonWords(value)) && !lineContent.includes('t(')) {
      issues.push({
        file: filePath,
        line: lineNumber,
        type: 'hardcoded_object_value',
        string: value,
        key: key,
        context: lineContent.substring(0, 100),
        severity: 'medium',
      });
      results.summary.hardcodedStrings++;
    }
  }

  // Pattern 5: Check if file has JSX but doesn't use t()
  const hasJSX = /<[A-Z][a-zA-Z]*/.test(content);
  const hasText = />[A-ZÆØÅ][a-z]/.test(content);

  if (hasJSX && hasText && !usesT && filePath.endsWith('.tsx')) {
    // Check if file has any hardcoded strings we detected
    if (issues.length > 0) {
      issues.push({
        file: filePath,
        line: 1,
        type: 'missing_t_import',
        string: '',
        context: 'File contains user-facing text but does not import useT()',
        severity: 'high',
      });
      results.summary.missingT++;
    }
  }

  return issues;
}

/**
 * Scan a single file
 */
function scanFile(filePath) {
  results.totalFiles++;

  // Check if file should be skipped
  for (const skip of CONFIG.skipFiles) {
    if (filePath.includes(skip)) {
      results.skippedFiles++;
      return;
    }
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    results.scannedFiles++;

    const issues = extractStrings(content, filePath);
    results.issues.push(...issues);
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Skip excluded directories
      if (CONFIG.skipDirs.includes(entry.name)) continue;
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      // Check if file has valid extension
      const ext = path.extname(entry.name);
      if (CONFIG.extensions.includes(ext)) {
        scanFile(fullPath);
      }
    }
  }
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n========================================');
  console.log('i18n LOCALIZATION SCAN REPORT');
  console.log('========================================\n');

  console.log('Files Scanned:', results.scannedFiles);
  console.log('Files Skipped:', results.skippedFiles);
  console.log('Total Files:', results.totalFiles);
  console.log('\n----------------------------------------');
  console.log('SUMMARY');
  console.log('----------------------------------------');
  console.log('Hardcoded Strings:', results.summary.hardcodedStrings);
  console.log('Missing t() Import:', results.summary.missingT);
  console.log('Total Issues:', results.issues.length);

  // Group issues by file
  const issuesByFile = {};
  for (const issue of results.issues) {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  }

  // Sort files by issue count
  const sortedFiles = Object.keys(issuesByFile).sort((a, b) =>
    issuesByFile[b].length - issuesByFile[a].length
  );

  console.log('\n----------------------------------------');
  console.log('ISSUES BY FILE');
  console.log('----------------------------------------\n');

  for (const file of sortedFiles) {
    const issues = issuesByFile[file];
    const relPath = file.replace(process.cwd(), '.');

    console.log(`\n📄 ${relPath} (${issues.length} issues)`);
    console.log('─'.repeat(80));

    for (const issue of issues) {
      const icon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
      console.log(`  ${icon} Line ${issue.line}: ${issue.type}`);

      if (issue.string) {
        console.log(`     String: "${issue.string}"`);
      }

      if (issue.prop) {
        console.log(`     Prop: ${issue.prop}`);
      }

      if (issue.context && issue.type !== 'missing_t_import') {
        console.log(`     Context: ${issue.context}`);
      }

      console.log('');
    }
  }

  // Generate JSON report
  const reportPath = path.join(process.cwd(), 'i18n-scan-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      filesScanned: results.scannedFiles,
      filesSkipped: results.skippedFiles,
      totalFiles: results.totalFiles,
      totalIssues: results.issues.length,
      ...results.summary,
    },
    issuesByFile,
    allIssues: results.issues,
  }, null, 2));

  console.log('\n----------------------------------------');
  console.log('REPORT SAVED');
  console.log('----------------------------------------');
  console.log(`JSON report: ${reportPath}`);
  console.log('\n========================================\n');

  // Return exit code based on results
  return results.issues.length > 0 ? 1 : 0;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const scanPath = args[0] || 'apps/minside/src';
  // Handle both absolute and relative paths (lint-staged passes absolute paths)
  const fullPath = path.isAbsolute(scanPath) ? scanPath : path.join(process.cwd(), scanPath);

  console.log('\n🔍 Starting i18n localization scan...');
  console.log(`📂 Scanning: ${fullPath}\n`);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: Path does not exist: ${fullPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(fullPath);

  if (stats.isDirectory()) {
    scanDirectory(fullPath);
  } else if (stats.isFile()) {
    scanFile(fullPath);
  }

  const exitCode = generateReport();
  process.exit(exitCode);
}

// Run scanner
main();
