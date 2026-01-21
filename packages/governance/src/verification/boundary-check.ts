/**
 * Boundary Check Verification Tool
 *
 * Verifies that platform packages (@xala/*) do not import from
 * @digilist/* packages, maintaining proper architectural boundaries.
 *
 * Architecture Rule:
 * - @xala/* packages are platform-level (generic, reusable)
 * - @digilist/* packages are domain-specific (business logic)
 * - Platform packages should NOT depend on domain packages
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * Result of a boundary violation check
 */
export interface BoundaryViolation {
  file: string;
  line: number;
  importStatement: string;
  message: string;
}

/**
 * Configuration for boundary checking
 */
export interface BoundaryCheckConfig {
  /** Root directory to scan */
  rootDir: string;
  /** Packages to check (platform packages) */
  platformPackages: string[];
  /** Forbidden import patterns */
  forbiddenImports: RegExp[];
  /** File extensions to scan */
  extensions: string[];
  /** Directories to ignore */
  ignoreDirs: string[];
}

/**
 * Default configuration for boundary checking
 */
export const defaultBoundaryConfig: BoundaryCheckConfig = {
  rootDir: process.cwd(),
  platformPackages: [
    'packages/sdk-core',
    'packages/contracts',
    'packages/ds',
    'packages/ds-themes',
    'packages/ds-registry',
    'packages/i18n',
    'packages/auth',
    'packages/observability',
    'packages/config',
    'packages/runtime',
    'packages/governance',
  ],
  forbiddenImports: [
    /@digilist\//,
  ],
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  ignoreDirs: ['node_modules', 'dist', 'build', '.git'],
};

/**
 * Recursively get all files in a directory
 */
function getAllFiles(
  dir: string,
  extensions: string[],
  ignoreDirs: string[]
): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);

      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          if (!ignoreDirs.includes(entry)) {
            files.push(...getAllFiles(fullPath, extensions, ignoreDirs));
          }
        } else if (stat.isFile()) {
          if (extensions.some((ext) => entry.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch {
        // Skip files we can't access
      }
    }
  } catch {
    // Skip directories we can't access
  }

  return files;
}

/**
 * Check a single file for boundary violations
 */
function checkFile(
  filePath: string,
  forbiddenImports: RegExp[]
): BoundaryViolation[] {
  const violations: BoundaryViolation[] = [];

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for import statements
      const importMatch = line.match(
        /(?:import|from)\s+['"]([^'"]+)['"]/
      );

      if (importMatch) {
        const importPath = importMatch[1];

        for (const pattern of forbiddenImports) {
          if (pattern.test(importPath)) {
            violations.push({
              file: filePath,
              line: lineNumber,
              importStatement: line.trim(),
              message: `Platform package imports forbidden "@digilist/*" package: ${importPath}`,
            });
          }
        }
      }
    }
  } catch {
    // Skip files we can't read
  }

  return violations;
}

/**
 * Check all platform packages for boundary violations
 */
export function checkBoundaries(
  config: Partial<BoundaryCheckConfig> = {}
): BoundaryViolation[] {
  const fullConfig = { ...defaultBoundaryConfig, ...config };
  const violations: BoundaryViolation[] = [];

  for (const pkg of fullConfig.platformPackages) {
    const pkgPath = join(fullConfig.rootDir, pkg, 'src');
    const files = getAllFiles(
      pkgPath,
      fullConfig.extensions,
      fullConfig.ignoreDirs
    );

    for (const file of files) {
      const fileViolations = checkFile(file, fullConfig.forbiddenImports);
      violations.push(...fileViolations);
    }
  }

  return violations;
}

/**
 * Format violations for console output
 */
export function formatViolations(violations: BoundaryViolation[]): string {
  if (violations.length === 0) {
    return '✓ No boundary violations found';
  }

  const lines: string[] = [
    `✗ Found ${violations.length} boundary violation(s):`,
    '',
  ];

  for (const v of violations) {
    lines.push(`  ${v.file}:${v.line}`);
    lines.push(`    ${v.importStatement}`);
    lines.push(`    → ${v.message}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Run boundary check as a CLI tool
 */
export async function runBoundaryCheck(): Promise<void> {
  console.log('Running boundary check...\n');

  const violations = checkBoundaries();
  console.log(formatViolations(violations));

  if (violations.length > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBoundaryCheck();
}
