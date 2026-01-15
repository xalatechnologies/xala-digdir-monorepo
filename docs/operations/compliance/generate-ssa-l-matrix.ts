/**
 * SSA-L Compliance Matrix Generator
 *
 * This script reads roadmap.yml and generates an SSA-L compliance matrix
 * markdown document for tender/regulatory alignment.
 *
 * SSA-L (Statens Standardavtaler - Leveranseavtale) is the Norwegian
 * government's standard agreement for IT deliveries.
 *
 * Usage: npx tsx ops/compliance/generate-ssa-l-matrix.ts
 *
 * Output: compliance/SSA-L.md
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
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

/** Priority level for roadmap items */
type RoadmapPriority = 'MUST_HAVE' | 'SHOULD_HAVE' | 'NICE_TO_HAVE';

/** SSA-L clause definition */
interface SSALClause {
  id: string;
  name: string;
  description: string;
  category: string;
}

/** Roadmap item structure */
interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  status: RoadmapStatus;
  priority?: RoadmapPriority;
  ssaLClauses?: string[];
  [key: string]: unknown;
}

/** Roadmap phase structure */
interface RoadmapPhase {
  id: string;
  name: string;
  description?: string;
  items: RoadmapItem[];
  [key: string]: unknown;
}

/** Roadmap document structure */
interface RoadmapDoc {
  version: string;
  title: string;
  description?: string;
  phases: RoadmapPhase[];
  [key: string]: unknown;
}

/** Compliance matrix entry */
interface ComplianceEntry {
  clause: SSALClause;
  roadmapItems: Array<{
    id: string;
    title: string;
    status: RoadmapStatus;
    priority?: RoadmapPriority;
  }>;
  complianceStatus: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
}

// =============================================================================
// SSA-L Clause Definitions
// =============================================================================

/**
 * Standard SSA-L clauses relevant to the Digilist Platform
 *
 * These clauses are based on the Norwegian government's SSA-L agreement
 * framework for IT deliveries.
 */
const SSA_L_CLAUSES: SSALClause[] = [
  // Security & Access Control
  {
    id: 'SSA-L-SEC-01',
    name: 'Access Control',
    description: 'Role-based access control (RBAC) must be implemented',
    category: 'Security',
  },
  {
    id: 'SSA-L-SEC-02',
    name: 'Authentication',
    description: 'Secure authentication mechanisms with session management',
    category: 'Security',
  },
  {
    id: 'SSA-L-SEC-03',
    name: 'Data Protection',
    description: 'Personal data must be protected according to GDPR',
    category: 'Security',
  },
  // Audit & Logging
  {
    id: 'SSA-L-AUD-01',
    name: 'Audit Logging',
    description: 'All system operations must be logged for audit purposes',
    category: 'Audit',
  },
  {
    id: 'SSA-L-AUD-02',
    name: 'Audit Trail',
    description: 'Complete audit trail with who, what, when, where',
    category: 'Audit',
  },
  // Multi-tenancy
  {
    id: 'SSA-L-MT-01',
    name: 'Tenant Isolation',
    description: 'Multi-tenant architecture with data isolation',
    category: 'Multi-tenancy',
  },
  {
    id: 'SSA-L-MT-02',
    name: 'Tenant Configuration',
    description: 'Per-tenant configuration and customization',
    category: 'Multi-tenancy',
  },
  // API & Integration
  {
    id: 'SSA-L-API-01',
    name: 'API Standards',
    description: 'RESTful API following industry standards',
    category: 'API',
  },
  {
    id: 'SSA-L-API-02',
    name: 'Error Handling',
    description: 'RFC 7807 compliant error responses',
    category: 'API',
  },
  {
    id: 'SSA-L-API-03',
    name: 'SDK Integration',
    description: 'Client SDK for standardized API access',
    category: 'API',
  },
  // Documentation
  {
    id: 'SSA-L-DOC-01',
    name: 'Technical Documentation',
    description: 'Complete technical documentation for the system',
    category: 'Documentation',
  },
  {
    id: 'SSA-L-DOC-02',
    name: 'User Documentation',
    description: 'End-user documentation and help resources',
    category: 'Documentation',
  },
  // Testing & Quality
  {
    id: 'SSA-L-QA-01',
    name: 'Automated Testing',
    description: 'Comprehensive automated test suite',
    category: 'Quality',
  },
  {
    id: 'SSA-L-QA-02',
    name: 'Accessibility',
    description: 'WCAG 2.1 AA compliance for accessibility',
    category: 'Quality',
  },
];

/**
 * Mapping of roadmap item IDs to SSA-L clauses
 *
 * This mapping is used when roadmap items don't have explicit ssaLClauses
 * defined. It provides a default mapping based on item content.
 */
