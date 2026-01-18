#!/usr/bin/env node

/**
 * Codemod to update all t() calls with standardized keys
 * 
 * This script:
 * 1. Scans all .ts/.tsx files in apps/
 * 2. Finds all t('key') calls
 * 3. Updates keys based on mapping
 * 3. Writes changes back to files
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { mapKey, getMappingStats } from './key-mapping.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPS_DIR = path.resolve(__dirname, '../../../apps');

// Options
const options = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  stats: process.argv.includes('--stats'),
};

// Track changes
let stats = {
  filesProcessed: 0,
  filesChanged: 0,
  keysUpdated: 0,
  keysTotal: 0,
  errors: 0,
};

// Process a single file
function processFile(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let hasChanges = false;
    let updatedContent = content;
    
    // Find all t('key') or t("key") patterns
    const regex = /\bt\(\s*['"]([^'"]+)['"]/g;
    const matches = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        oldKey: match[1],
        fullMatch: match[0],
      });
    }
    
    // Process matches in reverse order to not mess up indices
    for (let i = matches.length - 1; i >= 0; i--) {
      const { start, end, oldKey, fullMatch } = matches[i];
      const newKey = mapKey(oldKey);
      
      if (newKey !== oldKey) {
        const newMatch = fullMatch.replace(oldKey, newKey);
        updatedContent = updatedContent.substring(0, start) + newMatch + updatedContent.substring(end);
        hasChanges = true;
        stats.keysUpdated++;
        
        if (options.verbose) {
          console.log(`  ${oldKey} → ${newKey}`);
        }
      }
      
      stats.keysTotal++;
    }
    
    // Write file if changed
    if (hasChanges && !options.dryRun) {
      fs.writeFileSync(filePath, updatedContent, 'utf-8');
    }
    
    return hasChanges;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    stats.errors++;
    return false;
  }
}

// Recursively scan directory
function scanDirectory(dir: string): string[] {
  const files: string[] = [];
  
  function walk(currentDir: string) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('dist')) {
        walk(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Main function
async function main() {
  console.log('🔧 Translation Key Standardization Codemod');
  console.log('==========================================\n');
  
  if (options.dryRun) {
    console.log('🏃 DRY RUN MODE - No files will be modified\n');
  }
  
  // Get all files
  const appDirs = fs.readdirSync(APPS_DIR).filter(d => {
    const stat = fs.statSync(path.join(APPS_DIR, d));
    return stat.isDirectory() && !d.startsWith('.');
  });
  
  const allFiles: string[] = [];
  
  for (const app of appDirs) {
    const appPath = path.join(APPS_DIR, app, 'src');
    if (fs.existsSync(appPath)) {
      const files = scanDirectory(appPath);
      allFiles.push(...files);
      console.log(`📁 Found ${files.length} files in ${app}`);
    }
  }
  
  console.log(`\n📊 Total files to process: ${allFiles.length}\n`);
  
  // Process files
  for (const file of allFiles) {
    stats.filesProcessed++;
    const changed = processFile(file);
    if (changed) {
      stats.filesChanged++;
      if (options.verbose) {
        console.log(`✅ Updated: ${file}`);
      }
    }
  }
  
  // Print statistics
  console.log('\n📈 Statistics:');
  console.log(`  Files processed: ${stats.filesProcessed}`);
  console.log(`  Files changed: ${stats.filesChanged}`);
  console.log(`  Keys updated: ${stats.keysUpdated} / ${stats.keysTotal}`);
  console.log(`  Errors: ${stats.errors}`);
  
  if (options.stats) {
    console.log('\n📋 Key mapping breakdown:');
    
    // Get all keys for stats
    const allKeys = new Set<string>();
    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const regex = /\bt\(\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
          allKeys.add(match[1]);
        }
      } catch (e) {
        // Skip errors
      }
    }
    
    const mappingStats = getMappingStats(Array.from(allKeys));
    console.log(`  Total unique keys: ${mappingStats.total}`);
    console.log(`  Mapped to standard: ${mappingStats.mapped} (${Math.round(mappingStats.mapped / mappingStats.total * 100)}%)`);
    console.log(`  Preserved (unique): ${mappingStats.preserved} (${Math.round(mappingStats.preserved / mappingStats.total * 100)}%)`);
    console.log(`  Unmapped (need review): ${mappingStats.unmapped} (${Math.round(mappingStats.unmapped / mappingStats.total * 100)}%)`);
    
    if (Object.keys(mappingStats.categories).length > 0) {
      console.log('\n📂 By category:');
      for (const [category, count] of Object.entries(mappingStats.categories)) {
        console.log(`  ${category}: ${count}`);
      }
    }
  }
  
  if (options.dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Codemod complete!');
    console.log('\nNext steps:');
    console.log('  1. Review changes with git diff');
    console.log('  2. Update locale files with new keys');
    console.log('  3. Regenerate translation seed');
    console.log('  4. Test the applications');
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught error:', error);
  process.exit(1);
});

// Run main
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
