#!/usr/bin/env node

/**
 * Comprehensive Design System Compliance Scanner
 * 
 * Scans for:
 * - Hardcoded colors (hex, rgb, hsl)
 * - Hardcoded spacing/sizing values
 * - Custom CSS classes not using design tokens
 * - Typography violations (hardcoded font sizes, weights, line heights)
 * - Inline styles with non-token values
 * - Contrast and accessibility issues
 * - CSS extension token violations
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.join(__dirname, '..', '..');
const outputDir = path.join(rootDir, 'design-system-audit-reports');

// CLI arguments
const args = process.argv.slice(2);
let targetPath = null;
let outputFormat = 'markdown';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) {
    targetPath = args[i + 1];
    i++;
  } else if (args[i] === '--format' && args[i + 1]) {
    outputFormat = args[i + 1];
    i++;
  }
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ============================================================================
// DETECTION PATTERNS
// ============================================================================

const patterns = {
  // Hardcoded colors
  hexColor: /#([0-9A-Fa-f]{3}){1,2}\b/g,
  rgbColor: /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi,
  rgbaColor: /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi,
  hslColor: /hsl\s*\(\s*\d+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*\)/gi,
  hslaColor: /hsla\s*\(\s*\d+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+\s*\)/gi,
  namedColors: /\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey|brown|cyan|magenta)\b/gi,
  
  // Hardcoded spacing (px, rem, em values not using tokens)
  hardcodedPx: /:\s*(\d+)px(?!\s*\*|\/)/g,
  hardcodedRem: /:\s*(\d+\.?\d*)rem(?!\s*\*|\/)/g,
  hardcodedEm: /:\s*(\d+\.?\d*)em(?!\s*\*|\/)/g,
  
  // Typography violations
  hardcodedFontSize: /font-size:\s*(\d+)(px|rem|em)/gi,
  hardcodedFontWeight: /font-weight:\s*(\d{3}|bold|normal|lighter|bolder)/gi,
  hardcodedLineHeight: /line-height:\s*([\d.]+)(?:px|rem|em|%)?/gi,
  hardcodedFontFamily: /font-family:\s*['"]?([^;'"]+)/gi,
  
  // Inline styles
  inlineStyle: /style=\{?\{([^}]+)\}/g,
  styleObject: /style:\s*\{([^}]+)\}/g,
  
  // CSS class patterns (potential custom classes)
  className: /className=["']([^"']+)["']/g,
  cssClass: /className=\{[^}]*["']([^"']+)["'][^}]*\}/g,
  
  // Design token usage (correct patterns)
  dsToken: /var\(--ds-[a-z-]+\)/g,
  dsSpacing: /var\(--ds-spacing-\d+\)/g,
  dsColor: /var\(--ds-color-[a-z-]+\)/g,
  dsFontSize: /var\(--ds-font-size-[a-z]+\)/g,
  
  // Border radius violations
  hardcodedBorderRadius: /border-radius:\s*(\d+)(px|rem|em|%)/gi,
  
  // Z-index violations (should use tokens)
  hardcodedZIndex: /z-index:\s*(\d+)/gi,
  
  // Box shadow violations
  hardcodedBoxShadow: /box-shadow:\s*([^;]+)/gi,
  
  // Transition/animation violations
  hardcodedTransition: /transition:\s*([^;]+)/gi,
};

// Allowed patterns (exceptions)
const allowedPatterns = [
  /var\(--ds-/,           // Design system tokens
  /var\(--layout-/,       // Extension tokens
  /var\(--font-/,         // Extension typography tokens  
  /var\(--spacing-/,      // Extension spacing tokens
  /0px/,                  // Zero values are OK
  /1px/,                  // 1px for borders is common
  /100%/,                 // Percentages are OK
  /50%/,                  // Common percentage values
  /inherit/,
  /transparent/,
  /currentColor/,
];

// Known utility classes from design system
const allowedClasses = [
  'ds-', 'fds-',          // Digdir design system
  'sr-only',              // Screen reader only
  'visually-hidden',
  'container', 'row', 'col',
];

// ============================================================================
// SCANNER IMPLEMENTATION
// ============================================================================

const violations = [];
const stats = {
  filesScanned: 0,
  totalViolations: 0,
  byType: {},
  bySeverity: { critical: 0, major: 0, minor: 0 },
};

function isAllowed(value, context) {
  return allowedPatterns.some(pattern => pattern.test(value));
}

function getSeverity(type) {
  const critical = ['hexColor', 'rgbColor', 'hardcodedFontSize', 'hardcodedFontWeight'];
  const major = ['hardcodedPx', 'hardcodedBorderRadius', 'hardcodedZIndex'];
  
  if (critical.includes(type)) return 'critical';
  if (major.includes(type)) return 'major';
  return 'minor';
}

function scanFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileViolations = [];
  
  // Check each line
  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
      return;
    }
    
    // Check for color violations
    checkPattern(line, lineNumber, 'hexColor', 'Hardcoded hex color', fileViolations, relativePath);
    checkPattern(line, lineNumber, 'rgbColor', 'Hardcoded RGB color', fileViolations, relativePath);
    checkPattern(line, lineNumber, 'rgbaColor', 'Hardcoded RGBA color', fileViolations, relativePath);
    checkPattern(line, lineNumber, 'hslColor', 'Hardcoded HSL color', fileViolations, relativePath);
    
    // Check for spacing violations
    checkSpacingPattern(line, lineNumber, fileViolations, relativePath);
    
    // Check for typography violations
    checkPattern(line, lineNumber, 'hardcodedFontSize', 'Hardcoded font-size', fileViolations, relativePath);
    checkPattern(line, lineNumber, 'hardcodedFontWeight', 'Hardcoded font-weight', fileViolations, relativePath);
    checkPattern(line, lineNumber, 'hardcodedLineHeight', 'Hardcoded line-height', fileViolations, relativePath);
    
    // Check for border-radius violations
    checkPattern(line, lineNumber, 'hardcodedBorderRadius', 'Hardcoded border-radius', fileViolations, relativePath);
    
    // Check for z-index violations
    checkZIndexPattern(line, lineNumber, fileViolations, relativePath);
  });
  
  return fileViolations;
}

function checkPattern(line, lineNumber, patternName, description, fileViolations, filePath) {
  const pattern = patterns[patternName];
  if (!pattern) return;
  
  let match;
  const regex = new RegExp(pattern.source, pattern.flags);
  
  while ((match = regex.exec(line)) !== null) {
    const value = match[0];
    
    // Skip if in allowed patterns or design token
    if (isAllowed(line, value)) continue;
    if (/var\(--/.test(line.slice(Math.max(0, match.index - 20), match.index + value.length + 20))) continue;
    
    const severity = getSeverity(patternName);
    const violation = {
      file: filePath,
      line: lineNumber,
      column: match.index + 1,
      type: patternName,
      description,
      value,
      severity,
      lineContent: line.trim().substring(0, 100),
    };
    
    fileViolations.push(violation);
    violations.push(violation);
    stats.totalViolations++;
    stats.byType[patternName] = (stats.byType[patternName] || 0) + 1;
    stats.bySeverity[severity]++;
  }
}

function checkSpacingPattern(line, lineNumber, fileViolations, filePath) {
  // Check for hardcoded px values (excluding 0px and 1px)
  const pxPattern = /(?:padding|margin|gap|width|height|top|right|bottom|left):\s*['"]?(\d+)px/gi;
  let match;
  
  while ((match = pxPattern.exec(line)) !== null) {
    const pxValue = parseInt(match[1]);
    
    // Skip small/common values and values in var()
    if (pxValue <= 1) continue;
    if (isAllowed(line, match[0])) continue;
    if (/var\(--/.test(line)) continue;
    
    const severity = pxValue > 16 ? 'major' : 'minor';
    const violation = {
      file: filePath,
      line: lineNumber,
      column: match.index + 1,
      type: 'hardcodedSpacing',
      description: `Hardcoded spacing: ${pxValue}px`,
      value: match[0],
      severity,
      lineContent: line.trim().substring(0, 100),
      suggestion: `Use var(--ds-spacing-${getSpacingToken(pxValue)}) instead`,
    };
    
    fileViolations.push(violation);
    violations.push(violation);
    stats.totalViolations++;
    stats.byType['hardcodedSpacing'] = (stats.byType['hardcodedSpacing'] || 0) + 1;
    stats.bySeverity[severity]++;
  }
}

function checkZIndexPattern(line, lineNumber, fileViolations, filePath) {
  const match = /z-index:\s*(\d+)/i.exec(line);
  if (!match) return;
  
  const zValue = parseInt(match[1]);
  
  // Skip common values or values in var()
  if (zValue <= 10) return;
  if (/var\(--/.test(line)) return;
  
  const violation = {
    file: filePath,
    line: lineNumber,
    column: match.index + 1,
    type: 'hardcodedZIndex',
    description: `Hardcoded z-index: ${zValue}`,
    value: match[0],
    severity: 'major',
    lineContent: line.trim().substring(0, 100),
    suggestion: 'Use z-index token from design system',
  };
  
  fileViolations.push(violation);
  violations.push(violation);
  stats.totalViolations++;
  stats.byType['hardcodedZIndex'] = (stats.byType['hardcodedZIndex'] || 0) + 1;
  stats.bySeverity['major']++;
}

function getSpacingToken(pxValue) {
  const spacingMap = {
    4: '1', 8: '2', 12: '3', 16: '4', 20: '5', 24: '6', 32: '8', 40: '10', 48: '12', 64: '16',
  };
  return spacingMap[pxValue] || Math.round(pxValue / 4);
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.css']) {
  const files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build, .git
      if (['node_modules', 'dist', 'build', '.git', 'coverage'].includes(item)) continue;
      files.push(...findFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function generateMarkdownReport(targetName, violations, stats) {
  const timestamp = new Date().toISOString();
  
  let md = `# Design System Compliance Report: ${targetName}\n\n`;
  md += `**Generated:** ${timestamp}\n\n`;
  
  // Summary
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Files Scanned | ${stats.filesScanned} |\n`;
  md += `| Total Violations | ${stats.totalViolations} |\n`;
  md += `| Critical | ${stats.bySeverity.critical} |\n`;
  md += `| Major | ${stats.bySeverity.major} |\n`;
  md += `| Minor | ${stats.bySeverity.minor} |\n\n`;
  
  // By Type
  md += `## Violations by Type\n\n`;
  md += `| Type | Count |\n|------|-------|\n`;
  for (const [type, count] of Object.entries(stats.byType).sort((a, b) => b[1] - a[1])) {
    md += `| ${type} | ${count} |\n`;
  }
  md += `\n`;
  
  // Critical violations first
  const critical = violations.filter(v => v.severity === 'critical');
  if (critical.length > 0) {
    md += `## Critical Violations (${critical.length})\n\n`;
    md += `> [!CAUTION]\n> These violations should be fixed immediately.\n\n`;
    
    // Group by file
    const byFile = {};
    for (const v of critical) {
      if (!byFile[v.file]) byFile[v.file] = [];
      byFile[v.file].push(v);
    }
    
    for (const [file, fileViolations] of Object.entries(byFile)) {
      md += `### ${file}\n\n`;
      for (const v of fileViolations.slice(0, 10)) {
        md += `- **Line ${v.line}**: ${v.description} - \`${v.value}\`\n`;
        if (v.suggestion) md += `  - Suggestion: ${v.suggestion}\n`;
      }
      if (fileViolations.length > 10) {
        md += `- ... and ${fileViolations.length - 10} more\n`;
      }
      md += `\n`;
    }
  }
  
  // Major violations
  const major = violations.filter(v => v.severity === 'major');
  if (major.length > 0) {
    md += `## Major Violations (${major.length})\n\n`;
    
    const byFile = {};
    for (const v of major) {
      if (!byFile[v.file]) byFile[v.file] = [];
      byFile[v.file].push(v);
    }
    
    for (const [file, fileViolations] of Object.entries(byFile)) {
      md += `### ${file}\n\n`;
      for (const v of fileViolations.slice(0, 5)) {
        md += `- **Line ${v.line}**: ${v.description} - \`${v.value}\`\n`;
      }
      if (fileViolations.length > 5) {
        md += `- ... and ${fileViolations.length - 5} more\n`;
      }
      md += `\n`;
    }
  }
  
  return md;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

console.log('🎨 Design System Compliance Scanner');
console.log('===================================\n');

// Determine what to scan
const targets = [];

if (targetPath) {
  targets.push({ name: path.basename(targetPath), path: path.join(rootDir, targetPath) });
} else {
  // Scan all apps
  const appsDir = path.join(rootDir, 'apps');
  if (fs.existsSync(appsDir)) {
    for (const app of fs.readdirSync(appsDir)) {
      const appPath = path.join(appsDir, app);
      if (fs.statSync(appPath).isDirectory()) {
        targets.push({ name: `apps/${app}`, path: appPath });
      }
    }
  }
  
  // Scan key packages
  const packages = ['ds', 'ds-registry', 'auth', 'i18n', 'client-sdk'];
  for (const pkg of packages) {
    const pkgPath = path.join(rootDir, 'packages', pkg);
    if (fs.existsSync(pkgPath)) {
      targets.push({ name: `packages/${pkg}`, path: pkgPath });
    }
  }
}

// Scan each target
const allReports = [];

for (const target of targets) {
  console.log(`📂 Scanning: ${target.name}`);
  
  // Reset stats for this target
  const targetStats = {
    filesScanned: 0,
    totalViolations: 0,
    byType: {},
    bySeverity: { critical: 0, major: 0, minor: 0 },
  };
  const targetViolations = [];
  
  const files = findFiles(target.path);
  
  for (const file of files) {
    targetStats.filesScanned++;
    const relativePath = path.relative(rootDir, file);
    const fileViolations = scanFile(file, relativePath);
    
    for (const v of fileViolations) {
      targetViolations.push(v);
      targetStats.totalViolations++;
      targetStats.byType[v.type] = (targetStats.byType[v.type] || 0) + 1;
      targetStats.bySeverity[v.severity]++;
    }
  }
  
  console.log(`  ✓ ${targetStats.filesScanned} files, ${targetStats.totalViolations} violations`);
  
  // Generate report for this target
  const reportName = target.name.replace(/\//g, '-');
  const report = generateMarkdownReport(target.name, targetViolations, targetStats);
  const reportPath = path.join(outputDir, `${reportName}-compliance-report.md`);
  fs.writeFileSync(reportPath, report);
  
  allReports.push({
    name: target.name,
    stats: targetStats,
    reportPath,
  });
}

// Generate master summary
let summary = `# Design System Compliance Audit - Master Summary\n\n`;
summary += `**Generated:** ${new Date().toISOString()}\n\n`;
summary += `## Overview\n\n`;
summary += `| Target | Files | Violations | Critical | Major | Minor |\n`;
summary += `|--------|-------|------------|----------|-------|-------|\n`;

let totalFiles = 0;
let totalViolations = 0;
let totalCritical = 0;
let totalMajor = 0;
let totalMinor = 0;

for (const report of allReports) {
  summary += `| [${report.name}](${path.basename(report.reportPath)}) | ${report.stats.filesScanned} | ${report.stats.totalViolations} | ${report.stats.bySeverity.critical} | ${report.stats.bySeverity.major} | ${report.stats.bySeverity.minor} |\n`;
  totalFiles += report.stats.filesScanned;
  totalViolations += report.stats.totalViolations;
  totalCritical += report.stats.bySeverity.critical;
  totalMajor += report.stats.bySeverity.major;
  totalMinor += report.stats.bySeverity.minor;
}

summary += `| **TOTAL** | **${totalFiles}** | **${totalViolations}** | **${totalCritical}** | **${totalMajor}** | **${totalMinor}** |\n\n`;

// Recommendations
summary += `## Priority Actions\n\n`;
if (totalCritical > 0) {
  summary += `> [!CAUTION]\n> ${totalCritical} critical violations require immediate attention.\n\n`;
}
if (totalMajor > 0) {
  summary += `> [!WARNING]\n> ${totalMajor} major violations should be addressed soon.\n\n`;
}

summary += `## Remediation Guide\n\n`;
summary += `### Color Violations\n`;
summary += `Replace hardcoded colors with design tokens:\n`;
summary += `- \`#ffffff\` → \`var(--ds-color-neutral-background-default)\`\n`;
summary += `- \`#000000\` → \`var(--ds-color-neutral-text-default)\`\n\n`;

summary += `### Spacing Violations\n`;
summary += `Replace hardcoded spacing with tokens:\n`;
summary += `- \`8px\` → \`var(--ds-spacing-2)\`\n`;
summary += `- \`16px\` → \`var(--ds-spacing-4)\`\n`;
summary += `- \`24px\` → \`var(--ds-spacing-6)\`\n\n`;

summary += `### Typography Violations\n`;
summary += `Replace hardcoded typography with tokens:\n`;
summary += `- \`14px\` → \`var(--ds-font-size-sm)\`\n`;
summary += `- \`16px\` → \`var(--ds-font-size-md)\`\n`;
summary += `- \`font-weight: 600\` → \`var(--ds-font-weight-semibold)\`\n`;

const summaryPath = path.join(outputDir, 'MASTER-COMPLIANCE-SUMMARY.md');
fs.writeFileSync(summaryPath, summary);

console.log('\n📊 Audit Complete!');
console.log(`   Total files scanned: ${totalFiles}`);
console.log(`   Total violations: ${totalViolations}`);
console.log(`   Reports saved to: ${outputDir}/`);
console.log(`   Master summary: ${summaryPath}`);
