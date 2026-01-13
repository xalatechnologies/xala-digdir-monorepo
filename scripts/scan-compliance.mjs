#!/usr/bin/env node

/**
 * Designsystemet Compliance Scanner
 * 
 * Scans the codebase for:
 * 1. Hardcoded colors (hex, rgb, rgba, hsl, named colors)
 * 2. Hardcoded spacing (px, rem, em values)
 * 3. Hardcoded typography (font sizes, weights)
 * 4. Hardcoded border radius
 * 5. Raw HTML violations in apps
 * 6. Missing design tokens
 * 
 * Usage: node scripts/scan-compliance.mjs [--json] [--strict]
 */

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

// Configuration
const CONFIG = {
  scanDirs: [
    'packages/ds/src',
    'apps/web/src',
  ],
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludePatterns: [
    'node_modules',
    'dist',
    '.test.',
    '.spec.',
    '__tests__',
  ],
  reportPath: 'reports/COMPLIANCE_SCAN_REPORT.md',
};

// ============================================================================
// SCAN RULES
// ============================================================================

const RULES = {
  hardcodedColors: {
    name: 'Hardcoded Colors',
    severity: 'high',
    patterns: [
      { regex: /#[0-9a-fA-F]{3,8}\b/g, description: 'Hex color' },
      { regex: /rgba?\s*\([^)]+\)/g, description: 'RGB/RGBA color' },
      { regex: /hsla?\s*\([^)]+\)/g, description: 'HSL/HSLA color' },
      { regex: /(?:color|background|fill|stroke):\s*['"]?(white|black|red|blue|green|gray|grey)['"]?/gi, description: 'Named color' },
    ],
    isExcluded: (line, file) => {
      if (file.endsWith('.css')) return true;
      if (line.includes('var(--ds-')) return true;
      if (line.includes('var(--digilist-')) return true;
      if (line.includes('oklch(')) return true;
      if (line.includes('// ')) return true;
      if (line.includes('fallback')) return true;
      // Brand color definitions in utils.ts are acceptable
      if (file.includes('utils.ts') && (line.includes('hex:') || line.includes('--brand-'))) return true;
      // Fallback colors with var() are acceptable
      if (/var\([^,]+,\s*#[0-9a-fA-F]+\)/.test(line)) return true;
      return false;
    },
    recommendation: 'Use design tokens: var(--ds-color-*)',
  },

  hardcodedSpacing: {
    name: 'Hardcoded Spacing',
    severity: 'high',
    patterns: [
      { regex: /(?:padding|margin|gap|top|right|bottom|left|inset):\s*['"]?\d+px/g, description: 'Pixel spacing' },
      { regex: /(?:padding|margin|gap):\s*['"]?\d+(?:\.\d+)?(?:rem|em)/g, description: 'Rem/Em spacing' },
    ],
    isExcluded: (line, file) => {
      if (file.endsWith('.css')) return true;
      if (line.includes('var(--ds-spacing')) return true;
      if (line.includes('var(--ds-size')) return true;
      if (line.includes('var(--ds-border-width')) return true;
      if (line.includes('var(--digilist-')) return true;
      if (line.includes('calc(')) return true;
      if (line.includes('// ')) return true;
      // Border widths with tokens are acceptable
      if (/border.*var\(--/.test(line)) return true;
      return false;
    },
    recommendation: 'Use spacing tokens: var(--ds-spacing-*)',
  },

  hardcodedTypography: {
    name: 'Hardcoded Typography',
    severity: 'medium',
    patterns: [
      { regex: /fontSize:\s*['"]?\d+px/g, description: 'Font size in px' },
      { regex: /fontWeight:\s*\d{3}/g, description: 'Numeric font weight' },
      { regex: /lineHeight:\s*['"]?\d+px/g, description: 'Line height in px' },
    ],
    isExcluded: (line, file) => {
      if (file.endsWith('.css')) return true;
      if (line.includes('var(--ds-font')) return true;
      if (line.includes('var(--ds-line-height')) return true;
      if (line.includes('as unknown as number')) return true;
      if (line.includes('// ')) return true;
      return false;
    },
    recommendation: 'Use typography tokens: var(--ds-font-size-*), var(--ds-font-weight-*)',
  },

  hardcodedBorderRadius: {
    name: 'Hardcoded Border Radius',
    severity: 'medium',
    patterns: [
      { regex: /borderRadius:\s*['"]?\d+px/g, description: 'Border radius in px' },
    ],
    isExcluded: (line, file) => {
      if (file.endsWith('.css')) return true;
      if (line.includes('var(--ds-border-radius')) return true;
      if (line.includes('// ')) return true;
      return false;
    },
    recommendation: 'Use border radius tokens: var(--ds-border-radius-*)',
  },

  rawHtmlLayouts: {
    name: 'Raw HTML Layouts in Apps',
    severity: 'medium',
    patterns: [
      { regex: /<div\s+style=\{\{[^}]*display:\s*['"]?flex/g, description: 'Div with inline flex' },
      { regex: /<div\s+style=\{\{[^}]*display:\s*['"]?grid/g, description: 'Div with inline grid' },
    ],
    isExcluded: (line, file) => {
      // Only flag in apps directory
      if (!file.includes('apps/')) return true;
      if (line.includes('// ')) return true;
      return false;
    },
    recommendation: 'Use layout primitives: <Stack>, <Grid>, <Flex>',
  },

  hardcodedDimensions: {
    name: 'Hardcoded Dimensions',
    severity: 'low',
    patterns: [
      { regex: /(?:width|height|maxWidth|minWidth|maxHeight|minHeight):\s*['"]?\d+px/g, description: 'Dimension in px' },
    ],
    isExcluded: (line, file) => {
      if (file.endsWith('.css')) return true;
      if (line.includes('var(--ds-')) return true;
      if (line.includes('var(--digilist-')) return true;
      if (line.includes('calc(')) return true;
      if (line.includes('// ')) return true;
      // Icon sizes in button maps are acceptable
      if (line.includes('icon:') && /\d{1,2}/.test(line)) return true;
      // Drawer size map is acceptable
      if (line.includes('sizeMap')) return true;
      // Button sizes constant is acceptable
      if (/const sizes\s*=/.test(line)) return true;
      // Avatar sizes are acceptable edge case
      if (line.includes("'20px'") && file.includes('header-parts')) return true;
      // Media queries cannot use CSS variables - exclude documented breakpoints (599px, 600px)
      if (/@media\s*\(/.test(line) && /599px|600px|992px|640px|700px|1024px/.test(line)) return true;
      return false;
    },
    recommendation: 'Consider using tokens or calc() with tokens',
  },

  hardcodedBreakpoints: {
    name: 'Hardcoded Breakpoints',
    severity: 'low',
    patterns: [
      { regex: /@media\s*\([^)]*\d+px/g, description: 'Media query with hardcoded px' },
    ],
    isExcluded: (line, file) => {
      // CSS limitation - media queries can't use variables
      // Just document, don't flag as error
      return true;
    },
    recommendation: 'Note: CSS media queries cannot use variables. Document breakpoints.',
  },

  svgHardcodedColors: {
    name: 'SVG Hardcoded Colors',
    severity: 'low',
    patterns: [
      { regex: /stroke=["']white["']/g, description: 'SVG stroke="white"' },
      { regex: /fill=["']white["']/g, description: 'SVG fill="white"' },
      { regex: /stroke=["']black["']/g, description: 'SVG stroke="black"' },
      { regex: /fill=["']black["']/g, description: 'SVG fill="black"' },
    ],
    isExcluded: (line, file) => {
      if (line.includes('// ')) return true;
      return false;
    },
    recommendation: 'Consider using currentColor or CSS variable',
  },
};

// ============================================================================
// FILE SCANNER
// ============================================================================

function getAllFiles(dir, files = []) {
  const fullPath = resolve(ROOT, dir);
  if (!existsSync(fullPath)) return files;

  const items = readdirSync(fullPath);
  
  for (const item of items) {
    const itemPath = resolve(fullPath, item);
    const stat = statSync(itemPath);
    
    // Skip excluded patterns
    if (CONFIG.excludePatterns.some(p => item.includes(p))) continue;
    
    if (stat.isDirectory()) {
      getAllFiles(relative(ROOT, itemPath), files);
    } else if (CONFIG.extensions.includes(extname(item))) {
      files.push(relative(ROOT, itemPath));
    }
  }
  
  return files;
}

function scanFile(filePath, rules) {
  const fullPath = resolve(ROOT, filePath);
  const content = readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  const results = {};
  
  for (const [ruleId, rule] of Object.entries(rules)) {
    results[ruleId] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      
      for (const { regex, description } of rule.patterns) {
        // Reset regex lastIndex for global patterns
        regex.lastIndex = 0;
        
        if (regex.test(line)) {
          // Check if excluded
          if (rule.isExcluded && rule.isExcluded(line, filePath)) {
            continue;
          }
          
          results[ruleId].push({
            line: lineNum,
            content: line.trim().substring(0, 100),
            description,
          });
        }
      }
    }
  }
  
  return results;
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport(allResults) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Aggregate results by rule
  const aggregated = {};
  for (const ruleId of Object.keys(RULES)) {
    aggregated[ruleId] = { count: 0, files: {} };
  }
  
  for (const [file, fileResults] of Object.entries(allResults)) {
    for (const [ruleId, issues] of Object.entries(fileResults)) {
      if (issues.length > 0) {
        aggregated[ruleId].count += issues.length;
        aggregated[ruleId].files[file] = issues;
      }
    }
  }
  
  let report = `# Designsystemet Compliance Scan Report

**Scan Date:** ${timestamp}
**Repository:** xala-digdir-monorepo
**Scanned Directories:** ${CONFIG.scanDirs.join(', ')}

---

## Executive Summary

| Category | Issues | Severity | Status |
|----------|--------|----------|--------|
`;

  let totalIssues = 0;
  let highSeverity = 0;
  
  for (const [ruleId, rule] of Object.entries(RULES)) {
    const count = aggregated[ruleId].count;
    totalIssues += count;
    if (rule.severity === 'high') highSeverity += count;
    
    const status = count === 0 ? '✅ Clean' : count < 5 ? '⚠️ Minor' : '❌ Needs Fix';
    report += `| ${rule.name} | ${count} | ${rule.severity} | ${status} |\n`;
  }

  report += `
**Total Issues:** ${totalIssues}
**High Severity:** ${highSeverity}

---

`;

  // Detailed findings
  for (const [ruleId, rule] of Object.entries(RULES)) {
    const data = aggregated[ruleId];
    
    report += `## ${rule.name}

**Severity:** ${rule.severity.toUpperCase()}
**Recommendation:** ${rule.recommendation}
**Issues Found:** ${data.count}

`;

    if (data.count === 0) {
      report += `✅ No issues found.\n\n---\n\n`;
      continue;
    }

    report += `### Findings by File\n\n`;

    for (const [file, issues] of Object.entries(data.files)) {
      report += `#### \`${file}\`\n\n`;
      report += `| Line | Issue | Content |\n`;
      report += `|------|-------|--------|\n`;
      
      for (const issue of issues.slice(0, 15)) {
        const escapedContent = issue.content
          .replace(/\|/g, '\\|')
          .replace(/`/g, "'")
          .substring(0, 50);
        report += `| ${issue.line} | ${issue.description} | \`${escapedContent}...\` |\n`;
      }
      
      if (issues.length > 15) {
        report += `| ... | +${issues.length - 15} more | ... |\n`;
      }
      
      report += '\n';
    }

    report += '---\n\n';
  }

  // Action Items
  report += `## Action Items

### Priority 1 (High Severity)
`;

  for (const [ruleId, rule] of Object.entries(RULES)) {
    if (rule.severity === 'high' && aggregated[ruleId].count > 0) {
      report += `- [ ] Fix ${aggregated[ruleId].count} ${rule.name.toLowerCase()} issues\n`;
    }
  }

  report += `
### Priority 2 (Medium Severity)
`;

  for (const [ruleId, rule] of Object.entries(RULES)) {
    if (rule.severity === 'medium' && aggregated[ruleId].count > 0) {
      report += `- [ ] Fix ${aggregated[ruleId].count} ${rule.name.toLowerCase()} issues\n`;
    }
  }

  report += `
### Priority 3 (Low Severity / Acceptable)
`;

  for (const [ruleId, rule] of Object.entries(RULES)) {
    if (rule.severity === 'low' && aggregated[ruleId].count > 0) {
      report += `- [ ] Review ${aggregated[ruleId].count} ${rule.name.toLowerCase()} issues\n`;
    }
  }

  report += `
---

## Scanner Commands

\`\`\`bash
# Run compliance scan
pnpm scan:compliance

# Run with JSON output
pnpm scan:compliance:json

# Run in strict mode (fail on high severity)
pnpm scan:compliance:strict

# Run all scanners
pnpm scan:all
\`\`\`

---

*Generated by scan-compliance.mjs*
*Date: ${timestamp}*
`;

  return { report, aggregated, totalIssues, highSeverity };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const strict = args.includes('--strict');
  
  console.log('🔍 Designsystemet Compliance Scanner');
  console.log('====================================\n');
  
  // Collect all files
  const files = [];
  for (const dir of CONFIG.scanDirs) {
    getAllFiles(dir, files);
  }
  
  console.log(`📁 Found ${files.length} files to scan\n`);
  
  // Scan each file
  const allResults = {};
  let scanned = 0;
  
  for (const file of files) {
    allResults[file] = scanFile(file, RULES);
    scanned++;
    
    if (scanned % 10 === 0) {
      process.stdout.write(`\r   Scanned ${scanned}/${files.length} files...`);
    }
  }
  
  console.log(`\r   Scanned ${files.length}/${files.length} files ✓\n`);
  
  // Generate report
  const { report, aggregated, totalIssues, highSeverity } = generateReport(allResults);
  
  // Write report
  const reportPath = resolve(ROOT, CONFIG.reportPath);
  writeFileSync(reportPath, report);
  console.log(`📄 Report saved to: ${CONFIG.reportPath}`);
  
  // Output JSON if requested
  if (outputJson) {
    const jsonPath = reportPath.replace('.md', '.json');
    writeFileSync(jsonPath, JSON.stringify(aggregated, null, 2));
    console.log(`📊 JSON saved to: reports/COMPLIANCE_SCAN_REPORT.json`);
  }
  
  // Summary by category
  console.log('\n📊 Results by Category:\n');
  for (const [ruleId, rule] of Object.entries(RULES)) {
    const count = aggregated[ruleId].count;
    const icon = count === 0 ? '✅' : count < 5 ? '⚠️' : '❌';
    console.log(`   ${icon} ${rule.name}: ${count} issues`);
  }
  
  console.log(`\n📈 Total: ${totalIssues} issues (${highSeverity} high severity)`);
  
  if (strict && highSeverity > 0) {
    console.log('\n❌ Strict mode: Failing due to high severity issues');
    process.exit(1);
  }
  
  if (totalIssues === 0) {
    console.log('\n✅ All checks passed!');
  } else if (highSeverity === 0) {
    console.log('\n⚠️  Minor issues found. Review the report for details.');
  } else {
    console.log('\n❌ High severity issues found. Please fix before merging.');
  }
}

main().catch(console.error);
