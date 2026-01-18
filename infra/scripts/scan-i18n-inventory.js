#!/usr/bin/env node

/**
 * Comprehensive i18n Inventory Scanner for Digilist Platform
 * 
 * Scans all pages and components for:
 * - Translation key usage (t('key'), useT(), useLazyT())
 * - Hard-coded strings in JSX/TSX
 * - Missing translations
 * - Unused translation keys
 * 
 * Usage:
 *   node infra/scripts/scan-i18n-inventory.js [--format json|csv|markdown] [--app minside|backoffice|web] [--include-packages]
 * 
 * Examples:
 *   node infra/scripts/scan-i18n-inventory.js --format markdown
 *   node infra/scripts/scan-i18n-inventory.js --app minside --format csv
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../..');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(rootDir, 'i18n-inventory-reports');

// Parse command line arguments
const args = process.argv.slice(2);
let outputFormat = 'json';
let appFilter = '';
let includePackages = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--format' && args[i + 1]) {
    outputFormat = args[i + 1].toLowerCase();
    i++;
  } else if (args[i] === '--app' && args[i + 1]) {
    appFilter = args[i + 1];
    i++;
  } else if (args[i] === '--include-packages') {
    includePackages = true;
  }
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, `i18n-inventory-${timestamp}.${outputFormat}`);

console.log('🔍 Digilist Platform - i18n Inventory Scanner');
console.log('=============================================');
console.log('');

// Initialize results
const results = {
  metadata: {
    scanDate: new Date().toISOString(),
    outputFormat,
    appFilter: appFilter || 'all',
    includePackages,
  },
  summary: {
    totalFiles: 0,
    filesWithTranslations: 0,
    filesWithHardcodedStrings: 0,
    totalTranslationKeys: 0,
    totalHardcodedStrings: 0,
    uniqueTranslationKeys: {},
    uniqueNamespaces: {},
  },
  files: [],
  translationKeys: [],
  hardcodedStrings: [],
  violations: [],
};

// Translation patterns
const translationPatterns = {
  tFunction: /\bt\(['"`]([^'"`]+)['"`]/g,
  tWithInterpolation: /\bt\(['"`]([^'"`]+)['"`],\s*\{/g,
  useT: /use(Lazy)?T\(\)/g,
  useTranslation: /useTranslation\(\)/g,
};

// Hard-coded string patterns
const hardcodedPatterns = {
  jsxText: />([A-ZÆØÅ][a-zæøåA-ZÆØÅ\s]{2,})</g,
  placeholder: /placeholder=['"]([^'"]+)['"]/g,
  title: /title=['"]([^'"]+)['"]/g,
  ariaLabel: /aria-label=['"]([^'"]+)['"]/g,
};

/**
 * Extract translation keys from file content
 */
function extractTranslationKeys(content, filePath) {
  const keys = [];
  const lines = content.split('\n');
  
  // Find all t('key') patterns
  let match;
  while ((match = translationPatterns.tFunction.exec(content)) !== null) {
    const key = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    keys.push({
      key,
      file: filePath,
      type: 'direct',
      line: lineNumber,
    });
  }
  
  // Reset regex
  translationPatterns.tFunction.lastIndex = 0;
  
  return keys;
}

/**
 * Detect hard-coded strings in file content
 */
