Got it — here’s a drop-in validation gate that fails CI if any module is missing PRD + PRP + ARD + BDD.

You’ll get:
	1.	scripts/validate-docs.mjs (Node script)
	2.	docs/modules/modules.json (single source of truth)
	3.	package.json script entry
	4.	GitHub Actions job snippet

⸻

1) docs/modules/modules.json

{
  "modules": [
    { "id": "listing-management", "name": "Listing Management" },
    { "id": "availability-allocation", "name": "Availability & Allocation" },
    { "id": "booking-management", "name": "Booking Management" },
    { "id": "approval-case-handling", "name": "Approval & Case Handling" },
    { "id": "seasonal-leases", "name": "Seasonal Leases" },
    { "id": "messaging-conversations", "name": "Messaging & Conversations" },
    { "id": "notifications", "name": "Notifications" },
    { "id": "audit-compliance", "name": "Audit & Compliance" },
    { "id": "rbac", "name": "RBAC & Authorization" },
    { "id": "user-organization", "name": "Users & Organizations" },
    { "id": "tenant-subscription", "name": "Tenant & Subscription" },
    { "id": "integrations", "name": "Integrations" },
    { "id": "widgets-public-embed", "name": "Widgets & Public Embed" }
  ]
}


⸻

2) scripts/validate-docs.mjs

#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const required = [
  { kind: "PRD", dir: "docs/prd", prefix: "prd-" },
  { kind: "PRP", dir: "docs/prp", prefix: "prp-" },
  { kind: "ARD", dir: "docs/ard", prefix: "ard-" },
  { kind: "BDD", dir: "docs/bdd", prefix: "bdd-" , suffix: ".feature.md" }
];

function exists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const modulesPath = path.join(ROOT, "docs/modules/modules.json");
  if (!exists(modulesPath)) {
    console.error(`❌ Missing: ${modulesPath}`);
    process.exit(1);
  }

  const { modules } = readJson(modulesPath);
  if (!Array.isArray(modules) || modules.length === 0) {
    console.error("❌ docs/modules/modules.json must contain a non-empty modules array");
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // Validate base folders exist
  for (const r of required) {
    const dirPath = path.join(ROOT, r.dir);
    if (!exists(dirPath)) warnings.push(`⚠️ Missing directory: ${r.dir}`);
  }

  // Validate every module has required files
  for (const m of modules) {
    if (!m?.id) {
      errors.push(`Module entry missing 'id': ${JSON.stringify(m)}`);
      continue;
    }

    for (const r of required) {
      const dirPath = path.join(ROOT, r.dir);
      const filename =
        r.kind === "BDD"
          ? `${r.prefix}${m.id}${r.suffix}`
          : `${r.prefix}${m.id}.md`;

      const full = path.join(dirPath, filename);

      if (!exists(full)) {
        errors.push(`[${m.id}] Missing ${r.kind}: ${path.join(r.dir, filename)}`);
      }
    }
  }

  // Output
  for (const w of warnings) console.warn(w);

  if (errors.length) {
    console.error("\n❌ Documentation validation failed:\n");
    for (const e of errors) console.error(`- ${e}`);
    console.error(`\nFix: Create the missing PRD/PRP/ARD/BDD files for each module.\n`);
    process.exit(1);
  }

  console.log(`✅ Docs validation passed: All modules have PRD + PRP + ARD + BDD files.`);
}

main();


⸻

3) package.json script

{
  "scripts": {
    "docs:validate": "node scripts/validate-docs.mjs"
  }
}


⸻

4) GitHub Actions CI gate (add to your workflow)

- name: Validate docs coverage (PRD/PRP/ARD/BDD)
  run: npm run docs:validate

(If you use pnpm, replace with pnpm docs:validate.)
