/**
 * Auto-Status Runner for Roadmap Verification
 *
 * This script reads roadmap.yml, runs verification checks based on
 * verifiers.config.json, and updates item statuses automatically.
 *
 * Usage: npx tsx ops/roadmap/run-roadmap-checks.ts
 *
 * Features:
 * - Reads roadmap.yml and parses roadmap items
 * - Loads verification rules from verifiers.config.json
 * - Runs repo-scan rules (glob matching, import checking, pattern matching)
 * - Runs Playwright tests for e2e verification
 * - Updates roadmap item statuses based on results
 * - Writes updated roadmap.yml back to disk
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');

// =============================================================================
// Types
// =============================================================================

/** Status values for roadmap items */
type RoadmapStatus = 'DONE' | 'PARTIAL' | 'MISSING' | 'PLANNED';

/** Result of a single verification check */
interface VerificationResult {
  itemId: string;
  ruleName: string;
  passed: boolean;
  message: string;
  details?: string[];
}

/** Aggregated results for an item */
interface ItemVerificationResult {
  itemId: string;
  results: VerificationResult[];
  overallPassed: boolean;
  suggestedStatus: RoadmapStatus;
}

/** Repo-scan rule configuration */
interface RepoScanRule {
  glob: string;
  disallowImport?: string[];
  requireImport?: string[];
  disallowPattern?: string;
  requirePattern?: string;
  inFilesMatching?: string;
  minOccurrences?: number;
  message: string;
}

/** Playwright test configuration */
interface PlaywrightTest {
  name: string;
  file: string;
  description: string;
}

/** Single verifier configuration (repo-scan type) */
interface RepoScanVerifier {
  type: 'repo-scan';
  description: string;
  rules: RepoScanRule[];
}

/** Single verifier configuration (playwright type) */
interface PlaywrightVerifier {
  type: 'playwright';
  description: string;
  tests: PlaywrightTest[];
}

/** Composite verifier configuration */
interface CompositeVerifier {
  type: 'composite';
  description: string;
  verifiers: Array<{ type: 'repo-scan'; rules: RepoScanRule[] } | { type: 'playwright'; tests: PlaywrightTest[] }>;
  requiredAuditFields?: string[];
}

/** Union type for all verifier types */
type VerifierConfig = RepoScanVerifier | PlaywrightVerifier | CompositeVerifier;

/** Verifiers configuration file structure */
type VerifiersConfig = Record<string, VerifierConfig>;

/** Roadmap item structure (minimal for status update) */
interface RoadmapItem {
  id: string;
  title: string;
  status: RoadmapStatus;
  [key: string]: unknown;
}

/** Roadmap phase structure */
interface RoadmapPhase {
  id: string;
  name: string;
  items: RoadmapItem[];
  [key: string]: unknown;
}

/** Roadmap document structure */
interface RoadmapDoc {
  version: string;
  title: string;
  phases: RoadmapPhase[];
  [key: string]: unknown;
}

// =============================================================================
// File System Utilities
// =============================================================================

/**
 * Lists files matching a glob pattern recursively
 *
 * @param pattern - Glob pattern to match (e.g., "apps/**\/*.ts")
 * @param baseDir - Base directory to start searching from
 * @returns Array of file paths relative to baseDir
 */
function listFiles(pattern: string, baseDir: string = rootDir): string[] {
  const files: string[] = [];

  // Parse the glob pattern
  const parts = pattern.split('/');
  const isRecursive = parts.includes('**');

  // Extract the base path and file pattern
  let searchPath = baseDir;
  let filePattern = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === '**') {
      filePattern = parts.slice(i + 1).join('/');
      break;
    } else if (part.includes('*') || part.includes('{')) {
      filePattern = parts.slice(i).join('/');
      break;
    } else {
      searchPath = join(searchPath, part);
    }
  }

  // Convert file pattern to regex
  const patternRegex = globToRegex(filePattern || pattern);

  /**
   * Recursively search directory for matching files
   */
  function searchDirectory(dir: string): void {
    if (!existsSync(dir)) {
      return;
    }

    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      let stat;

      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        if (isRecursive) {
          searchDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const relativePath = relative(searchPath, fullPath);
        if (patternRegex.test(relativePath) || patternRegex.test(entry)) {
          files.push(relative(baseDir, fullPath));
        }
      }
    }
  }

  searchDirectory(searchPath);
  return files;
}

