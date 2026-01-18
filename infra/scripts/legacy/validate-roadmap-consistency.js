#!/usr/bin/env node
/**
 * Roadmap ID Consistency Validator
 *
 * Validates that roadmap IDs are consistent across:
 * - roadmap.yml (source of truth)
 * - tests/journeys/*.spec.ts (E2E tests)
 * - compliance/SSA-L.md (compliance matrix)
 *
 * @see roadmap.yml for feature definitions
 * @see compliance/SSA-L.md for SSA-L compliance mapping
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// ANSI colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function extractRoadmapIds(content) {
  const regex = /P[0-6]-[0-9]+/g;
  const matches = content.match(regex) || [];
  return [...new Set(matches)].sort();
}

function getRoadmapItemsFromYaml(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const roadmap = yaml.parse(content);
  const items = [];

  for (const phase of roadmap.phases || []) {
    for (const item of phase.items || []) {
      items.push({
        id: item.id,
        title: item.title,
        status: item.status,
        description: item.description,
      });
    }
  }

  return items;
}

function getTestFileIds(dirPath) {
  const ids = [];

  if (!fs.existsSync(dirPath)) {
    return ids;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.spec.ts'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
    const fileIds = extractRoadmapIds(content);
    ids.push(...fileIds);
  }

  return [...new Set(ids)].sort();
}

function main() {
  log('\n=== Roadmap ID Consistency Validation ===\n', colors.bold);

  const roadmapPath = path.join(process.cwd(), 'roadmap.yml');
  const compliancePath = path.join(process.cwd(), 'compliance', 'SSA-L.md');
  const testsDir = path.join(process.cwd(), 'tests', 'journeys');

  // 1. Extract IDs from roadmap.yml
  log('1. Roadmap Items (roadmap.yml):', colors.cyan);
  const roadmapItems = getRoadmapItemsFromYaml(roadmapPath);
  const roadmapIds = roadmapItems.map(item => item.id).sort();

  for (const item of roadmapItems) {
    const statusColor = {
      'DONE': colors.green,
      'PARTIAL': colors.yellow,
      'MISSING': colors.red,
      'PLANNED': colors.cyan,
    }[item.status] || colors.reset;

    log(`   ${item.id}: ${item.title} [${statusColor}${item.status}${colors.reset}]`);
  }

  // 2. Extract IDs from test files
  log('\n2. Test Coverage (tests/journeys/*.spec.ts):', colors.cyan);
  const testIds = getTestFileIds(testsDir);

  if (testIds.length > 0) {
    log(`   Found ${testIds.length} unique roadmap IDs: ${testIds.join(', ')}`, colors.green);
  } else {
    log('   No roadmap IDs found in test files', colors.yellow);
  }

  // 3. Extract IDs from compliance matrix
  log('\n3. Compliance Coverage (compliance/SSA-L.md):', colors.cyan);
  let complianceIds = [];
  if (fs.existsSync(compliancePath)) {
    const complianceContent = fs.readFileSync(compliancePath, 'utf8');
    complianceIds = extractRoadmapIds(complianceContent);
    log(`   Found ${complianceIds.length} unique roadmap IDs: ${complianceIds.join(', ')}`, colors.green);
  } else {
    log('   Compliance file not found', colors.red);
  }

  // 4. Combined coverage analysis
  log('\n4. Coverage Analysis:', colors.cyan);
  const allCoveredIds = [...new Set([...testIds, ...complianceIds])].sort();
  const uncoveredIds = roadmapIds.filter(id => !allCoveredIds.includes(id));

  log(`   Total roadmap items: ${roadmapIds.length}`);
  log(`   Covered in tests: ${testIds.length}`);
  log(`   Covered in compliance: ${complianceIds.length}`);
  log(`   Combined unique coverage: ${allCoveredIds.length}`);

  // 5. Analyze uncovered items
  log('\n5. Uncovered Items Analysis:', colors.cyan);

  if (uncoveredIds.length === 0) {
    log('   All roadmap items are covered!', colors.green);
  } else {
    for (const id of uncoveredIds) {
      const item = roadmapItems.find(i => i.id === id);
      let reason = 'Unknown';

      // Determine why item isn't covered
      if (item.status === 'DONE') {
        reason = 'Status DONE - verified by existing functionality';
      } else if (item.status === 'PLANNED') {
        reason = 'Status PLANNED - not yet implemented';
      } else if (item.id === 'P0-01') {
        reason = 'Verified via ESLint guardrails (no E2E test needed)';
      }

      log(`   ${id}: ${item.title}`, colors.yellow);
      log(`      Reason: ${reason}`);
    }
  }

  // 6. Consistency checks
  log('\n6. Consistency Checks:', colors.cyan);
  let hasErrors = false;

  // Check for orphan test IDs (in tests but not in roadmap)
  const orphanTestIds = testIds.filter(id => !roadmapIds.includes(id));
  if (orphanTestIds.length > 0) {
    log(`   ❌ Orphan test IDs found: ${orphanTestIds.join(', ')}`, colors.red);
    hasErrors = true;
  } else {
    log('   ✓ No orphan test IDs (all test IDs exist in roadmap)', colors.green);
  }

  // Check for orphan compliance IDs
  const orphanComplianceIds = complianceIds.filter(id => !roadmapIds.includes(id));
  if (orphanComplianceIds.length > 0) {
    log(`   ❌ Orphan compliance IDs found: ${orphanComplianceIds.join(', ')}`, colors.red);
    hasErrors = true;
  } else {
    log('   ✓ No orphan compliance IDs (all compliance IDs exist in roadmap)', colors.green);
  }

  // Summary
  log('\n=== Summary ===', colors.bold);
  log(`Roadmap Items: ${roadmapIds.length}`, colors.cyan);
  log(`Test Coverage: ${testIds.length}/${roadmapIds.length} items`, colors.cyan);
  log(`Compliance Coverage: ${complianceIds.length}/${roadmapIds.length} items`, colors.cyan);
  log(`Combined Coverage: ${allCoveredIds.length}/${roadmapIds.length} items`, colors.cyan);

  // Calculate coverage percentage (excluding DONE and PLANNED items)
  const actionableItems = roadmapItems.filter(
    i => i.status === 'PARTIAL' || i.status === 'MISSING'
  );
  const actionableIds = actionableItems.map(i => i.id);
  const coveredActionable = actionableIds.filter(id => allCoveredIds.includes(id));
  const coveragePercent = actionableIds.length > 0
    ? Math.round((coveredActionable.length / actionableIds.length) * 100)
    : 100;

  log(`\nActionable Items Coverage: ${coveredActionable.length}/${actionableIds.length} (${coveragePercent}%)`,
    coveragePercent >= 80 ? colors.green : colors.yellow);

  if (hasErrors) {
    log('\n❌ Validation FAILED - see errors above', colors.red);
    process.exit(1);
  } else {
    log('\n✓ Validation PASSED - all IDs are consistent', colors.green);
    process.exit(0);
  }
}

main();
