#!/usr/bin/env node
/**
 * Hardcoded Strings Detector
 * 
 * Scans UI components for hardcoded user-facing strings.
 * Uses heuristics + allowlist to detect violations.
 * 
 * Usage: node scripts/quality/detect-hardcoded-strings.js [--fix]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  scanDirs: [
    'apps/web/src',
    'apps/minside/src',
    'apps/backoffice/src',
    'packages/ds/src',
  ],
  extensions: ['tsx', 'jsx'],
  allowlist: [
    // Technical strings
    /^[A-Z_]+$/,           // CONSTANTS
    /^\d+$/,               // Numbers
    /^https?:\/\//,        // URLs
    /^\/[a-z]/,            // Routes
    /^\./,                 // File paths
    /^#[0-9a-f]+$/i,       // Hex colors
    /^[a-z]+:$/i,          // CSS pseudo-selectors
    /^[a-z]+\.[a-z]+$/i,   // i18n keys (dot notation)
    
    // Common technical words
    /^(id|key|type|name|value|data|src|href|alt|ref|className|style|onClick|onChange)$/i,
    
    // Single characters or very short
    /^.{0,2}$/,
    
    // Common UI tokens
    /^(xs|sm|md|lg|xl|xxl)$/,
    /^(primary|secondary|tertiary|danger|warning|success|info)$/,
    /^(flex|grid|block|inline|hidden)$/,
  ],
  // Minimum length for suspicious strings
  minLength: 3,
  // Maximum line length to consider
  maxLineLength: 200,
};

/**
 * Check if string is in allowlist
 */
function isAllowlisted(str) {
  return CONFIG.allowlist.some(pattern => pattern.test(str));
}

/**
 * Extract potential hardcoded strings from file
 */
function extractStrings(content, filePath) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, lineIndex) => {
    // Skip imports, exports, and comments
    if (line.trim().startsWith('import ') || 
        line.trim().startsWith('export ') ||
        line.trim().startsWith('//') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('*')) {
      return;
    }
    
    // Skip lines that are too long (likely generated)
    if (line.length > CONFIG.maxLineLength) {
      return;
    }
    
    // Find JSX text content: >text<
    const jsxTextPattern = />([^<>{]+)</g;
    let match;
    
    while ((match = jsxTextPattern.exec(line)) !== null) {
      const text = match[1].trim();
      
      if (text.length >= CONFIG.minLength && 
          !isAllowlisted(text) && 
          /[a-zA-ZæøåÆØÅ]{3,}/.test(text)) { // Has real words
        
        issues.push({
          file: filePath,
          line: lineIndex + 1,
          column: match.index,
          text: text.substring(0, 50),
          type: 'jsx-text',
        });
      }
    }
    
    // Find string literals that look like user-facing text
    // Matches: "text", 'text', `text`
    const stringPattern = /[=:]\s*["'`]([^"'`\n]{4,})["'`]/g;
    
    while ((match = stringPattern.exec(line)) !== null) {
      const text = match[1].trim();
      
      // Skip if it looks technical
      if (isAllowlisted(text) ||
          text.includes('${') ||       // Template literal
          text.includes('.') ||        // Likely i18n key or path
          /^[a-zA-Z_-]+$/.test(text) || // Likely identifier
          line.includes('className') ||
          line.includes('data-testid') ||
          line.includes('aria-') ||
          line.includes('console.') ||
          line.includes('throw ') ||
          line.includes('console.log')) {
        continue;
      }
      
      // If it has spaces and Norwegian/English words, flag it
      if (/\s/.test(text) && /[æøåÆØÅ]|(?:the|and|or|for|you|your|min|din|for|er|og|en|et|av)/i.test(text)) {
        issues.push({
          file: filePath,
          line: lineIndex + 1,
          column: match.index,
          text: text.substring(0, 50),
          type: 'string-literal',
        });
      }
    }
  });
  
  return issues;
}

/**
 * Scan all files
 */
async function scanFiles() {
  console.log('🔍 Scanning for hardcoded strings...\n');
  
  const rootDir = path.resolve(__dirname, '../..');
  const allIssues = [];
  
  for (const scanDir of CONFIG.scanDirs) {
    const dir = path.join(rootDir, scanDir);
    
    if (!fs.existsSync(dir)) {
      console.log(`  ⚠ Directory not found: ${scanDir}`);
      continue;
    }
    
    const pattern = `${dir}/**/*.{${CONFIG.extensions.join(',')}}`;
    const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'] });
    
    console.log(`  Scanning ${scanDir}: ${files.length} files`);
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const issues = extractStrings(content, path.relative(rootDir, file));
      allIssues.push(...issues);
    }
  }
  
  // Report results
  console.log(`\n📊 Results: ${allIssues.length} potential hardcoded strings\n`);
  
  if (allIssues.length > 0) {
    // Group by file
    const byFile = {};
    for (const issue of allIssues) {
      if (!byFile[issue.file]) byFile[issue.file] = [];
      byFile[issue.file].push(issue);
    }
    
    // Show top 10 files
    const sortedFiles = Object.entries(byFile)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10);
    
    for (const [file, issues] of sortedFiles) {
      console.log(`📁 ${file} (${issues.length} issues)`);
      
      for (const issue of issues.slice(0, 3)) {
        console.log(`   L${issue.line}: "${issue.text}..."`);
      }
      
      if (issues.length > 3) {
        console.log(`   ... and ${issues.length - 3} more`);
      }
      console.log('');
    }
    
    // Summary
    console.log('─'.repeat(50));
    console.log(`\n⚠️  Found ${allIssues.length} potential hardcoded strings.`);
    console.log('   Review and wrap with t() from @xala/i18n\n');
    
    // Don't fail CI by default - just warn
    // process.exit(1);
  } else {
    console.log('✅ No hardcoded strings detected!\n');
  }
  
  return allIssues;
}

scanFiles().catch(console.error);