const DEFAULT_CLAUSE_MAPPINGS: Record<string, string[]> = {
  // P0 - SDK & Architecture
  'P0-01': ['SSA-L-API-03', 'SSA-L-API-01'],
  'P0-02': ['SSA-L-API-02'],
  // P1 - Authentication & Sessions
  'P1-01': ['SSA-L-SEC-02'],
  'P1-02': ['SSA-L-SEC-01'],
  // P2 - Multi-tenancy
  'P2-01': ['SSA-L-MT-01'],
  'P2-02': ['SSA-L-MT-02'],
  // P3 - Core Features
  'P3-01': ['SSA-L-API-01'],
  'P3-02': ['SSA-L-API-01'],
  // P4 - Integration
  'P4-01': ['SSA-L-API-01', 'SSA-L-API-03'],
  'P4-02': ['SSA-L-API-01'],
  // P5 - Audit & Compliance
  'P5-01': ['SSA-L-AUD-01', 'SSA-L-AUD-02'],
  'P5-02': ['SSA-L-SEC-03'],
  // P6 - Infrastructure
  'P6-01': ['SSA-L-QA-01'],
  'P6-02': ['SSA-L-DOC-01'],
  // P7 - Documentation
  'P7-01': ['SSA-L-DOC-01'],
  'P7-02': ['SSA-L-DOC-02'],
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Gets the SSA-L clauses for a roadmap item
 *
 * Uses explicit ssaLClauses if defined, otherwise falls back to default mappings
 */
function getClausesForItem(item: RoadmapItem): string[] {
  // Use explicit clauses if defined
  if (item.ssaLClauses && item.ssaLClauses.length > 0) {
    return item.ssaLClauses;
  }

  // Fall back to default mapping
  return DEFAULT_CLAUSE_MAPPINGS[item.id] || [];
}

/**
 * Determines the compliance status based on roadmap item statuses
 */
function determineComplianceStatus(
  items: Array<{ status: RoadmapStatus }>
): ComplianceEntry['complianceStatus'] {
  if (items.length === 0) {
    return 'NOT_APPLICABLE';
  }

  const doneCount = items.filter((i) => i.status === 'DONE').length;
  const partialCount = items.filter((i) => i.status === 'PARTIAL').length;
  const totalCount = items.length;

  if (doneCount === totalCount) {
    return 'COMPLIANT';
  } else if (doneCount + partialCount > 0) {
    return 'PARTIAL';
  } else {
    return 'NON_COMPLIANT';
  }
}

/**
 * Gets a status emoji for display
 */
function getStatusEmoji(status: ComplianceEntry['complianceStatus']): string {
  switch (status) {
    case 'COMPLIANT':
      return '\u2705'; // ✅
    case 'PARTIAL':
      return '\u26A0\uFE0F'; // ⚠️
    case 'NON_COMPLIANT':
      return '\u274C'; // ❌
    case 'NOT_APPLICABLE':
      return '\u2796'; // ➖
  }
}

/**
 * Gets a status emoji for roadmap item status
 */
function getRoadmapStatusEmoji(status: RoadmapStatus): string {
  switch (status) {
    case 'DONE':
      return '\u2705'; // ✅
    case 'PARTIAL':
      return '\u26A0\uFE0F'; // ⚠️
    case 'MISSING':
      return '\u274C'; // ❌
    case 'PLANNED':
      return '\u23F3'; // ⏳
  }
}

// =============================================================================
// Roadmap Loading
// =============================================================================

/**
 * Loads and parses the roadmap.yml file
 */
async function loadRoadmap(): Promise<RoadmapDoc> {
  const roadmapPath = join(rootDir, 'roadmap.yml');

  if (!existsSync(roadmapPath)) {
    throw new Error(
      `Roadmap file not found: ${roadmapPath}\n` +
        'Create a roadmap.yml file in the project root to generate compliance matrix.'
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
 * Extracts all roadmap items from all phases
 */
function extractAllItems(roadmap: RoadmapDoc): RoadmapItem[] {
  const items: RoadmapItem[] = [];
  for (const phase of roadmap.phases) {
    items.push(...phase.items);
  }
  return items;
}

// =============================================================================
// Compliance Matrix Generation
// =============================================================================

/**
 * Builds the compliance matrix from roadmap items
 */
function buildComplianceMatrix(items: RoadmapItem[]): ComplianceEntry[] {
  const matrix: ComplianceEntry[] = [];

  for (const clause of SSA_L_CLAUSES) {
    // Find all roadmap items that reference this clause
    const relatedItems = items.filter((item) => {
      const itemClauses = getClausesForItem(item);
      return itemClauses.includes(clause.id);
    });

    const entry: ComplianceEntry = {
      clause,
      roadmapItems: relatedItems.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        priority: item.priority,
      })),
      complianceStatus: determineComplianceStatus(relatedItems),
    };

    matrix.push(entry);
  }

  return matrix;
}

/**
 * Groups compliance entries by category
 */
function groupByCategory(matrix: ComplianceEntry[]): Map<string, ComplianceEntry[]> {
  const grouped = new Map<string, ComplianceEntry[]>();

  for (const entry of matrix) {
    const category = entry.clause.category;
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(entry);
  }

  return grouped;
}

// =============================================================================
// Markdown Generation
// =============================================================================

/**
 * Generates the markdown content for the compliance matrix
 */
function generateMarkdown(
  matrix: ComplianceEntry[],
  roadmap: RoadmapDoc
): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString();

  // Header
  lines.push('# SSA-L Compliance Matrix');
  lines.push('');
  lines.push(`> Generated from \`roadmap.yml\` on ${timestamp}`);
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push(`**Roadmap:** ${roadmap.title}`);
  lines.push(`**Version:** ${roadmap.version}`);
  lines.push('');

  // Summary statistics
  const compliantCount = matrix.filter((e) => e.complianceStatus === 'COMPLIANT').length;
  const partialCount = matrix.filter((e) => e.complianceStatus === 'PARTIAL').length;
  const nonCompliantCount = matrix.filter((e) => e.complianceStatus === 'NON_COMPLIANT').length;
  const naCount = matrix.filter((e) => e.complianceStatus === 'NOT_APPLICABLE').length;

  lines.push('### Compliance Summary');
  lines.push('');
  lines.push('| Status | Count | Percentage |');
  lines.push('|--------|-------|------------|');
  lines.push(`| ${getStatusEmoji('COMPLIANT')} Compliant | ${compliantCount} | ${((compliantCount / matrix.length) * 100).toFixed(1)}% |`);
  lines.push(`| ${getStatusEmoji('PARTIAL')} Partial | ${partialCount} | ${((partialCount / matrix.length) * 100).toFixed(1)}% |`);
  lines.push(`| ${getStatusEmoji('NON_COMPLIANT')} Non-Compliant | ${nonCompliantCount} | ${((nonCompliantCount / matrix.length) * 100).toFixed(1)}% |`);
  lines.push(`| ${getStatusEmoji('NOT_APPLICABLE')} Not Applicable | ${naCount} | ${((naCount / matrix.length) * 100).toFixed(1)}% |`);
  lines.push('');

  // Detailed matrix by category
  lines.push('---');
  lines.push('');
  lines.push('## Compliance Matrix by Category');
  lines.push('');

  const grouped = groupByCategory(matrix);

  for (const [category, entries] of grouped) {
    lines.push(`### ${category}`);
    lines.push('');
    lines.push('| Clause | Name | Status | Roadmap Items |');
    lines.push('|--------|------|--------|---------------|');

    for (const entry of entries) {
      const statusEmoji = getStatusEmoji(entry.complianceStatus);
      const itemsList =
        entry.roadmapItems.length > 0
          ? entry.roadmapItems
              .map((item) => `${getRoadmapStatusEmoji(item.status)} ${item.id}`)
              .join(', ')
          : '_None_';

      lines.push(`| ${entry.clause.id} | ${entry.clause.name} | ${statusEmoji} ${entry.complianceStatus} | ${itemsList} |`);
    }

    lines.push('');
  }

  // Detailed clause descriptions
  lines.push('---');
  lines.push('');
  lines.push('## Clause Descriptions');
  lines.push('');

  for (const [category, entries] of grouped) {
    lines.push(`### ${category}`);
    lines.push('');

    for (const entry of entries) {
      lines.push(`#### ${entry.clause.id}: ${entry.clause.name}`);
      lines.push('');
      lines.push(`**Description:** ${entry.clause.description}`);
      lines.push('');
      lines.push(`**Status:** ${getStatusEmoji(entry.complianceStatus)} ${entry.complianceStatus}`);
      lines.push('');

      if (entry.roadmapItems.length > 0) {
        lines.push('**Related Roadmap Items:**');
        lines.push('');
        for (const item of entry.roadmapItems) {
          const priorityText = item.priority ? ` (${item.priority})` : '';
          lines.push(`- ${getRoadmapStatusEmoji(item.status)} **${item.id}**: ${item.title}${priorityText}`);
        }
        lines.push('');
      } else {
        lines.push('**Related Roadmap Items:** _No items mapped to this clause_');
        lines.push('');
      }
    }
  }

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('## Legend');
  lines.push('');
  lines.push('### Compliance Status');
  lines.push('');
  lines.push('| Symbol | Status | Description |');
  lines.push('|--------|--------|-------------|');
  lines.push(`| ${getStatusEmoji('COMPLIANT')} | COMPLIANT | All related roadmap items are complete |`);
  lines.push(`| ${getStatusEmoji('PARTIAL')} | PARTIAL | Some related roadmap items are complete or in progress |`);
  lines.push(`| ${getStatusEmoji('NON_COMPLIANT')} | NON_COMPLIANT | No related roadmap items are complete |`);
  lines.push(`| ${getStatusEmoji('NOT_APPLICABLE')} | NOT_APPLICABLE | No roadmap items mapped to this clause |`);
  lines.push('');
  lines.push('### Roadmap Item Status');
  lines.push('');
  lines.push('| Symbol | Status | Description |');
  lines.push('|--------|--------|-------------|');
  lines.push(`| ${getRoadmapStatusEmoji('DONE')} | DONE | Item is complete |`);
  lines.push(`| ${getRoadmapStatusEmoji('PARTIAL')} | PARTIAL | Item is partially complete |`);
  lines.push(`| ${getRoadmapStatusEmoji('MISSING')} | MISSING | Item implementation is missing |`);
  lines.push(`| ${getRoadmapStatusEmoji('PLANNED')} | PLANNED | Item is planned for future |`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*This document is auto-generated. Do not edit manually.*');
  lines.push('');

  return lines.join('\n');
}

// =============================================================================
// File Output
// =============================================================================

/**
 * Writes the compliance matrix markdown to disk
 */
function writeComplianceMatrix(content: string): void {
  const outputDir = join(rootDir, 'compliance');
  const outputPath = join(outputDir, 'SSA-L.md');

  try {
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    writeFileSync(outputPath, content, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to write compliance matrix: ${error.message}`);
    }
    throw error;
  }
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Main function - generates the SSA-L compliance matrix
 */
async function main(): Promise<void> {
  console.log('SSA-L Compliance Matrix Generator');
  console.log('==================================\n');

  // Load roadmap
  console.log('Loading roadmap.yml...');
  let roadmap: RoadmapDoc;

  try {
    roadmap = await loadRoadmap();
    console.log(`Loaded: ${roadmap.title} (v${roadmap.version})`);
  } catch (error) {
    // If roadmap doesn't exist, generate a sample matrix
    console.log('\nNote: roadmap.yml not found.');
    console.log('Generating sample compliance matrix with placeholder data...\n');

    // Create a minimal roadmap for demonstration
    roadmap = {
      version: '1.0.0',
      title: 'Digilist Platform Roadmap (Sample)',
      phases: [
        {
          id: 'P0',
          name: 'Foundation',
          items: [
            { id: 'P0-01', title: 'SDK-First Architecture', status: 'DONE', priority: 'MUST_HAVE' },
          ],
        },
        {
          id: 'P5',
          name: 'Compliance',
          items: [
            { id: 'P5-01', title: 'Audit Logging', status: 'PARTIAL', priority: 'MUST_HAVE' },
          ],
        },
      ],
    };
  }

  // Extract all items
  const items = extractAllItems(roadmap);
  console.log(`Found ${items.length} roadmap items across ${roadmap.phases.length} phases\n`);

  // Build compliance matrix
  console.log('Building compliance matrix...');
  const matrix = buildComplianceMatrix(items);
  console.log(`Mapped ${SSA_L_CLAUSES.length} SSA-L clauses\n`);

  // Generate markdown
  console.log('Generating markdown...');
  const markdown = generateMarkdown(matrix, roadmap);

  // Write output
  console.log('Writing compliance/SSA-L.md...');
  writeComplianceMatrix(markdown);

  // Summary
  const compliantCount = matrix.filter((e) => e.complianceStatus === 'COMPLIANT').length;
  const partialCount = matrix.filter((e) => e.complianceStatus === 'PARTIAL').length;
  const nonCompliantCount = matrix.filter((e) => e.complianceStatus === 'NON_COMPLIANT').length;

  console.log('\n=== Summary ===');
  console.log(`Total SSA-L clauses: ${matrix.length}`);
  console.log(`Compliant: ${compliantCount}`);
  console.log(`Partial: ${partialCount}`);
  console.log(`Non-Compliant: ${nonCompliantCount}`);
  console.log('\nCompliance matrix generated: compliance/SSA-L.md');
}

// Run the main function
main().catch((error: unknown) => {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exit(1);
});