/**
 * Converts a glob pattern to a RegExp
 *
 * @param glob - Glob pattern (e.g., "*.ts", "*.{ts,tsx}")
 * @returns RegExp matching the glob pattern
 */
function globToRegex(glob: string): RegExp {
  let regexStr = glob
    // Escape special regex characters except * and {}
    .replace(/[.+^$|\\()[\]]/g, '\\$&')
    // Handle brace expansion {a,b,c}
    .replace(/\{([^}]+)\}/g, '($1)')
    .replace(/,/g, '|')
    // Handle ** (match any path)
    .replace(/\*\*/g, '.*')
    // Handle * (match any filename chars)
    .replace(/\*/g, '[^/]*');

  return new RegExp(`^${regexStr}$`);
}

/**
 * Checks if a file matches a glob pattern
 */
function matchesGlob(filePath: string, pattern: string): boolean {
  const regex = globToRegex(pattern);
  return regex.test(filePath);
}

// =============================================================================
// Verification Functions
// =============================================================================

/**
 * Executes a repo-scan rule and returns results
 *
 * @param rule - The repo-scan rule to execute
 * @param itemId - The roadmap item ID being verified
 * @returns VerificationResult indicating pass/fail
 */
function repoScanRule(rule: RepoScanRule, itemId: string): VerificationResult {
  const files = listFiles(rule.glob, rootDir);
  const violations: string[] = [];
  const matches: string[] = [];

  for (const file of files) {
    const fullPath = join(rootDir, file);

    // Check if file matches additional filter
    if (rule.inFilesMatching && !matchesGlob(file, rule.inFilesMatching)) {
      continue;
    }

    let content: string;
    try {
      content = readFileSync(fullPath, 'utf-8');
    } catch {
      continue;
    }

    // Check disallowed imports
    if (rule.disallowImport) {
      for (const disallowed of rule.disallowImport) {
        const importRegex = new RegExp(`import\\s+.*['"]${disallowed}['"]|require\\s*\\(['"]${disallowed}['"]\\)`, 'g');
        if (importRegex.test(content)) {
          violations.push(`${file}: Found disallowed import '${disallowed}'`);
        }
      }
    }

    // Check required imports
    if (rule.requireImport) {
      for (const required of rule.requireImport) {
        const importRegex = new RegExp(`import\\s+.*['"]${required}['"]|from\\s+['"]${required}['"]`, 'g');
        if (importRegex.test(content)) {
          matches.push(`${file}: Found required import '${required}'`);
        }
      }
    }

    // Check disallowed patterns
    if (rule.disallowPattern) {
      const patternRegex = new RegExp(rule.disallowPattern, 'g');
      if (patternRegex.test(content)) {
        violations.push(`${file}: Found disallowed pattern '${rule.disallowPattern}'`);
      }
    }

    // Check required patterns
    if (rule.requirePattern) {
      const patternRegex = new RegExp(rule.requirePattern, 'g');
      if (patternRegex.test(content)) {
        matches.push(`${file}: Found required pattern '${rule.requirePattern}'`);
      }
    }
  }

  // Determine pass/fail
  let passed = true;
  const details: string[] = [];

  // Fail if any violations
  if (violations.length > 0) {
    passed = false;
    details.push(...violations);
  }

  // Fail if required import/pattern not found enough times
  if (rule.requireImport && rule.minOccurrences !== undefined) {
    if (matches.length < rule.minOccurrences) {
      passed = false;
      details.push(`Required minimum ${rule.minOccurrences} occurrences, found ${matches.length}`);
    }
  }

  return {
    itemId,
    ruleName: rule.message,
    passed,
    message: passed ? 'Rule passed' : 'Rule failed',
    details: details.length > 0 ? details : undefined,
  };
}

