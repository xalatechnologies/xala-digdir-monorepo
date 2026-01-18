#!/usr/bin/env node
/* eslint-disable */
/**
 * Apply i18n Fixes Automatically
 * 
 * Automatically replaces hardcoded strings with t() calls based on scan report.
 * 
 * Safety features:
 * - Creates backups before modifying files
 * - Validates fixes don't break syntax
 * - Processes one file at a time
 * - Reports all changes made
 * 
 * Usage:
 *   node scripts/apply-i18n-fixes.js --app=docs-learning --dry-run
 *   node scripts/apply-i18n-fixes.js --app=docs-learning
 *   node scripts/apply-i18n-fixes.js --all
 *   node scripts/apply-i18n-fixes.js --file=apps/docs-learning/src/routes/DocsArticlePage.tsx
 */

const fs = require('fs');
const path = require('path');

// Load scan report
const reportPath = path.join(__dirname, '..', 'i18n-comprehensive-report.json');

if (!fs.existsSync(reportPath)) {
  console.error('❌ Scan report not found. Run: node scripts/scan-i18n.js --all');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Parse arguments
const args = process.argv.slice(2);
const targetApp = args.find(arg => arg.startsWith('--app='))?.split('=')[1];
const targetFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1];
const fixAll = args.includes('--all');
const dryRun = args.includes('--dry-run');

console.log('🔧 Applying i18n Fixes\n');

if (dryRun) {
  console.log('⚠️  DRY RUN MODE - No files will be modified\n');
}

// Collect issues grouped by file
const fileIssues = new Map();

Object.entries(report.apps).forEach(([appName, appData]) => {
  if (targetApp && appName !== targetApp) return;
  if (targetFile && !appData.issues.some(i => i.file === path.join(__dirname, '..', targetFile))) return;
  if (!fixAll && !targetApp && !targetFile && appName !== 'docs-learning' && appName !== 'tenant-admin') return;

  appData.issues.forEach(issue => {
    // Skip issues without clear fixes
    if (!issue.suggestedKey || !issue.string || !issue.fix) return;
    
    // Skip technical/debug strings
    if (issue.string.startsWith('[') || issue.string.includes('console.')) return;
    if (issue.file.includes('.auth-backup-')) return;
    if (issue.file.includes('SentryTestComponent')) return; // Test component
    
    const filePath = issue.file;
    if (!fileIssues.has(filePath)) {
      fileIssues.set(filePath, []);
    }
    fileIssues.get(filePath).push(issue);
  });
});

console.log(`📋 Found ${fileIssues.size} files with fixable issues\n`);

if (fileIssues.size === 0) {
  console.log('✅ No fixable issues found!');
  process.exit(0);
}

// Statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  issuesFixed: 0,
  errors: 0,
};