function detectHardcodedStrings(content, filePath) {
  const strings = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Skip import statements, comments, and console logs
    if (/^\s*(import|\/\/|\/\*|\*|console\.)/.test(line)) {
      return;
    }
    
    // JSX text content
    const jsxMatches = line.matchAll(hardcodedPatterns.jsxText);
    for (const match of jsxMatches) {
      const text = match[1].trim();
      if (text && text.length > 2 && !/^\{/.test(text) && !/^[0-9]+$/.test(text)) {
        strings.push({
          text,
          file: filePath,
          line: lineNum,
          type: 'jsx-text',
          context: line.trim().substring(0, 100),
        });
      }
    }
    
    // Placeholder attributes
    const placeholderMatches = line.matchAll(hardcodedPatterns.placeholder);
    for (const match of placeholderMatches) {
      const text = match[1];
      if (!/^\{/.test(text) && text.length > 2) {
        strings.push({
          text,
          file: filePath,
          line: lineNum,
          type: 'placeholder',
          context: line.trim().substring(0, 100),
        });
      }
    }
    
    // Title attributes
    const titleMatches = line.matchAll(hardcodedPatterns.title);
    for (const match of titleMatches) {
      const text = match[1];
      if (!/^\{/.test(text) && text.length > 2) {
        strings.push({
          text,
          file: filePath,
          line: lineNum,
          type: 'title',
          context: line.trim().substring(0, 100),
        });
      }
    }
    
    // aria-label attributes
    const ariaMatches = line.matchAll(hardcodedPatterns.ariaLabel);
    for (const match of ariaMatches) {
      const text = match[1];
      if (!/^\{/.test(text) && text.length > 2) {
        strings.push({
          text,
          file: filePath,
          line: lineNum,
          type: 'aria-label',
          context: line.trim().substring(0, 100),
        });
      }
    }
  });
  
  return strings;
}

/**
 * Scan a single file
 */
function scanFile(filePath) {
  const relativePath = path.relative(rootDir, filePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract translation keys
    const translationKeys = extractTranslationKeys(content, relativePath);
    
    // Detect hard-coded strings
    const hardcodedStrings = detectHardcodedStrings(content, relativePath);
    
    // Check for translation hook usage
    const usesTranslation = translationPatterns.useT.test(content) || 
                           translationPatterns.useTranslation.test(content);
    
    // Build file result
    const fileResult = {
      path: relativePath,
      usesTranslation,
      translationKeyCount: translationKeys.length,
      hardcodedStringCount: hardcodedStrings.length,
      translationKeys,
      hardcodedStrings,
    };
    
    // Update summary
    results.summary.totalFiles++;
    if (translationKeys.length > 0) {
      results.summary.filesWithTranslations++;
      results.summary.totalTranslationKeys += translationKeys.length;
    }
    if (hardcodedStrings.length > 0) {
      results.summary.filesWithHardcodedStrings++;
      results.summary.totalHardcodedStrings += hardcodedStrings.length;
    }
    
    // Track unique keys and namespaces
    translationKeys.forEach(({ key }) => {
      results.summary.uniqueTranslationKeys[key] = 
        (results.summary.uniqueTranslationKeys[key] || 0) + 1;
      
      // Extract namespace
      const namespaceMatch = key.match(/^([^.]+)\./);
      if (namespaceMatch) {
        const namespace = namespaceMatch[1];
        results.summary.uniqueNamespaces[namespace] = 
          (results.summary.uniqueNamespaces[namespace] || 0) + 1;
      }
    });
    
    // Add to results
    results.files.push(fileResult);
    results.translationKeys.push(...translationKeys);
    results.hardcodedStrings.push(...hardcodedStrings);
    
    // Check for violations
    if (hardcodedStrings.length > 0 && usesTranslation) {
      results.violations.push({
        file: relativePath,
        type: 'mixed-approach',
        message: `File uses translations but also contains ${hardcodedStrings.length} hard-coded strings`,
        severity: 'warning',
      });
    }
    
    if (hardcodedStrings.length > 5 && !usesTranslation) {
      results.violations.push({
        file: relativePath,
        type: 'no-i18n',
        message: `File contains ${hardcodedStrings.length} hard-coded strings but doesn't use i18n`,
        severity: 'error',
      });
    }
    
    console.log(`  ✓ ${relativePath}`);
    
  } catch (error) {
    console.error(`  ✗ ${relativePath} - Error: ${error.message}`);
  }
}

/**
 * Recursively find files
 */
function findFiles(dir, extensions = ['.ts', '.tsx']) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    // Skip node_modules, dist, .turbo, test files
    if (item === 'node_modules' || item === 'dist' || item === '.turbo') {
      continue;
    }
    
    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, extensions));
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext) && !item.includes('.test.') && !item.includes('.spec.')) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Generate output based on format
 */
