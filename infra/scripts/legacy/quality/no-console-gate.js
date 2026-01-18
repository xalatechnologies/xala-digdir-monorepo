#!/usr/bin/env node
/**
 * No-Console Gate
 * 
 * Fails CI if console.* statements are found in production code paths.
 * 
 * Usage: node scripts/quality/no-console-gate.js
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
    'apps/api/src',
    'packages/client-sdk/src',
    'packages/ds/src',
    'packages/auth/src',
    'packages/i18n/src',
  ],
  extensions: ['ts', 'tsx', 'js', 'jsx'],
  exclude: [
    '**/node_modules/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/test/**',
    '**/tests/**',
    '**/__tests__/**',
    '**/mocks/**',
    '**/fixtures/**',
  ],
  // Allowed console patterns
  allowlist: [
    /console\.(error|warn)\(.*Error/,  // Logging actual errors
    /console\.\w+\(.*\bif\s*\(/,       // Conditional logging
    /if\s*\(.*console\./,               // Conditional logging
    /process\.env\.NODE_ENV.*console/,  // Environment-conditional
    /import\.meta\.env\.DEV.*console/,  // Vite dev-only
  ],
  // These are always allowed
  allowedPatterns: [
    'console.error',  // Errors are important
    'console.warn',   // Warnings are important
  ],
  // These must be removed
  bannedPatterns: [
    'console.log',
    'console.info',
    'console.debug',
    'console.trace',
    'console.dir',
    'console.table',
    'console.time',
    'console.timeEnd',
    'console.group',
    'console.groupEnd',
    'console.clear',
  ],
  failOnViolation: true,
};

/**
 * Check if line is in a development-only block
 */
function isInDevBlock(lines, lineIndex) {
  // Look back for dev conditionals
  for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 5); i--) {
    const line = lines[i];
    if (/if\s*\(\s*import\.meta\.env\.DEV|process\.env\.NODE_ENV\s*[!=]==?\s*['"]development['"]/.test(line)) {
      return true;
    }
  }
  return false;
}

/**
 * Scan file for console statements
 */
function scanFile(filePath, rootDir) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];
  
  lines.forEach((line, lineIndex) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }
    
    for (const banned of CONFIG.bannedPatterns) {
      if (line.includes(banned)) {
        // Check if in dev block
        if (isInDevBlock(lines, lineIndex)) {
          return;
        }
        
        // Check allowlist patterns
        const isAllowed = CONFIG.allowlist.some(pattern => pattern.test(line));
        if (isAllowed) {
          return;
        }
        
        violations.push({
          file: path.relative(rootDir, filePath),
          line: lineIndex + 1,
          statement: banned,
          code: line.trim().substring(0, 80),
        });
      }
    }
  });
  
  return violations;
}

/**
 * Main scan
 */
async function runGate() {
  console.log('🚫 No-Console Gate\n');
  
  const rootDir = path.resolve(__dirname, '../..');
  const allViolations = [];
  let totalFiles = 0;
  
  for (const scanDir of CONFIG.scanDirs) {
    const dir = path.join(rootDir, scanDir);
    
    if (!fs.existsSync(dir)) {
      continue;
    }
    
    const pattern = `${dir}/**/*.{${CONFIG.extensions.join(',')}}`;
    const files = await glob(pattern, { ignore: CONFIG.exclude });
    
    totalFiles += files.length;
    
    for (const file of files) {
      const violations = scanFile(file, rootDir);
      allViolations.push(...violations);
    }
  }
  
  console.log(`  Scanned: ${totalFiles} files`);
  console.log(`  Violations: ${allViolations.length}\n`);
  
  if (allViolations.length > 0) {
    // Group by file
    const byFile = {};
    for (const v of allViolations) {
      if (!byFile[v.file]) byFile[v.file] = [];
      byFile[v.file].push(v);
    }
    
    console.log('❌ Console statements found:\n');
    
    for (const [file, violations] of Object.entries(byFile)) {
      console.log(`📁 ${file}`);
      for (const v of violations) {
        console.log(`   L${v.line}: ${v.statement}`);
        console.log(`        ${v.code}`);
      }
      console.log('');
    }
    
    console.log('─'.repeat(50));
    console.log(`\n⚠️  Remove ${allViolations.length} console statements before merge.`);
    console.log('   Use proper logging or remove debug statements.\n');
    
    if (CONFIG.failOnViolation) {
      process.exit(1);
    }
  } else {
    console.log('✅ No console statements in production code!\n');
  }
}

runGate().catch(console.error);