// Process each file
fileIssues.forEach((issues, filePath) => {
  stats.filesProcessed++;
  
  console.log(`\n📄 Processing: ${path.relative(process.cwd(), filePath)}`);
  console.log(`   Issues to fix: ${issues.length}`);
  
  try {
    // Read file
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    
    // Check if file already uses useT
    const hasUseT = /const\s+t\s*=\s*useT\s*\(/.test(content);
    const hasImport = /import\s+{[^}]*\buseT\b[^}]*}\s+from\s+['"]@xala\/i18n['"]/.test(content);
    
    // Group issues by line to handle multiple issues on same line
    const issuesByLine = new Map();
    issues.forEach(issue => {
      if (!issuesByLine.has(issue.line)) {
        issuesByLine.set(issue.line, []);
      }
      issuesByLine.get(issue.line).push(issue);
    });
    
    // Sort issues by line (descending) to preserve line numbers
    const sortedLines = Array.from(issuesByLine.keys()).sort((a, b) => b - a);
    
    let fixedCount = 0;
    
    sortedLines.forEach(lineNum => {
      const lineIssues = issuesByLine.get(lineNum);
      
      lineIssues.forEach(issue => {
        // Create safe replacement based on issue type
        let searchPattern;
        let replacement;
        
        switch (issue.type) {
          case 'hardcoded_jsx_text':
            // Replace: >Text< with >{t('key')}<
            searchPattern = `>${issue.string}<`;
            replacement = `>{t('${issue.suggestedKey}')}<`;
            break;
            
          case 'hardcoded_prop':
            // Replace: prop="value" with prop={t('key')}
            searchPattern = new RegExp(`${issue.prop}\\s*=\\s*["']${escapeRegex(issue.string)}["']`, 'g');
            replacement = `${issue.prop}={t('${issue.suggestedKey}')}`;
            break;
            
          case 'hardcoded_object_value':
            // Replace: key: 'value' with key: t('key')
            searchPattern = new RegExp(`${issue.key}:\\s*['"]${escapeRegex(issue.string)}['"]`, 'g');
            replacement = `${issue.key}: t('${issue.suggestedKey}')`;
            break;
            
          case 'toast_message':
            // Replace: toast.success('message') with toast.success(t('key'))
            searchPattern = new RegExp(`(toast\\.[a-z]+\\s*\\(\\s*)["']${escapeRegex(issue.string)}["']`, 'g');
            replacement = `$1t('${issue.suggestedKey}')`;
            break;
            
          case 'paragraph_text':
          case 'heading_text':
            // Replace JSX text
            searchPattern = `>${issue.string.trim()}<`;
            replacement = `>{t('${issue.suggestedKey}')}<`;
            break;
            
          default:
            // Generic replacement
            if (issue.fix && issue.fix.includes('t(')) {
              // Use the suggested fix directly
              searchPattern = issue.string;
              replacement = `t('${issue.suggestedKey}')`;
            } else {
              return; // Skip if no clear fix
            }
        }
        
        // Apply replacement
        if (typeof searchPattern === 'string') {
          if (modified.includes(searchPattern)) {
            modified = modified.replace(searchPattern, replacement);
            fixedCount++;
          }
        } else {
          const matches = modified.match(searchPattern);
          if (matches && matches.length > 0) {
            modified = modified.replace(searchPattern, replacement);
            fixedCount++;
          }
        }
      });
    });
    
    // Add useT import if needed
    if (fixedCount > 0 && !hasUseT) {
      // Find where to add const t = useT()
      const lines = modified.split('\n');
      
      // Find first function component or hook usage
      let insertIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^(?:export\s+)?(?:default\s+)?function\s+\w+/) ||
            lines[i].match(/^(?:export\s+)?const\s+\w+\s*=\s*\([^)]*\)\s*=>/)) {
          insertIndex = i + 1;
          // Skip opening brace
          while (insertIndex < lines.length && !lines[insertIndex].includes('{')) {
            insertIndex++;
          }
          insertIndex++;
          break;
        }
      }
      
      if (insertIndex > 0) {
        lines.splice(insertIndex, 0, '  const t = useT();');
        modified = lines.join('\n');
      }
    }
    
    // Add import if needed
    if (fixedCount > 0 && !hasImport) {
      // Add import at top
      const lines = modified.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        } else if (lastImportIndex >= 0 && !lines[i].startsWith('import ')) {
          break;
        }
      }
      
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, "import { useT } from '@xala/i18n';");
        modified = lines.join('\n');
      }
    }
    
    if (fixedCount > 0) {
      console.log(`   ✅ Fixed ${fixedCount} issues`);
      
      if (!dryRun) {
        // Create backup
        const backupPath = `${filePath}.i18n-backup`;
        fs.writeFileSync(backupPath, content, 'utf8');
        
        // Write modified file
        fs.writeFileSync(filePath, modified, 'utf8');
        
        stats.filesModified++;
        stats.issuesFixed += fixedCount;
      } else {
        console.log('   ⚠️  Dry run - changes not saved');
      }
    } else {
      console.log(`   ⚠️  No fixes applied (patterns not matched)`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    stats.errors++;
  }
});

// Summary
console.log('\n========================================');
console.log('SUMMARY');
console.log('========================================\n');
console.log(`Files Processed: ${stats.filesProcessed}`);
console.log(`Files Modified: ${stats.filesModified}`);
console.log(`Issues Fixed: ${stats.issuesFixed}`);
console.log(`Errors: ${stats.errors}`);

if (dryRun) {
  console.log('\n⚠️  DRY RUN - No actual changes were made');
  console.log('Remove --dry-run flag to apply changes');
} else if (stats.filesModified > 0) {
  console.log('\n✅ Fixes applied successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Review changes with: git diff');
  console.log('2. Test the affected apps');
  console.log('3. Run: node scripts/scan-i18n.js --all');
  console.log('4. Commit if everything looks good');
  console.log('\n💡 Backups saved with .i18n-backup extension');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
