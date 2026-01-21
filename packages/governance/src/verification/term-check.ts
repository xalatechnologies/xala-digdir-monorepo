/**
 * Term Check Verification Tool
 *
 * Scans the codebase for banned terms and enforces consistent terminology.
 *
 * Banned Terms:
 * - "listing" -> Use "rentalObject" instead
 * - "facility" -> Use "amenity" instead
 *
 * This tool complements the ESLint rule by providing a standalone scanner
 * that can check files ESLint might miss (configs, docs, etc.)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

/**
 * Result of a term check violation
 */
export interface TermViolation {
  file: string;
  line: number;
  column: number;
  term: string;
  replacement: string;
  context: string;
}

/**
 * Configuration for term checking
 */
export interface TermCheckConfig {
  /** Root directory to scan */
  rootDir: string;
  /** Directories to scan (relative to root) */
  scanDirs: string[];
  /** Banned terms and their replacements */
  bannedTerms: Record<string, string>;
  /** File extensions to scan */
  extensions: string[];
  /** Directories to ignore */
  ignoreDirs: string[];
  /** Files to ignore (glob patterns) */
  ignoreFiles: string[];
  /** Case-sensitive matching */
  caseSensitive: boolean;
}

/**
 * Default configuration for term checking
 */
export const defaultTermConfig: TermCheckConfig = {
  rootDir: process.cwd(),
  scanDirs: ['apps', 'packages'],
  bannedTerms: {
    listing: 'rentalObject',
    facility: 'amenity',
  },
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'],
  ignoreDirs: ['node_modules', 'dist', 'build', '.git', 'coverage'],
  ignoreFiles: ['package-lock.json', 'pnpm-lock.yaml', '*.min.js'],
  caseSensitive: false,
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
 * Check if a file should be ignored
 */
function shouldIgnoreFile(filePath: string, ignoreFiles: string[]): boolean {
  const fileName = filePath.split('/').pop() || '';

  for (const pattern of ignoreFiles) {
    if (pattern.startsWith('*')) {
      const ext = pattern.slice(1);
      if (fileName.endsWith(ext)) return true;
    } else if (fileName === pattern) {
      return true;
    }
  }

  return false;
}

/**
 * Check a single file for banned terms
 */
function checkFile(
  filePath: string,
  bannedTerms: Record<string, string>,
  caseSensitive: boolean
): TermViolation[] {
  const violations: TermViolation[] = [];

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      const searchLine = caseSensitive ? line : line.toLowerCase();

      for (const [term, replacement] of Object.entries(bannedTerms)) {
        const searchTerm = caseSensitive ? term : term.toLowerCase();
        let index = searchLine.indexOf(searchTerm);

        while (index !== -1) {
          // Check if it's a word boundary (not part of a larger word that's acceptable)
          const before = searchLine[index - 1] || ' ';
          const after = searchLine[index + searchTerm.length] || ' ';

          // Skip if part of the replacement term
          const contextStart = Math.max(0, index - 10);
          const contextEnd = Math.min(searchLine.length, index + searchTerm.length + 10);
          const context = line.substring(contextStart, contextEnd);

          if (!context.toLowerCase().includes(replacement.toLowerCase())) {
            violations.push({
              file: filePath,
              line: lineNumber,
              column: index + 1,
              term: line.substring(index, index + term.length),
              replacement,
              context: line.trim().substring(0, 100),
            });
          }

          index = searchLine.indexOf(searchTerm, index + 1);
        }
      }
    }
  } catch {
    // Skip files we can't read
  }

  return violations;
}

/**
 * Check all files for banned terms
 */
export function checkTerms(
  config: Partial<TermCheckConfig> = {}
): TermViolation[] {
  const fullConfig = { ...defaultTermConfig, ...config };
  const violations: TermViolation[] = [];

  for (const scanDir of fullConfig.scanDirs) {
    const dirPath = join(fullConfig.rootDir, scanDir);
    const files = getAllFiles(
      dirPath,
      fullConfig.extensions,
      fullConfig.ignoreDirs
    );

    for (const file of files) {
      if (shouldIgnoreFile(file, fullConfig.ignoreFiles)) {
        continue;
      }

      const fileViolations = checkFile(
        file,
        fullConfig.bannedTerms,
        fullConfig.caseSensitive
      );
      violations.push(...fileViolations);
    }
  }

  return violations;
}

/**
 * Format violations for console output
 */
export function formatTermViolations(violations: TermViolation[]): string {
  if (violations.length === 0) {
    return '✓ No banned terms found';
  }

  const lines: string[] = [
    `✗ Found ${violations.length} banned term(s):`,
    '',
  ];

  // Group by file
  const byFile = new Map<string, TermViolation[]>();
  for (const v of violations) {
    const existing = byFile.get(v.file) || [];
    existing.push(v);
    byFile.set(v.file, existing);
  }

  for (const [file, fileViolations] of byFile) {
    lines.push(`  ${file}`);

    for (const v of fileViolations) {
      lines.push(`    Line ${v.line}:${v.column}: "${v.term}" → Use "${v.replacement}"`);
      lines.push(`      ${v.context}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate a summary of violations by term
 */
export function summarizeViolations(
  violations: TermViolation[]
): Record<string, number> {
  const summary: Record<string, number> = {};

  for (const v of violations) {
    const term = v.term.toLowerCase();
    summary[term] = (summary[term] || 0) + 1;
  }

  return summary;
}

/**
 * Run term check as a CLI tool
 */
export async function runTermCheck(): Promise<void> {
  console.log('Running term check...\n');

  const violations = checkTerms();
  console.log(formatTermViolations(violations));

  if (violations.length > 0) {
    console.log('\nSummary:');
    const summary = summarizeViolations(violations);
    for (const [term, count] of Object.entries(summary)) {
      console.log(`  "${term}": ${count} occurrence(s)`);
    }

    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTermCheck();
}