/**
 * Runs Playwright tests and returns results
 *
 * @param tests - Array of Playwright test configurations
 * @param itemId - The roadmap item ID being verified
 * @returns VerificationResult indicating pass/fail
 */
function runPlaywright(tests: PlaywrightTest[], itemId: string): VerificationResult {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  for (const test of tests) {
    const testPath = join(rootDir, test.file);

    // Check if test file exists
    if (!existsSync(testPath)) {
      results.push({
        name: test.name,
        passed: false,
        error: `Test file not found: ${test.file}`,
      });
      continue;
    }

    // Try to run Playwright test
    try {
      execSync(`npx playwright test "${test.file}" --reporter=list`, {
        cwd: rootDir,
        stdio: 'pipe',
        timeout: 120000, // 2 minute timeout per test
      });
      results.push({ name: test.name, passed: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        name: test.name,
        passed: false,
        error: `Test failed: ${message.slice(0, 200)}`,
      });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  return {
    itemId,
    ruleName: `Playwright tests (${passedCount}/${totalCount} passed)`,
    passed: allPassed,
    message: allPassed ? 'All Playwright tests passed' : 'Some Playwright tests failed',
    details: results.filter((r) => !r.passed).map((r) => `${r.name}: ${r.error}`),
  };
}

/**
 * Maps verification results to a roadmap status
 *
 * @param results - Array of verification results for an item
 * @returns Suggested roadmap status based on results
 */
function mapResultToStatus(results: VerificationResult[]): RoadmapStatus {
  if (results.length === 0) {
    return 'PLANNED';
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const passRate = passedCount / totalCount;

  if (passRate === 1) {
    return 'DONE';
  } else if (passRate >= 0.5) {
    return 'PARTIAL';
  } else {
    return 'MISSING';
  }
}

// =============================================================================
// Main Verification Logic
// =============================================================================

/**
 * Runs all verifications for a single roadmap item
 *
 * @param itemId - The roadmap item ID to verify
 * @param config - The verifier configuration for this item
 * @returns Aggregated verification results
 */
function verifyItem(itemId: string, config: VerifierConfig): ItemVerificationResult {
  const results: VerificationResult[] = [];

  switch (config.type) {
    case 'repo-scan':
      for (const rule of config.rules) {
        results.push(repoScanRule(rule, itemId));
      }
      break;

    case 'playwright':
      results.push(runPlaywright(config.tests, itemId));
      break;

    case 'composite':
      for (const verifier of config.verifiers) {
        if (verifier.type === 'repo-scan') {
          for (const rule of verifier.rules) {
            results.push(repoScanRule(rule, itemId));
          }
        } else if (verifier.type === 'playwright') {
          results.push(runPlaywright(verifier.tests, itemId));
        }
      }
      break;
  }

  const overallPassed = results.every((r) => r.passed);
  const suggestedStatus = mapResultToStatus(results);

  return {
    itemId,
    results,
    overallPassed,
    suggestedStatus,
  };
}

/**
 * Loads the verifiers configuration file
 *
 * @returns Parsed verifiers configuration
 */
function loadVerifiersConfig(): VerifiersConfig {
  const configPath = join(__dirname, 'verifiers.config.json');

  if (!existsSync(configPath)) {
    throw new Error(`Verifiers config not found: ${configPath}`);
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as VerifiersConfig;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load verifiers config: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Loads and parses the roadmap.yml file
 *
 * Note: Requires 'yaml' package for YAML parsing
 * Install with: pnpm add yaml
 *
 * @returns Parsed roadmap document
 */
async function loadRoadmap(): Promise<RoadmapDoc> {
  const roadmapPath = join(rootDir, 'roadmap.yml');

  if (!existsSync(roadmapPath)) {
    throw new Error(
      `Roadmap file not found: ${roadmapPath}\n` +
        'Create a roadmap.yml file in the project root to use auto-status checking.'
    );
  }

  try {
    // Dynamic import for yaml package
    const yaml = await import('yaml');
    const content = readFileSync(roadmapPath, 'utf-8');
    return yaml.parse(content) as RoadmapDoc;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load roadmap: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Saves the updated roadmap document back to disk
 *
 * @param roadmap - Updated roadmap document
 */
async function saveRoadmap(roadmap: RoadmapDoc): Promise<void> {
  const roadmapPath = join(rootDir, 'roadmap.yml');

  try {
    // Dynamic import for yaml package
    const yaml = await import('yaml');
    const content = yaml.stringify(roadmap, { indent: 2 });
    writeFileSync(roadmapPath, content, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save roadmap: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Updates roadmap item statuses based on verification results
 *
 * @param roadmap - Roadmap document to update
 * @param verificationResults - Map of item IDs to verification results
 * @returns Updated roadmap document
 */
function updateRoadmapStatuses(
  roadmap: RoadmapDoc,
  verificationResults: Map<string, ItemVerificationResult>
): RoadmapDoc {
  for (const phase of roadmap.phases) {
    for (const item of phase.items) {
      const result = verificationResults.get(item.id);
      if (result) {
        item.status = result.suggestedStatus;
      }
    }
  }
  return roadmap;
}

/**
 * Prints verification results to console
 *
 * @param results - Map of item IDs to verification results
 */
function printResults(results: Map<string, ItemVerificationResult>): void {
  console.log('\n=== Verification Results ===\n');

  for (const [itemId, result] of results) {
    const statusIcon = result.overallPassed ? '\u2713' : '\u2717';
    console.log(`${statusIcon} ${itemId}: ${result.suggestedStatus}`);

    for (const r of result.results) {
      const icon = r.passed ? '  \u2713' : '  \u2717';
      console.log(`${icon} ${r.ruleName}`);

      if (r.details && r.details.length > 0) {
        for (const detail of r.details.slice(0, 5)) {
          console.log(`      ${detail}`);
        }
        if (r.details.length > 5) {
          console.log(`      ... and ${r.details.length - 5} more`);
        }
      }
    }
    console.log('');
  }
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Main function - runs the roadmap verification process
 */
async function main(): Promise<void> {
  console.log('Roadmap Auto-Status Runner');
  console.log('==========================\n');

  // Load verifiers configuration
  console.log('Loading verifiers configuration...');
  const verifiersConfig = loadVerifiersConfig();
  const verifierIds = Object.keys(verifiersConfig);
  console.log(`Found ${verifierIds.length} verifiers: ${verifierIds.join(', ')}\n`);

  // Run verifications
  console.log('Running verifications...\n');
  const verificationResults = new Map<string, ItemVerificationResult>();

  for (const [itemId, config] of Object.entries(verifiersConfig)) {
    console.log(`Verifying ${itemId}...`);
    const result = verifyItem(itemId, config);
    verificationResults.set(itemId, result);
  }

  // Print results
  printResults(verificationResults);

  // Check if roadmap.yml exists before attempting to update
  const roadmapPath = join(rootDir, 'roadmap.yml');
  if (existsSync(roadmapPath)) {
    console.log('Updating roadmap.yml...');
    const roadmap = await loadRoadmap();
    const updatedRoadmap = updateRoadmapStatuses(roadmap, verificationResults);
    await saveRoadmap(updatedRoadmap);
    console.log('Roadmap updated successfully!');
  } else {
    console.log('\nNote: roadmap.yml not found - skipping status updates.');
    console.log('Create a roadmap.yml file to enable automatic status updates.');
  }

  // Summary
  const passedCount = [...verificationResults.values()].filter((r) => r.overallPassed).length;
  const totalCount = verificationResults.size;

  console.log('\n=== Summary ===');
  console.log(`Items verified: ${totalCount}`);
  console.log(`Items passing: ${passedCount}`);
  console.log(`Items failing: ${totalCount - passedCount}`);
}

// Run the main function
main().catch((error: unknown) => {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
