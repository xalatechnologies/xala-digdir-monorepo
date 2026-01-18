#!/usr/bin/env node

/**
 * Automated Hard-coded String Converter
 * 
 * This script:
 * 1. Reads the conversion guide
 * 2. Automatically converts hard-coded strings to translation keys
 * 3. Adds useT() hook imports where needed
 * 4. Updates component files
 * 
 * Usage:
 *   node infra/scripts/convert-hardcoded-strings.js [--dry-run] [--file path/to/file.tsx]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '../..');
const conversionGuideFile = path.join(rootDir, 'i18n-conversion-guide.json');

// Parse arguments
const args = process.argv.slice(2);
let dryRun = args.includes('--dry-run');
let targetFile = null;

const fileIndex = args.indexOf('--file');
if (fileIndex !== -1 && args[fileIndex + 1]) {
  targetFile = args[fileIndex + 1];
}

console.log('🔄 Hard-coded String Converter');
console.log('==============================\n');

if (dryRun) {
  console.log('⚠️  DRY RUN MODE - No files will be modified\n');
}

// Load conversion guide
if (!fs.existsSync(conversionGuideFile)) {
  console.error('❌ Conversion guide not found. Run generate-translation-seeds.js first.');
  process.exit(1);
}

const conversionGuide = JSON.parse(fs.readFileSync(conversionGuideFile, 'utf8'));
console.log(`📖 Loaded conversion guide with ${conversionGuide.conversions.length} keys\n`);

// Helper: Check if file already imports useT
function hasUseTImport(content) {
  return /import\s+\{[^}]*\buse(Lazy)?T\b[^}]*\}\s+from\s+['"]@xala\/i18n['"]/.test(content);
}

// Helper: Add useT import to file
function addUseTImport(content) {
  // Check if there's already an i18n import
  const i18nImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@xala\/i18n['"]/);
  
  if (i18nImportMatch) {
    // Add useT to existing import
    const imports = i18nImportMatch[1];
    if (!imports.includes('useT')) {
      const newImports = imports.trim() + ', useT';
      return content.replace(
        /import\s+\{[^}]+\}\s+from\s+['"]@xala\/i18n['"]/,
        `import { ${newImports} } from '@xala/i18n'`
      );
    }
    return content;
  }
  
  // Add new import after other imports
  const lastImportMatch = content.match(/import\s+.*?;[\r\n]+(?!import)/);
  if (lastImportMatch) {
    const insertPos = lastImportMatch.index + lastImportMatch[0].length;
    return content.slice(0, insertPos) + 
           "import { useT } from '@xala/i18n';\n" +
           content.slice(insertPos);
  }
  
  // No imports found, add at the beginning
  return "import { useT } from '@xala/i18n';\n\n" + content;
}

// Helper: Check if component already has const t = useT()
function hasUseTDeclaration(content) {
  return /const\s+t\s*=\s*use(Lazy)?T\(\)/.test(content);
}

// Helper: Add const t = useT() to component
function addUseTDeclaration(content) {
  // Find the component function
  const componentMatch = content.match(/(export\s+(?:default\s+)?function\s+\w+[^{]*\{)/);
  
  if (componentMatch) {
    const insertPos = componentMatch.index + componentMatch[0].length;
    return content.slice(0, insertPos) +
           '\n  const t = useT();\n' +
           content.slice(insertPos);
  }
  
  // Try arrow function component
  const arrowMatch = content.match(/(export\s+const\s+\w+\s*[:=]\s*\([^)]*\)\s*=>\s*\{)/);
  
  if (arrowMatch) {
    const insertPos = arrowMatch.index + arrowMatch[0].length;
    return content.slice(0, insertPos) +
           '\n  const t = useT();\n' +
           content.slice(insertPos);
  }
  
  return content;
}

// Helper: Escape regex special characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper: Convert hard-coded string to translation call
function convertString(content, hardcodedText, translationKey, type) {
  const escapedText = escapeRegex(hardcodedText);
  
  switch (type) {
    case 'jsx-text':
      // Match: >Hard-coded text<
      const jsxPattern = new RegExp(`>\\s*${escapedText}\\s*<`, 'g');
      return content.replace(jsxPattern, `>{t('${translationKey}')}<`);
      
    case 'placeholder':
      // Match: placeholder="Hard-coded text"
      const placeholderPattern = new RegExp(`placeholder=["']${escapedText}["']`, 'g');
      return content.replace(placeholderPattern, `placeholder={t('${translationKey}')}`);
      
    case 'title':
      // Match: title="Hard-coded text"
      const titlePattern = new RegExp(`title=["']${escapedText}["']`, 'g');
      return content.replace(titlePattern, `title={t('${translationKey}')}`);
      
    case 'aria-label':
      // Match: aria-label="Hard-coded text"
      const ariaPattern = new RegExp(`aria-label=["']${escapedText}["']`, 'g');
      return content.replace(ariaPattern, `aria-label={t('${translationKey}')}`);
      
    default:
      return content;
  }
}

// Process a single file
function processFile(filePath) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return { success: false, conversions: 0 };
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let conversions = 0;
  
  // Find all conversions for this file
  const fileConversions = conversionGuide.conversions.filter(c => 
    c.files.includes(filePath)
  );
  
  if (fileConversions.length === 0) {
    return { success: true, conversions: 0 };
  }
  
  // Add useT import if needed
  if (!hasUseTImport(content)) {
    content = addUseTImport(content);
  }
  
  // Add const t = useT() if needed
  if (!hasUseTDeclaration(content)) {
    content = addUseTDeclaration(content);
  }
  
  // Convert each hard-coded string
  for (const conversion of fileConversions) {
    const example = conversion.examples.find(e => e.file === filePath);
    if (example) {
      const newContent = convertString(
        content,
        conversion.norwegianText,
        conversion.key,
        example.type
      );
      
      if (newContent !== content) {
        content = newContent;
        conversions++;
      }
    }
  }
  
  // Write file if changes were made
  if (content !== originalContent) {
    if (!dryRun) {
      fs.writeFileSync(fullPath, content, 'utf8');
    }
    return { success: true, conversions };
  }
  
  return { success: true, conversions: 0 };
}

// Main execution
console.log('🔍 Processing files...\n');

const stats = {
  filesProcessed: 0,
  filesModified: 0,
  totalConversions: 0,
  errors: 0
};

// Get unique files from conversion guide
const filesToProcess = targetFile 
  ? [targetFile]
  : [...new Set(conversionGuide.conversions.flatMap(c => c.files))];

console.log(`📁 Found ${filesToProcess.length} files to process\n`);

for (const file of filesToProcess) {
  try {
    const result = processFile(file);
    stats.filesProcessed++;
    
    if (result.conversions > 0) {
      stats.filesModified++;
      stats.totalConversions += result.conversions;
      console.log(`  ✅ ${file} - ${result.conversions} conversions`);
    } else {
      console.log(`  ⏭️  ${file} - no changes`);
    }
  } catch (error) {
    stats.errors++;
    console.error(`  ❌ ${file} - Error: ${error.message}`);
  }
}

console.log('\n📊 Summary');
console.log('==========');
console.log(`Files processed: ${stats.filesProcessed}`);
console.log(`Files modified: ${stats.filesModified}`);
console.log(`Total conversions: ${stats.totalConversions}`);
console.log(`Errors: ${stats.errors}`);

if (dryRun) {
  console.log('\n⚠️  DRY RUN - No files were actually modified');
  console.log('Run without --dry-run to apply changes');
}

console.log('\n✅ Conversion complete!');

if (stats.filesModified > 0 && !dryRun) {
  console.log('\n🔄 Next Steps:');
  console.log('  1. Review the changes');
  console.log('  2. Run: pnpm -F @xala/i18n build');
  console.log('  3. Test the affected components');
  console.log('  4. Run: node infra/scripts/scan-i18n-inventory.js --format markdown');
}