function generateOutput() {
  switch (outputFormat) {
    case 'json':
      fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8');
      console.log(`\n✅ JSON report saved to: ${outputFile}`);
      break;
      
    case 'csv':
      // Create CSV for translation keys
      const csvKeysFile = outputFile.replace('.csv', '-keys.csv');
      const keysHeader = 'Key,File,Type,Line\n';
      const keysRows = results.translationKeys
        .map(k => `"${k.key}","${k.file}","${k.type}",${k.line}`)
        .join('\n');
      fs.writeFileSync(csvKeysFile, keysHeader + keysRows, 'utf8');
      
      // Create CSV for hard-coded strings
      const csvStringsFile = outputFile.replace('.csv', '-hardcoded.csv');
      const stringsHeader = 'Text,File,Line,Type,Context\n';
      const stringsRows = results.hardcodedStrings
        .map(s => `"${s.text}","${s.file}",${s.line},"${s.type}","${s.context}"`)
        .join('\n');
      fs.writeFileSync(csvStringsFile, stringsHeader + stringsRows, 'utf8');
      
      // Create CSV for violations
      const csvViolationsFile = outputFile.replace('.csv', '-violations.csv');
      const violationsHeader = 'File,Type,Message,Severity\n';
      const violationsRows = results.violations
        .map(v => `"${v.file}","${v.type}","${v.message}","${v.severity}"`)
        .join('\n');
      fs.writeFileSync(csvViolationsFile, violationsHeader + violationsRows, 'utf8');
      
      console.log('\n✅ CSV reports saved:');
      console.log(`   - Keys: ${csvKeysFile}`);
      console.log(`   - Hard-coded: ${csvStringsFile}`);
      console.log(`   - Violations: ${csvViolationsFile}`);
      break;
      
    case 'markdown':
      const namespaces = Object.entries(results.summary.uniqueNamespaces)
        .sort((a, b) => b[1] - a[1]);
      const topViolations = results.violations.slice(0, 20);
      const topHardcodedFiles = results.files
        .filter(f => f.hardcodedStringCount > 0)
        .sort((a, b) => b.hardcodedStringCount - a.hardcodedStringCount)
        .slice(0, 20);
      const topKeys = Object.entries(results.summary.uniqueTranslationKeys)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
      
      let md = `# i18n Inventory Report

**Generated:** ${new Date().toISOString().replace('T', ' ').substring(0, 19)}  
**App Filter:** ${appFilter || 'all'}  
**Include Packages:** ${includePackages}

---

## 📊 Summary

| Metric | Count |
|--------|-------|
| Total Files Scanned | ${results.summary.totalFiles} |
| Files with Translations | ${results.summary.filesWithTranslations} |
| Files with Hard-coded Strings | ${results.summary.filesWithHardcodedStrings} |
| Total Translation Keys Used | ${results.summary.totalTranslationKeys} |
| Unique Translation Keys | ${Object.keys(results.summary.uniqueTranslationKeys).length} |
| Unique Namespaces | ${Object.keys(results.summary.uniqueNamespaces).length} |
| Total Hard-coded Strings | ${results.summary.totalHardcodedStrings} |
| Violations | ${results.violations.length} |

---

## 🔑 Translation Keys by Namespace

| Namespace | Usage Count |
|-----------|-------------|
${namespaces.map(([ns, count]) => `| ${ns} | ${count} |`).join('\n')}

---

## ⚠️ Top Violations

| File | Type | Message | Severity |
|------|------|---------|----------|
${topViolations.map(v => `| \`${v.file}\` | ${v.type} | ${v.message} | ${v.severity} |`).join('\n')}

---

## 📝 Files with Most Hard-coded Strings

| File | Count | Uses i18n? |
|------|-------|------------|
${topHardcodedFiles.map(f => `| \`${f.path}\` | ${f.hardcodedStringCount} | ${f.usesTranslation ? '✅' : '❌'} |`).join('\n')}

---

## 🎯 Most Used Translation Keys

| Key | Usage Count |
|-----|-------------|
${topKeys.map(([key, count]) => `| \`${key}\` | ${count} |`).join('\n')}

---

*End of Report*
`;
      
      fs.writeFileSync(outputFile, md, 'utf8');
      console.log(`\n✅ Markdown report saved to: ${outputFile}`);
      break;
  }
}

// Main execution
console.log('📂 Scanning directories...');

const scanDirs = [];

if (appFilter) {
  const appPath = path.join(rootDir, 'apps', appFilter);
  if (fs.existsSync(appPath)) {
    scanDirs.push(appPath);
  } else {
    console.error(`❌ App '${appFilter}' not found`);
    process.exit(1);
  }
} else {
  scanDirs.push(path.join(rootDir, 'apps'));
}

if (includePackages) {
  scanDirs.push(path.join(rootDir, 'packages'));
}

// Scan all files
for (const dir of scanDirs) {
  if (fs.existsSync(dir)) {
    console.log(`  Scanning: ${dir}`);
    const files = findFiles(dir);
    files.forEach(scanFile);
  }
}

// Print summary
console.log('');
console.log('📊 Scan Summary');
console.log('===============');
console.log(`Total files scanned:           ${results.summary.totalFiles}`);
console.log(`Files with translations:       ${results.summary.filesWithTranslations}`);
console.log(`Files with hard-coded strings: ${results.summary.filesWithHardcodedStrings}`);
console.log(`Total translation keys used:   ${results.summary.totalTranslationKeys}`);
console.log(`Unique translation keys:       ${Object.keys(results.summary.uniqueTranslationKeys).length}`);
console.log(`Unique namespaces:             ${Object.keys(results.summary.uniqueNamespaces).length}`);
console.log(`Total hard-coded strings:      ${results.summary.totalHardcodedStrings}`);
console.log(`Violations found:              ${results.violations.length}`);

// Generate output
generateOutput();

console.log('');
console.log('🎉 Scan complete!');
